import React, { useState } from 'react';
import { Plus, Check, Trash2, Award } from 'lucide-react';
import { DailyQuest } from '../types/hunter';
import { DAILY_EXP, DAILY_BONUS_EXP } from '../services/storage';

interface DailyQuestsProps {
  quests: DailyQuest[];
  bonusClaimed: boolean;
  onAddQuest: (text: string) => void;
  onToggleQuest: (id: string) => void;
  onDeleteQuest: (id: string) => void;
}

export function DailyQuests({
  quests,
  bonusClaimed,
  onAddQuest,
  onToggleQuest,
  onDeleteQuest
}: DailyQuestsProps) {
  const [inputText, setInputText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean) return;
    onAddQuest(clean);
    setInputText('');
  };

  const completedCount = quests.filter(q => q.completed).length;
  const totalCount = quests.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <section className="hud-panel p-4 sm:p-5 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 text-xs font-bold">[02]</span>
          <h3 className="font-head text-xs sm:text-sm font-bold tracking-widest text-cyan-200 uppercase">
            NHIỆM VỤ HÀNG NGÀY // DAILY QUESTS
          </h3>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider border ${
            bonusClaimed
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}
        >
          {bonusClaimed ? 'ĐÃ NHẬN BONUS +20 EXP' : `BONUS +${DAILY_BONUS_EXP} EXP KHI XONG TẤT CẢ`}
        </span>
      </div>

      {/* Add input */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          maxLength={90}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Thêm thói quen mới (vd: Đọc sách 30 phút, Chạy bộ 2km)..."
          className="flex-1 px-3 py-2 text-xs sm:text-sm bg-black/50 border border-cyan-500/30 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/50 text-xs font-head tracking-wider uppercase font-bold disabled:opacity-40 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ THÊM</span>
        </button>
      </form>

      {/* Daily Progress */}
      <div className="space-y-1 mb-3">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-400 font-head uppercase tracking-wider">
            TIẾN ĐỘ TRONG NGÀY
          </span>
          <span className="text-cyan-300 font-bold">
            {completedCount}/{totalCount} HOÀN THÀNH ({Math.round(progressPct)}%)
          </span>
          <span className="text-emerald-400">+{DAILY_EXP} EXP / QUEST</span>
        </div>
        <div className="h-2 rounded bg-black/60 border border-cyan-500/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300 shadow-[0_0_10px_rgba(37,245,165,0.6)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px] sm:max-h-[420px]">
        {quests.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-700/60 rounded text-slate-500 font-mono text-xs">
            Chưa có nhiệm vụ hàng ngày nào. Hãy thêm các thói quen rèn luyện để tích lũy EXP mỗi ngày!
          </div>
        ) : (
          quests.map((q) => (
            <div
              key={q.id}
              className={`flex items-center gap-3 p-2.5 rounded border transition-all ${
                q.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 opacity-75'
                  : 'bg-black/40 border-cyan-500/20 hover:border-cyan-400/50 hover:translate-x-0.5'
              }`}
            >
              {/* Checkbox button */}
              <button
                onClick={() => onToggleQuest(q.id)}
                className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border transition-all ${
                  q.completed
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(37,245,165,0.7)]'
                    : 'border-cyan-500/40 bg-black/40 hover:border-cyan-300'
                }`}
                title={q.completed ? 'Nhấp để bỏ hoàn thành' : 'Nhấp để đánh dấu hoàn thành (+10 EXP)'}
              >
                {q.completed && <Check className="w-4 h-4 stroke-[3]" />}
              </button>

              {/* Text */}
              <span
                onClick={() => onToggleQuest(q.id)}
                className={`flex-1 text-xs sm:text-sm cursor-pointer select-none leading-relaxed ${
                  q.completed ? 'line-through text-emerald-300/70' : 'text-slate-100 font-medium'
                }`}
              >
                {q.text}
              </span>

              {/* Reward badge */}
              <span className="font-mono text-[10px] text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10 shrink-0">
                +{DAILY_EXP} EXP
              </span>

              {/* Delete button */}
              <button
                onClick={() => onDeleteQuest(q.id)}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                title="Xóa nhiệm vụ này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {quests.length > 0 && completedCount === totalCount && (
        <div className="mt-3 p-2.5 rounded bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2 text-xs text-emerald-300 font-mono">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Tuyệt vời! Bạn đã hoàn thành toàn bộ mục tiêu hôm nay và duy trì chuỗi kỷ luật!</span>
        </div>
      )}
    </section>
  );
}
