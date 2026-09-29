import { HunterState } from '../types/hunter';
import { sanitizeHunterState } from './storage';

export interface CloudSyncResponse {
  code: string;
  data: HunterState;
  updatedAt: number;
  deviceCount?: number;
}

export const syncService = {
  // Check browser network status
  checkNetwork(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  // Ping backend to confirm real connection
  async checkServerHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health', { method: 'GET', cache: 'no-cache' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Generate a random 6-digit link code with initial state
  async generateCode(state: HunterState): Promise<{ code: string; updatedAt: number }> {
    const res = await fetch('/api/sync/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: state })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Không thể tạo mã đồng bộ.');
    }

    return await res.json();
  },

  // Pull latest data by code from cloud
  async fetchByCode(code: string): Promise<CloudSyncResponse> {
    const cleanCode = code.trim();
    if (!cleanCode) {
      throw new Error('Mã đồng bộ không hợp lệ.');
    }

    const res = await fetch(`/api/sync/${encodeURIComponent(cleanCode)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache'
    });

    if (res.status === 404) {
      throw new Error('Mã liên kết không tồn tại hoặc đã hết hạn.');
    }

    if (!res.ok) {
      throw new Error(`Lỗi kết nối máy chủ (${res.status}).`);
    }

    const json = await res.json();
    const { state } = sanitizeHunterState(json.data);

    return {
      code: json.code,
      data: state,
      updatedAt: json.updatedAt,
      deviceCount: json.deviceCount || 1
    };
  },

  // Push local state to cloud for linked code
  async pushUpdate(code: string, state: HunterState): Promise<{ success: boolean; updatedAt: number }> {
    const cleanCode = code.trim();
    if (!cleanCode) {
      throw new Error('Mã đồng bộ không hợp lệ.');
    }

    const res = await fetch(`/api/sync/${encodeURIComponent(cleanCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: state,
        clientUpdatedAt: state.updatedAt || Date.now()
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Không thể đẩy dữ liệu lên máy chủ (${res.status}).`);
    }

    return await res.json();
  }
};
