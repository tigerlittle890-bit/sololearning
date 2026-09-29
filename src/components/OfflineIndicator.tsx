import { WifiOff, Radio, Settings2, CloudOff } from 'lucide-react';
import { SyncConfig } from '../types/hunter';

interface OfflineIndicatorProps {
  isOnline: boolean;
  syncConfig: SyncConfig;
  onOpenSyncModal: () => void;
}

export function OfflineIndicator({ isOnline, syncConfig, onOpenSyncModal }: OfflineIndicatorProps) {
  const isDisconnected = !isOnline || syncConfig.forceOffline;

  if (!isDisconnected && syncConfig.offlineDisplayMode === 'hidden') {
    return null;
  }

  // If connected and not forced offline, show nothing or just subtle status
  if (!isDisconnected) {
    return null;
  }

  if (syncConfig.offlineDisplayMode === 'hidden') {
    return null;
  }

  if (syncConfig.offlineDisplayMode === 'minimal') {
    return (
      <div
        onClick={onOpenSyncModal}
        title={syncConfig.forceOffline ? 'Chế độ buộc Offline đang kích hoạt (Nhấp để đổi)' : 'Không có kết nối mạng · Đang lưu cục bộ'}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/50 shadow-lg shadow-amber-500/10 cursor-pointer backdrop-blur-md text-xs font-mono text-amber-300 hover:border-amber-400 transition-all"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span>OFFLINE</span>
      </div>
    );
  }

  if (syncConfig.offlineDisplayMode === 'badge') {
    return (
      <div
        onClick={onOpenSyncModal}
        className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 font-mono text-xs hover:border-amber-400 transition-colors shadow-sm"
        title="Nhấp để tùy chỉnh đồng bộ và hiển thị offline"
      >
        {syncConfig.forceOffline ? <CloudOff className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
        <span>{syncConfig.forceOffline ? 'BUỘC OFFLINE' : 'NGOẠI TUYẾN (LOCAL)'}</span>
        <Settings2 className="w-3 h-3 opacity-70" />
      </div>
    );
  }

  // Default: 'banner'
  return (
    <div className="mb-4 px-4 py-2.5 rounded border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900/90 to-amber-950/60 shadow-lg shadow-amber-500/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
          {syncConfig.forceOffline ? <Radio className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        </div>
        <div>
          <div className="font-head text-amber-200 font-semibold tracking-wide flex items-center gap-2 text-xs sm:text-sm">
            <span>{syncConfig.forceOffline ? 'CHẾ ĐỘ BUỘC CHẠY CỤC BỘ (LOCAL ONLY)' : 'HỆ THỐNG ĐANG HOẠT ĐỘNG NGOẠI TUYẾN'}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
              LocalStorage Active
            </span>
          </div>
          <p className="text-xs text-amber-300/80 font-body">
            {syncConfig.forceOffline
              ? 'Tất cả thay đổi được lưu trữ an toàn trên thiết bị này. Đám mây tạm thời ngắt kết nối theo yêu cầu của bạn.'
              : 'Mất kết nối internet. Bạn vẫn có thể học tập, tích EXP và tạo nhiệm vụ bình thường. Dữ liệu sẽ tự động đẩy khi có mạng lại.'}
          </p>
        </div>
      </div>
      <button
        onClick={onOpenSyncModal}
        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-amber-400/50 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-head tracking-wider uppercase transition-all"
      >
        <Settings2 className="w-3.5 h-3.5" />
        <span>Tùy Chỉnh Chế Độ</span>
      </button>
    </div>
  );
}
