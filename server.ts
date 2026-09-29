import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // File data directory for persistent sync storage across devices
  const DATA_DIR = path.join(__dirname, 'data');
  const DATA_FILE = path.join(DATA_DIR, 'sync-store.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  interface SyncEntry {
    data: unknown;
    updatedAt: number;
    deviceCount: number;
  }

  let syncStore: Record<string, SyncEntry> = {};
  if (fs.existsSync(DATA_FILE)) {
    try {
      syncStore = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (e) {
      console.error('Failed to parse sync-store.json', e);
      syncStore = {};
    }
  }

  function saveStore() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(syncStore, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write sync-store.json', e);
    }
  }

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: Date.now() });
  });

  // Generate random 6-digit sync code
  app.post('/api/sync/generate', (req, res) => {
    let code = '';
    for (let attempts = 0; attempts < 200; attempts++) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
      if (!syncStore[code]) break;
    }
    const initialData = req.body?.data || null;
    const now = Date.now();
    syncStore[code] = {
      data: initialData,
      updatedAt: now,
      deviceCount: 1
    };
    saveStore();
    res.json({ code, updatedAt: now });
  });

  // Get data for a code
  app.get('/api/sync/:code', (req, res) => {
    const code = req.params.code?.trim();
    if (!code || !syncStore[code]) {
      return res.status(404).json({ error: 'Mã đồng bộ không tồn tại hoặc đã hết hạn.' });
    }
    const entry = syncStore[code];
    res.json({
      code,
      data: entry.data,
      updatedAt: entry.updatedAt,
      deviceCount: entry.deviceCount
    });
  });

  // Save / Update data for a code
  app.post('/api/sync/:code', (req, res) => {
    const code = req.params.code?.trim();
    const { data, clientUpdatedAt } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Mã không hợp lệ.' });
    }
    if (!data) {
      return res.status(400).json({ error: 'Thiếu dữ liệu đồng bộ.' });
    }

    const now = Date.now();
    const existing = syncStore[code];
    const prevCount = existing?.deviceCount || 1;

    syncStore[code] = {
      data,
      updatedAt: typeof clientUpdatedAt === 'number' ? clientUpdatedAt : now,
      deviceCount: prevCount
    };
    saveStore();
    res.json({ success: true, code, updatedAt: now });
  });

  // Check if code exists without fetching entire blob
  app.get('/api/sync/:code/status', (req, res) => {
    const code = req.params.code?.trim();
    const entry = syncStore[code];
    if (!entry) {
      return res.status(404).json({ exists: false });
    }
    res.json({
      exists: true,
      updatedAt: entry.updatedAt,
      code
    });
  });

  // In production, serve dist folder if built
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Solo Leveling Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
