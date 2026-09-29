import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  Laptop,
  Wifi,
  WifiOff,
  CloudOff,
  Sliders,
  ShieldCheck,
  Unlink,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { OfflineDisplayMode, SyncConfig } from '../types/hunter';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncConfig: SyncConfig;
  isOnline: boolean;
  isSyncing: boolean;
  onGenerateCode: () => void;
  onConnectCode: (code: string) => void;
  onUnlinkCode: () => void;
  onManualSync: () => void;
  onUpdateConfig: (partial: Partial<SyncConfig>) => void;
  onToast: (text: string, type?: 'info' | 'success' | 'gold' | 'danger') => void;
}

export function SyncModal({
  isOpen,
  onClose,
  syncConfig,
  isOnline,
  isSyncing,
  onGenerateCode,
  onConnectCode,
  onUnlinkCode,
  onManualSync,
  onUpdateConfig,
  onToast
}: SyncModalProps) {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!syncConfig.syncCode) return;
    navigator.clipboard.writeText(syncConfig.syncCode);
    setCopied(true);
    onToast('Đã sao chép mã đồng bộ: ' + syncConfig.syncCode, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim();
    if (!clean) {
      onToast('Vui lòng nhập mã đồng bộ.', 'danger');
      return;
    }
    onConnectCode(clean);
    setInputCode('');
  };

  const displayModes: { id: OfflineDisplayMode; title: string; desc: string }[] = [
    {
      id: 'banner',
      title: 'Banner cảnh báo trên cùng',
      desc: 'Hiển thị thanh cảnh báo viền vàng nổi bật trên cùng khi mất mạng.'
    },
    {
      id: 'badge',
      title: 'Huy hiệu HUD thu gọn',
      desc: 'Hiển thị huy hiệu nhỏ gọn ở thanh điều hướng trên.'
    },
    {
      id: 'minimal',
      title: 'Đèn tín hiệu tối giản',
      desc: 'Chấm đèn LED nhấp nháy nhỏ ở góc dưới màn hình.'
    },
    {
      id: 'hidden',
      title: 'Ẩn hoàn toàn',
      desc: 'Không hiển thị bất kỳ thông báo ngoại tuyến nào trên giao diện.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto hud-panel p-5 sm:p-6 text-slate-100 border border-cyan-500/40 shadow-2xl shadow-cyan-900/40">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="font-head text-base sm:text-lg font-bold text-cyan-300 tracking-wider uppercase">
                Đồng Bộ Đa Thiết Bị (Sync Hub)
              </h2>
              <p className="text-xs text-slate-400">
                Liên kết máy tính và điện thoại thông qua mã số ngẫu nhiên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network & Status pill */}
        <div className="mb-4 p-3 rounded bg-slate-900/60 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Trạng thái mạng:</span>
            {isOnline && !syncConfig.forceOffline ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                <Wifi className="w-3 h-3" /> TRỰC TUYẾN (ONLINE)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {syncConfig.forceOffline ? <CloudOff className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {syncConfig.forceOffline ? 'BUỘC OFFLINE' : 'NGOẠI TUYẾN (LOCAL)'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {syncConfig.lastSyncedAt ? (
              <span className="text-slate-400 font-mono">
                Đồng bộ lần cuối:{' '}
                <span className="text-cyan-400">
                  {new Date(syncConfig.lastSyncedAt).toLocaleTimeString()}
                </span>
              </span>
            ) : (
              <span className="text-slate-500 font-mono">Chưa đồng bộ lên đám mây</span>
            )}
          </div>
        </div>

        {/* Section 1: Current Sync Code */}
        <div className="mb-5 p-4 rounded bg-cyan-950/20 border border-cyan-500/30 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-head text-xs tracking-widest text-cyan-400 uppercase font-semibold">
              MÃ ĐỒNG BỘ HIỆN TẠI CỦA BẠN
            </span>
            {syncConfig.syncCode && (
              <span className="text-[11px] font-mono text-cyan-300/80 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> ĐÃ KÍCH HOẠT
              </span>
            )}
          </div>

          {syncConfig.syncCode ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-black/50 border border-cyan-500/40 rounded">
                <div className="flex items-center gap-1.5">
                  {syncConfig.syncCode.split('').map((char, index) => (
                    <span
                      key={index}
                      className="inline-block w-8 h-10 sm:w-10 sm:h-12 leading-10 sm:leading-12 text-center font-mono text-xl sm:text-2xl font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-400/40 rounded shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                    >
                      {char}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 text-xs font-head tracking-wider uppercase transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'ĐÃ CHÉP' : 'SAO CHÉP MÃ'}</span>
                  </button>

                  <button
                    onClick={onManualSync}
                    disabled={isSyncing || (!isOnline && !syncConfig.forceOffline)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-400/40 text-xs font-head tracking-wider uppercase transition-all disabled:opacity-50"
                    title="Đồng bộ thủ công với đám mây ngay bây giờ"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'ĐANG ĐỒNG BỘ...' : 'ĐỒNG BỘ NGAY'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <Laptop className="w-3.5 h-3.5 text-cyan-400" />
                  Nhập mã này trên bất kỳ điện thoại hoặc PC nào để kết nối chung bảng trạng thái!
                </span>
                <button
                  onClick={onUnlinkCode}
                  className="text-red-400/80 hover:text-red-300 text-[11px] underline flex items-center gap-1 shrink-0 ml-2"
                >
                  <Unlink className="w-3 h-3" /> Ngắt kết nối mã
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-xs text-slate-300">
                Bạn chưa có mã đồng bộ. Tạo một dãy số ngẫu nhiên để bắt đầu đồng bộ hóa giữa điện thoại và máy tính.
              </p>
              <button
                onClick={onGenerateCode}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-gradient-to-r from-cyan-600/40 via-blue-600/40 to-cyan-600/40 hover:from-cyan-500/50 hover:to-blue-500/50 text-cyan-200 border border-cyan-400/60 font-head text-xs tracking-widest uppercase font-bold shadow-lg shadow-cyan-500/20 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>+ TẠO MÃ LIÊN KẾT NGẪU NHIÊN</span>
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Enter code from another device */}
        <div className="mb-5 p-4 rounded bg-slate-900/60 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-head text-xs tracking-widest text-slate-300 uppercase font-semibold">
              NHẬP MÃ TỪ THIẾT BỊ KHÁC
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Đã có mã từ máy tính hoặc điện thoại khác? Nhập dãy số vào đây để kết nối và nhận dữ liệu thợ săn mới nhất.
          </p>
          <form onSubmit={handleConnect} className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={12}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Nhập mã số (vd: 849201)..."
              className="flex-1 px-3 py-2 text-sm font-mono tracking-widest bg-black/60 border border-cyan-500/30 rounded focus:border-cyan-400 focus:outline-none text-cyan-200 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!inputCode.trim() || isSyncing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-gradient-to-r from-blue-600/40 to-cyan-600/40 hover:from-blue-500/50 hover:to-cyan-500/50 text-cyan-200 border border-cyan-400/50 text-xs font-head tracking-wider uppercase font-semibold disabled:opacity-50 transition-all shrink-0"
            >
              <span>LIÊN KẾT &amp; ĐỒNG BỘ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Section 3: Offline display settings customization */}
        <div className="border border-slate-700/50 rounded bg-slate-900/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full p-3 flex items-center justify-between text-left text-xs font-head tracking-wider text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>TÙY CHỈNH CHẾ ĐỘ HIỂN THỊ OFFLINE &amp; MẠNG</span>
            </span>
            <span className="text-[11px] text-slate-500">{showSettings ? '▲ ĐÓNG' : '▼ MỞ RỘNG'}</span>
          </button>

          {showSettings && (
            <div className="p-4 pt-1 border-t border-slate-800 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                  Kiểu hiển thị thông báo ngoại tuyến:
                  <span className="text-slate-500 font-normal">
                    (Chọn cách bạn muốn app thể hiện khi mất internet)
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {displayModes.map((mode) => {
                    const isSelected = syncConfig.offlineDisplayMode === mode.id;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => onUpdateConfig({ offlineDisplayMode: mode.id })}
                        className={`p-2.5 rounded border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-400/80 text-cyan-200 shadow-sm shadow-cyan-500/10'
                            : 'bg-black/30 border-slate-700 hover:border-slate-500 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-head font-bold text-xs">{mode.title}</span>
                          <span
                            className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{mode.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Force offline toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>Buộc chế độ chạy cục bộ (Force Offline)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ngắt tạm thời việc đồng bộ đám mây ngay cả khi có internet. App chỉ lưu dữ liệu vào trình duyệt của bạn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateConfig({ forceOffline: !syncConfig.forceOffline })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    syncConfig.forceOffline ? 'bg-amber-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      syncConfig.forceOffline ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Notify network change toggle */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-200">
                    <span>Thông báo khi trạng thái mạng thay đổi</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Hiển thị thông báo Toast góc màn hình mỗi khi bạn mất hoặc có lại kết nối mạng.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig({ notifyNetworkChanges: !syncConfig.notifyNetworkChanges })
                  }
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    syncConfig.notifyNetworkChanges ? 'bg-cyan-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      syncConfig.notifyNetworkChanges ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            Dữ liệu luôn được lưu vào LocalStorage trước tiên, bảo đảm an toàn 100% khi mất mạng.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-head tracking-wider uppercase"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
