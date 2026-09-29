import React, { useState } from 'react';
import { Save, Search, Edit2, Trash2, X, Check } from 'lucide-react';
import { StudyLog } from '../types/hunter';

interface StudyLogsProps {
  logs: StudyLog[];
  onAddLog: (content: string) => void;
  onEditLog: (id: string, content: string) => void;
  onDeleteLog: (id: string) => void;
}

export function StudyLogs({ logs, onAddLog, onEditLog, onDeleteLog }: StudyLogsProps) {
  const [content, setContent] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = content.trim();
    if (!clean) return;
    onAddLog(clean);
    setContent('');
  };

  const handleStartEdit = (log: StudyLog) => {
    setEditingId(log.id);
    setEditContent(log.content);
  };

  const handleSaveEdit = (id: string) => {
    const clean = editContent.trim();
    if (!clean) return;
    onEditLog(id, clean);
    setEditingId(null);
  };

  const filteredLogs = [...logs].reverse().filter((l) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return l.content.toLowerCase().includes(term) || l.timestamp.toLowerCase().includes(term);
  });

  return (
    <section className="hud-panel p-4 sm:p-5 mb-4 sm:mb-6">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 mb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 text-xs font-bold">[04]</span>
          <h3 className="font-head text-xs sm:text-sm font-bold tracking-widest text-cyan-200 uppercase">
            NHẬT KÝ THỢ SĂN · GHI CHÚ HỌC TẬP // STUDY LOGS
          </h3>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm trong nhật ký..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-black/50 border border-cyan-500/30 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">
        {/* Left: New Log Entry Form */}
        <form onSubmit={handleSave} className="flex flex-col space-y-2">
          <textarea
            maxLength={2500}
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSave(e);
              }
            }}
            placeholder="Ghi lại tiến trình hôm nay, ý tưởng, tóm tắt bài giảng... (Nhấn Ctrl + Enter để lưu nhanh)"
            className="w-full p-3 text-xs sm:text-sm bg-black/60 border border-cyan-500/30 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500 resize-y"
          />

          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-500">
              {content.length}/2500 ký tự
            </span>
            <div className="flex gap-2">
              {content && (
                <button
                  type="button"
                  onClick={() => setContent('')}
                  className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 text-slate-400 hover:text-slate-200 text-xs font-head tracking-wider uppercase transition-colors"
                >
                  Xóa ô nhập
                </button>
              )}
              <button
                type="submit"
                disabled={!content.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 text-xs font-head tracking-wider uppercase font-bold disabled:opacity-40 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>💾 LƯU GHI CHÚ</span>
              </button>
            </div>
          </div>
          <div className="text-[11px] font-mono text-cyan-400/70 pt-1">
            Mỗi ghi chú tự động gắn mốc thời gian thực tế và đồng bộ giữa các thiết bị.
          </div>
        </form>

        {/* Right: Logs List */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="font-head tracking-wider uppercase text-cyan-300">
              DANH SÁCH BẢN GHI
            </span>
            <span>{logs.length} bản ghi</span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[380px] sm:max-h-[440px] pr-1">
            {filteredLogs.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-700/60 rounded text-slate-500 font-mono text-xs">
                {search ? 'Không tìm thấy ghi chú phù hợp với từ khóa.' : 'Nhật ký đang trống. Hãy ghi lại bài học đầu tiên của bạn!'}
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded border border-cyan-500/15 border-l-4 border-l-cyan-400 bg-cyan-950/10 hover:bg-cyan-950/20 transition-all"
                >
                  {editingId === log.id ? (
                    <div className="space-y-2">
                      <div className="text-[11px] font-mono text-amber-300">
                        [{log.timestamp}] · ĐANG CHỈNH SỬA
                      </div>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full p-2 text-xs bg-black/70 border border-cyan-400 rounded text-white focus:outline-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-head uppercase"
                        >
                          <X className="w-3 h-3 inline mr-1" /> Hủy
                        </button>
                        <button
                          onClick={() => handleSaveEdit(log.id)}
                          className="px-3 py-1 rounded bg-cyan-500/20 border border-cyan-400 text-cyan-200 text-xs font-head uppercase font-bold"
                        >
                          <Check className="w-3 h-3 inline mr-1" /> Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-amber-300/90 font-semibold">
                            [{log.timestamp}]
                          </span>
                          {log.edited && (
                            <span className="text-[10px] font-mono text-cyan-400">
                              · ĐÃ SỬA
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEdit(log)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                            title="Sửa ghi chú"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteLog(log.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Xóa ghi chú"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                        {log.content}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
