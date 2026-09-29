import React, { useRef } from 'react';
import { Download, Upload, Copy, Sparkles, RotateCcw, Trash2, AlertOctagon, Database } from 'lucide-react';
import { HunterState } from '../types/hunter';
import { generateMarkdownExport, extractJsonFromText } from '../services/storage';

interface DataManagementProps {
  state: HunterState;
  syncCode?: string | null;
  onImportState: (newState: HunterState, filename: string) => void;
  onImportDemo: () => void;
  onResetDailyChecks: () => void;
  onResetProgress: () => void;
  onResetArchive: () => void;
  onResetLogs: () => void;
  onResetEpicQuests: () => void;
  onFactoryReset: () => void;
  onToast: (text: string, type?: 'info' | 'success' | 'gold' | 'danger') => void;
}

export function DataManagement({
  state,
  syncCode,
  onImportState,
  onImportDemo,
  onResetDailyChecks,
  onResetProgress,
  onResetArchive,
  onResetLogs,
  onResetEpicQuests,
  onFactoryReset,
  onToast
}: DataManagementProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const { md, filename } = generateMarkdownExport(state, syncCode);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    onToast(`Đã xuất file sao lưu: ${filename}`, 'success');
  };

  const handleCopyJson = () => {
    const text = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(text);
    onToast('Đã sao chép khối JSON đồng bộ vào bộ nhớ tạm.', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const content = String(reader.result || '');
        const importedState = extractJsonFromText(content);
        onImportState(importedState, file.name);
      } catch (err: any) {
        onToast(`Lỗi đọc file: ${err.message || 'Dữ liệu không hợp lệ'}`, 'danger');
      }
    };
    reader.onerror = () => {
      onToast('Không thể đọc file. Vui lòng thử lại.', 'danger');
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  return (
    <section className="hud-panel p-4 sm:p-5 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 text-xs font-bold">[05]</span>
          <h3 className="font-head text-xs sm:text-sm font-bold tracking-widest text-cyan-200 uppercase">
            QUẢN LÝ DỮ LIỆU &amp; CỔNG RESET HỆ THỐNG // DATA &amp; SYSTEM RESET
          </h3>
        </div>
        <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" /> LOCALSTORAGE ACTIVE
        </span>
      </div>

      {/* Grid: Export & Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Export Card */}
        <div className="p-4 rounded bg-black/40 border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <h4 className="font-head text-xs font-bold text-cyan-300 tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-cyan-400" />
              ◈ SAO LƯU · EXPORT FILE
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Xuất toàn bộ cấp độ, EXP, nhiệm vụ và nhật ký thành file <b>.md</b> gồm bản tóm tắt dễ đọc cùng khối JSON đồng bộ ở cuối.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 text-xs font-head tracking-wider uppercase font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>XUẤT FILE .MD</span>
            </button>
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-head tracking-wider uppercase transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>COPY JSON</span>
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="p-4 rounded bg-black/40 border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <h4 className="font-head text-xs font-bold text-cyan-300 tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              ◈ PHỤC HỒI · IMPORT FILE
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Nạp lại file <b>.md / .txt / .json</b> đã xuất trước đó. Hệ thống sẽ trích xuất dữ liệu, kiểm tra tính toàn vẹn và xác nhận trước khi cập nhật.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="file"
              ref={fileInputRef}
              accept=".md,.txt,.json,text/plain,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-200 border border-blue-400/40 text-xs font-head tracking-wider uppercase font-bold transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>CHỌN FILE ĐỂ NẠP</span>
            </button>
            <button
              onClick={onImportDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/40 text-xs font-head tracking-wider uppercase transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>NẠP DỮ LIỆU MẪU</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Selective Reset & Factory Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selective Reset Card */}
        <div className="p-4 rounded bg-amber-950/15 border border-amber-500/30">
          <h4 className="font-head text-xs font-bold text-amber-300 tracking-wider uppercase mb-2 flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            ◈ RESET CÓ CHỌN LỌC
          </h4>
          <p className="text-xs text-slate-300 mb-3">
            Làm mới từng phần dữ liệu mong muốn mà không gây ảnh hưởng đến các hạng mục khác.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onResetDailyChecks}
              className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-head uppercase"
            >
              ⟳ Reset tích nhiệm vụ ngày
            </button>
            <button
              onClick={onResetProgress}
              className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-head uppercase"
            >
              ⟳ Reset Cấp độ &amp; EXP
            </button>
            <button
              onClick={onResetArchive}
              className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-head uppercase"
            >
              ⌫ Xóa kho lưu trữ
            </button>
            <button
              onClick={onResetLogs}
              className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-head uppercase"
            >
              ⌫ Xóa toàn bộ nhật ký
            </button>
            <button
              onClick={onResetEpicQuests}
              className="px-2.5 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-head uppercase"
            >
              ⌫ Xóa hết nhiệm vụ mục tiêu
            </button>
          </div>
        </div>

        {/* Factory Reset Card */}
        <div className="p-4 rounded bg-red-950/20 border border-red-500/40 flex flex-col justify-between">
          <div>
            <h4 className="font-head text-xs font-bold text-red-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              ◈ KHÔI PHỤC TRẠNG THÁI GỐC (FACTORY RESET)
            </h4>
            <p className="text-xs text-red-200/80 mb-3 leading-relaxed">
              Xóa 100% dữ liệu trong trình duyệt: cấp độ, EXP, nhiệm vụ, nhật ký và đưa hệ thống về Cấp 1. Hành động này không thể hoàn tác.
            </p>
          </div>
          <div className="pt-2 border-t border-red-500/20">
            <button
              onClick={onFactoryReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/60 text-xs font-head tracking-wider uppercase font-bold transition-all shadow-[0_0_15px_rgba(255,59,107,0.3)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>KHÔI PHỤC TOÀN BỘ HỆ THỐNG</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
