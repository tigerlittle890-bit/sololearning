import { Difficulty, EpicQuest, HunterState, SyncConfig } from '../types/hunter';

export const STORAGE_KEY = 'SOLO_LEVELING_SYSTEM_V2';
export const SYNC_CONFIG_KEY = 'SOLO_LEVELING_SYNC_CONFIG_V2';
export const EXP_PER_LEVEL = 100;
export const DAILY_EXP = 10;
export const DAILY_BONUS_EXP = 20;

export const TITLES: [number, number, string][] = [
  [1, 5, 'Học Viên Tập Sự (Tân Thủ)'],
  [6, 10, 'Học Giả Hạng E'],
  [11, 20, 'Thợ Săn Hạng D'],
  [21, 30, 'Chiến Binh Hạng C'],
  [31, 50, 'Tinh Anh Hạng B'],
  [51, 70, 'Bậc Thầy Hạng A'],
  [71, 90, 'Quốc Bảo Hạng S'],
  [91, 120, 'Quốc Bảo Quốc Gia (Hạng S+)'],
  [121, 160, 'Chúa Tể Bóng Tối (Shadow Monarch)'],
  [161, 9999, 'Chân Vương Bóng Tối · Bất Diệt']
];

export const DIFF_MAP: Record<Difficulty, { vi: string; en: string; exp: number }> = {
  easy: { vi: 'DỄ', en: 'EASY', exp: 20 },
  medium: { vi: 'TRUNG BÌNH', en: 'NORMAL', exp: 50 },
  hard: { vi: 'KHÓ', en: 'HARD', exp: 100 }
};

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function todayStr(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function stamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function deadlineText(v?: string | null): string {
  return v ? String(v).replace('T', ' ') : 'Không giới hạn';
}

export function toLocalInput(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function countdownText(target?: string | null): { text: string; isOverdue: boolean } {
  if (!target) return { text: '— KHÔNG CÓ HẠN —', isOverdue: false };
  const t = new Date(target).getTime();
  if (isNaN(t)) return { text: '— ĐỊNH DẠNG SAI —', isOverdue: false };
  let diff = Math.floor((t - Date.now()) / 1000);
  const isOverdue = diff <= 0;
  diff = Math.abs(diff);

  const d = Math.floor(diff / 86400);
  const h = Math.floor((diff % 86400) / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  const p = (n: number) => String(n).padStart(2, '0');

  const text = `${isOverdue ? 'QUÁ HẠN ' : ''}${d} ngày ${p(h)} giờ ${p(m)} phút ${p(s)} giây`;
  return { text, isOverdue };
}

export function titleFor(level: number): string {
  const row = TITLES.find(([min, max]) => level >= min && level <= max);
  return row ? row[2] : TITLES[TITLES.length - 1][2];
}

export function nextTitleFor(level: number): string {
  const row = TITLES.find(([min]) => min > level);
  return row ? row[2] : 'ĐÃ ĐẠT CẤP ĐỘ CAO NHẤT';
}

export function defaultHunterState(): HunterState {
  const now = new Date();
  const dl = new Date(now.getTime() + 3 * 86400000);
  dl.setHours(21, 0, 0, 0);

  return {
    version: 2,
    playerName: 'Thợ Săn',
    level: 1,
    exp: 0,
    totalExp: 0,
    soundEnabled: true,
    lastActiveDate: todayStr(),
    streak: 1,
    lastStreakDate: todayStr(),
    dailyBonusClaimed: false,
    dailyQuests: [
      { id: uid('d'), text: 'Đọc sách hoặc tài liệu chuyên ngành 30 phút', completed: false },
      { id: uid('d'), text: 'Rèn luyện thể lực: Chống đẩy / Chạy bộ / Gym', completed: false },
      { id: uid('d'), text: 'Luyện ngoại ngữ (Tiếng Anh / Nhật / Hàn) 25 phút', completed: false },
      { id: uid('d'), text: 'Ôn tập kiến thức cốt lõi & ghi chép nhật ký', completed: false }
    ],
    epicQuests: [
      {
        id: uid('e'),
        title: 'Hoàn thành 1 chuyên đề học tập / đồ án mục tiêu',
        deadline: toLocalInput(dl),
        difficulty: 'medium',
        expReward: DIFF_MAP.medium.exp,
        completed: false,
        createdAt: stamp()
      }
    ],
    archivedQuests: [],
    studyLogs: [
      {
        id: uid('l'),
        timestamp: stamp(),
        content: 'Khởi động Hệ Thống Thăng Cấp Thợ Săn. Sẵn sàng đồng bộ đa thiết bị và duy trì kỷ luật mỗi ngày.'
      }
    ],
    stats: { dailyCompleted: 0, epicCompleted: 0, daysActive: 1 },
    updatedAt: Date.now()
  };
}

export function defaultSyncConfig(): SyncConfig {
  return {
    syncCode: null,
    autoSync: true,
    forceOffline: false,
    offlineDisplayMode: 'banner',
    notifyNetworkChanges: true,
    lastSyncedAt: null,
    pendingSync: false,
    linkedDeviceCount: 1
  };
}

export function loadSyncConfig(): SyncConfig {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    if (!raw) return defaultSyncConfig();
    const parsed = JSON.parse(raw);
    return {
      ...defaultSyncConfig(),
      ...parsed
    };
  } catch {
    return defaultSyncConfig();
  }
}

export function saveSyncConfig(cfg: SyncConfig): void {
  try {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(cfg));
  } catch (e) {
    console.error('Failed to save sync config', e);
  }
}

export function sanitizeHunterState(raw: any): { state: HunterState; error?: string } {
  if (!raw || typeof raw !== 'object') {
    return { state: defaultHunterState(), error: 'Dữ liệu không phải là đối tượng hợp lệ.' };
  }

  const base = defaultHunterState();

  const playerName = typeof raw.playerName === 'string' && raw.playerName.trim()
    ? raw.playerName.trim().slice(0, 28)
    : base.playerName;

  const level = typeof raw.level === 'number' && Number.isFinite(raw.level) && raw.level >= 1
    ? Math.floor(raw.level)
    : 1;

  const exp = typeof raw.exp === 'number' && Number.isFinite(raw.exp)
    ? Math.min(EXP_PER_LEVEL - 1, Math.max(0, Math.floor(raw.exp)))
    : 0;

  const totalExp = typeof raw.totalExp === 'number' && Number.isFinite(raw.totalExp) && raw.totalExp >= 0
    ? Math.floor(raw.totalExp)
    : (level - 1) * EXP_PER_LEVEL + exp;

  const dailyQuests = Array.isArray(raw.dailyQuests)
    ? raw.dailyQuests
        .filter((q: any) => q && typeof q.text === 'string' && q.text.trim())
        .map((q: any) => ({
          id: typeof q.id === 'string' ? q.id : uid('d'),
          text: q.text.trim().slice(0, 100),
          completed: Boolean(q.completed)
        }))
    : base.dailyQuests;

  const mapEpic = (q: any, archived = false): EpicQuest => {
    const diff: Difficulty = q.difficulty === 'easy' || q.difficulty === 'hard' ? q.difficulty : 'medium';
    return {
      id: typeof q.id === 'string' ? q.id : uid('e'),
      title: String(q.title || q.text || 'Mục tiêu thợ săn').trim().slice(0, 120),
      deadline: typeof q.deadline === 'string' ? q.deadline.slice(0, 16) : '',
      difficulty: diff,
      expReward: typeof q.expReward === 'number' && q.expReward > 0 ? q.expReward : DIFF_MAP[diff].exp,
      completed: Boolean(q.completed),
      createdAt: typeof q.createdAt === 'string' ? q.createdAt : stamp(),
      completedAt: typeof q.completedAt === 'string' ? q.completedAt : null,
      archived,
      archivedAt: typeof q.archivedAt === 'string' ? q.archivedAt : null
    };
  };

  const epicQuests = Array.isArray(raw.epicQuests)
    ? raw.epicQuests.filter((q: any) => q && (typeof q.title === 'string' || typeof q.text === 'string')).map((q: any) => mapEpic(q, false))
    : base.epicQuests;

  const archivedQuests = Array.isArray(raw.archivedQuests)
    ? raw.archivedQuests.filter((q: any) => q && (typeof q.title === 'string' || typeof q.text === 'string')).map((q: any) => mapEpic(q, true))
    : [];

  const studyLogs = Array.isArray(raw.studyLogs)
    ? raw.studyLogs
        .filter((l: any) => l && typeof l.content === 'string' && l.content.trim())
        .map((l: any) => ({
          id: typeof l.id === 'string' ? l.id : uid('l'),
          timestamp: typeof l.timestamp === 'string' ? l.timestamp : stamp(),
          content: l.content.trim().slice(0, 2500),
          edited: Boolean(l.edited)
        }))
    : base.studyLogs;

  const state: HunterState = {
    version: 2,
    playerName,
    level,
    exp,
    totalExp,
    soundEnabled: typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : true,
    lastActiveDate: typeof raw.lastActiveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.lastActiveDate) ? raw.lastActiveDate : todayStr(),
    streak: typeof raw.streak === 'number' && raw.streak >= 0 ? Math.floor(raw.streak) : 0,
    lastStreakDate: typeof raw.lastStreakDate === 'string' ? raw.lastStreakDate : null,
    dailyBonusClaimed: Boolean(raw.dailyBonusClaimed),
    dailyQuests,
    epicQuests,
    archivedQuests,
    studyLogs,
    stats: {
      dailyCompleted: typeof raw.stats?.dailyCompleted === 'number' ? raw.stats.dailyCompleted : 0,
      epicCompleted: typeof raw.stats?.epicCompleted === 'number' ? raw.stats.epicCompleted : 0,
      daysActive: typeof raw.stats?.daysActive === 'number' ? raw.stats.daysActive : 1
    },
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now()
  };

  return { state };
}

export function loadHunterState(): HunterState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Also check legacy V1 key
      const v1 = localStorage.getItem('SOLO_LEVELING_SYSTEM_V1');
      if (v1) {
        const parsed = JSON.parse(v1);
        const { state } = sanitizeHunterState(parsed);
        saveHunterState(state);
        return state;
      }
      const initial = defaultHunterState();
      saveHunterState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    const { state } = sanitizeHunterState(parsed);
    return state;
  } catch {
    const initial = defaultHunterState();
    saveHunterState(initial);
    return initial;
  }
}

export function saveHunterState(state: HunterState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save hunter state to localStorage', e);
  }
}

export function generateMarkdownExport(state: HunterState, syncCode?: string | null): { md: string; filename: string } {
  const doneDaily = state.dailyQuests.filter(q => q.completed).length;
  const totalDaily = state.dailyQuests.length;
  const expPct = Math.round((state.exp / EXP_PER_LEVEL) * 100);

  let md = `# 🛡️ BẢNG TRẠNG THÁI NGƯỜI CHƠI // SOLO LEVELING SYSTEM\n`;
  md += `*Thời điểm xuất dữ liệu: ${stamp()}*\n`;
  if (syncCode) {
    md += `*Mã liên kết đồng bộ thiết bị: ${syncCode}*\n`;
  }
  md += `\n## 1. THÔNG TIN THỢ SĂN\n`;
  md += `- **Tên người chơi:** ${state.playerName}\n`;
  md += `- **Cấp độ (Level):** ${state.level}\n`;
  md += `- **Danh hiệu:** ${titleFor(state.level)}\n`;
  md += `- **Kinh nghiệm:** ${state.exp} / ${EXP_PER_LEVEL} EXP (${expPct}%)\n`;
  md += `- **Tổng EXP tích lũy:** ${state.totalExp} EXP\n`;
  md += `- **Chuỗi ngày kỷ luật:** ${state.streak} ngày\n`;
  md += `- **Còn lại để thăng cấp:** ${EXP_PER_LEVEL - state.exp} EXP\n`;

  md += `\n## 2. NHIỆM VỤ HÀNG NGÀY (DAILY QUESTS)\n`;
  md += `*Tiến độ hôm nay: ${doneDaily}/${totalDaily} nhiệm vụ · Ngày hoạt động: ${state.lastActiveDate}*\n\n`;
  if (state.dailyQuests.length) {
    state.dailyQuests.forEach(q => {
      md += `- [${q.completed ? 'x' : ' '}] ${q.text}\n`;
    });
  } else {
    md += `*(Chưa có nhiệm vụ hàng ngày)*\n`;
  }

  md += `\n## 3. NHIỆM VỤ MỤC TIÊU & HẠN CHÓT (EPIC QUESTS)\n\n`;
  if (state.epicQuests.length) {
    state.epicQuests.forEach(q => {
      const d = DIFF_MAP[q.difficulty] || DIFF_MAP.medium;
      const over = q.deadline && new Date(q.deadline).getTime() < Date.now() && !q.completed ? ' · ⚠ QUÁ HẠN' : '';
      md += `- [${q.completed ? 'x' : ' '}] **${q.title}** (Độ khó: ${d.en} / ${d.vi} | +${q.expReward} EXP) - Hạn: ${deadlineText(q.deadline)}${over}${q.completed && q.completedAt ? ` · ✅ Hoàn thành: ${q.completedAt}` : ''}\n`;
    });
  } else {
    md += `*(Chưa có nhiệm vụ mục tiêu)*\n`;
  }

  if (state.archivedQuests.length) {
    md += `\n## 4. KHO LƯU TRỮ NHIỆM VỤ (ARCHIVE)\n\n`;
    state.archivedQuests.forEach(q => {
      const d = DIFF_MAP[q.difficulty] || DIFF_MAP.medium;
      md += `- **${q.title}** (Độ khó: ${d.en} | +${q.expReward} EXP) - Hạn: ${deadlineText(q.deadline)} · Lưu trữ: ${q.archivedAt || '—'}\n`;
    });
  }

  md += `\n## ${state.archivedQuests.length ? '5' : '4'}. NHẬT KÝ RÈN LUYỆN (STUDY LOGS)\n\n`;
  if (state.studyLogs.length) {
    state.studyLogs.slice().reverse().forEach(l => {
      md += `- **[${l.timestamp}]**: ${l.content.replace(/\n/g, ' / ')}\n`;
    });
  } else {
    md += `*(Chưa có ghi chú)*\n`;
  }

  md += `\n## THỐNG KÊ TỔNG HỢP\n`;
  md += `- Nhiệm vụ hàng ngày hoàn thành: ${state.stats.dailyCompleted}\n`;
  md += `- Nhiệm vụ mục tiêu hoàn thành: ${state.stats.epicCompleted}\n`;
  md += `- Số ngày hệ thống hoạt động: ${state.stats.daysActive}\n`;
  md += `- Số bản ghi nhật ký: ${state.studyLogs.length}\n`;

  md += `\n---\n### DỮ LIỆU ĐỒNG BỘ HỆ THỐNG (DO NOT EDIT THE BLOCK BELOW)\n`;
  md += '```json\n' + JSON.stringify(state, null, 2) + '\n```\n';

  const now = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  const filename = `SoloLeveling_Backup_${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}_${p(now.getHours())}-${p(now.getMinutes())}.md`;

  return { md, filename };
}

export function extractJsonFromText(text: string): HunterState {
  if (!text || !text.trim()) {
    throw new Error('Nội dung file rỗng.');
  }

  const fence = text.match(/```json([\s\S]*?)```/i) || text.match(/```([\s\S]*?)```/);
  const rawCandidate = (fence ? fence[1] : text).trim();

  // Find balanced curly brackets
  const start = rawCandidate.indexOf('{');
  if (start < 0) {
    throw new Error('Không tìm thấy khối JSON dữ liệu trong file.');
  }

  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;

  for (let i = start; i < rawCandidate.length; i++) {
    const c = rawCandidate[i];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (c === '\\') {
        esc = true;
      } else if (c === '"') {
        inStr = false;
      }
    } else {
      if (c === '"') {
        inStr = true;
      } else if (c === '{') {
        depth++;
      } else if (c === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
  }

  if (end === -1) {
    throw new Error('Khối JSON không hoàn chỉnh hoặc bị cắt ngắn.');
  }

  const jsonStr = rawCandidate.slice(start, end + 1);
  const parsed = JSON.parse(jsonStr);
  const { state } = sanitizeHunterState(parsed);
  return state;
}
