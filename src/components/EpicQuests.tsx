import React, { useState, useEffect } from 'react';
import { Plus, Check, RotateCcw, Archive, Undo2, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { Difficulty, EpicQuest } from '../types/hunter';
import { DIFF_MAP, countdownText, deadlineText, toLocalInput } from '../services/storage';

interface EpicQuestsProps {
  epicQuests: EpicQuest[];
  archivedQuests: EpicQuest[];
  onAddEpic: (title: string, deadline: string, difficulty: Difficulty) => void;
  onCompleteEpic: (id: string) => void;
  onUndoEpic: (id: string) => void;
  onArchiveEpic: (id: string) => void;
  onRestoreEpic: (id: string) => void;
  onDeleteEpic: (id: string, fromArchive: boolean) => void;
}

export function EpicQuests({
  epicQuests,
  archivedQuests,
  onAddEpic,
  onCompleteEpic,
  onUndoEpic,
  onArchiveEpic,
  onRestoreEpic,
  onDeleteEpic
}: EpicQuestsProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'done' | 'archive'>('active');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [deadline, setDeadline] = useState('');
  const [, setTick] = useState(0);

  // Initialize deadline to 3 days from now at 21:00
  useEffect(() => {
    const d = new Date(Date.now() + 3 * 86400000);
    d.setHours(21, 0, 0, 0);
    setDeadline(toLocalInput(d));
  }, []);

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || !deadline) return;

    onAddEpic(cleanTitle, deadline, difficulty);
    setTitle('');
    const nextD = new Date(Date.now() + 3 * 86400000);
    nextD.setHours(21, 0, 0, 0);
    setDeadline(toLocalInput(nextD));
  };

  let displayedQuests: EpicQuest[] = [];
  if (activeTab === 'archive') {
    displayedQuests = [...archivedQuests].reverse();
  } else if (activeTab === 'done') {
    displayedQuests = epicQuests.filter((q) => q.completed);
  } else {
    displayedQuests = epicQuests.filter((q) => !q.completed);
  }

  // Sort by deadline
  displayedQuests.sort((a, b) => {
    const ta = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const tb = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    return ta - tb;
  });

  return (
    <section className="hud-panel p-4 sm:p-5 flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 text-xs font-bold">[03]</span>
          <h3 className="font-head text-xs sm:text-sm font-bold tracking-widest text-cyan-200 uppercase">
            NHIỆM VỤ MỤC TIÊU // EPIC QUESTS
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 bg-cyan-500/10">
          DỄ +20 · TB +50 · KHÓ +100 EXP
        </span>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="space-y-2 mb-3 p-2.5 rounded bg-black/40 border border-cyan-500/20">
        <input
          type="text"
          maxLength={110}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên mục tiêu (vd: Hoàn thành Giáo trình Giải Tích 1, Luyện đề JLPT N3)..."
          className="w-full px-3 py-1.5 text-xs sm:text-sm bg-black/60 border border-cyan-500/30 rounded focus:border-cyan-400 focus:outline-none text-slate-100 placeholder:text-slate-500"
        />

        <div className="flex flex-wrap gap-2">
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="flex-1 min-w-[160px] px-2.5 py-1.5 text-xs font-mono bg-black/60 border border-cyan-500/30 rounded focus:border-cyan-400 focus:outline-none text-slate-100"
          />

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="px-2.5 py-1.5 text-xs font-head bg-slate-900 border border-cyan-500/30 rounded focus:border-cyan-400 focus:outline-none text-slate-200"
          >
            <option value="easy">DỄ (+20 EXP)</option>
            <option value="medium">TRUNG BÌNH (+50 EXP)</option>
            <option value="hard">KHÓ (+100 EXP)</option>
          </select>

          <button
            type="submit"
            disabled={!title.trim() || !deadline}
            className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/50 text-xs font-head tracking-wider uppercase font-bold disabled:opacity-40 transition-all shrink-0 ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ TẠO MỤC TIÊU</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 mb-3 border-b border-cyan-500/10 pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3 py-1 rounded text-xs font-head tracking-wider uppercase transition-all ${
            activeTab === 'active'
              ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.5)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800'
          }`}
        >
          ĐANG THỰC HIỆN ({epicQuests.filter((q) => !q.completed).length})
        </button>

        <button
          onClick={() => setActiveTab('done')}
          className={`px-3 py-1 rounded text-xs font-head tracking-wider uppercase transition-all ${
            activeTab === 'done'
              ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.5)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800'
          }`}
        >
          HOÀN THÀNH ({epicQuests.filter((q) => q.completed).length})
        </button>

        <button
          onClick={() => setActiveTab('archive')}
          className={`px-3 py-1 rounded text-xs font-head tracking-wider uppercase transition-all ${
            activeTab === 'archive'
              ? 'bg-cyan-400 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.5)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-800'
          }`}
        >
          LƯU TRỮ ({archivedQuests.length})
        </button>
      </div>

      {/* Quests List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px] sm:max-h-[460px]">
        {displayedQuests.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-700/60 rounded text-slate-500 font-mono text-xs">
            {activeTab === 'archive'
              ? 'Kho lưu trữ trống.'
              : activeTab === 'done'
              ? 'Chưa có mục tiêu nào hoàn thành. Hãy tập trung chiến đấu!'
              : 'Không có mục tiêu nào đang thực hiện. Hãy tạo thử thách mới ở khung phía trên!'}
          </div>
        ) : (
          displayedQuests.map((q) => {
            const { text: cdText, isOverdue } = countdownText(q.deadline);
            const diffInfo = DIFF_MAP[q.difficulty] || DIFF_MAP.medium;
            const diffBadgeColor =
              q.difficulty === 'hard'
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : q.difficulty === 'easy'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40';

            return (
              <div
                key={q.id}
                className={`p-3 rounded border transition-all ${
                  q.archived
                    ? 'bg-slate-900/40 border-purple-500/20 opacity-80'
                    : q.completed
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : isOverdue
                    ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_14px_rgba(255,59,107,0.2)]'
                    : 'bg-black/40 border-cyan-500/20 hover:border-cyan-400/40'
                }`}
              >
                {/* Top line badges */}
                <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-head font-bold border uppercase ${diffBadgeColor}`}>
                      {diffInfo.en} / {diffInfo.vi}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30 bg-cyan-500/10">
                      +{q.expReward} EXP
                    </span>
                    {q.completed && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/40 bg-emerald-500/20 flex items-center gap-1">
                        <Check className="w-3 h-3" /> ĐÃ XONG
                      </span>
                    )}
                    {q.archived && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-purple-300 border border-purple-500/40 bg-purple-500/20 flex items-center gap-1">
                        <Archive className="w-3 h-3" /> LƯU TRỮ
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteEpic(q.id, Boolean(q.archived))}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Xóa vĩnh viễn mục tiêu này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h4
                  className={`text-sm sm:text-base font-semibold leading-snug mb-1.5 ${
                    q.completed ? 'line-through text-emerald-300/80' : 'text-slate-100'
                  }`}
                >
                  {q.title}
                </h4>

                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    Hạn chót: <b className="text-slate-200">{deadlineText(q.deadline)}</b>
                  </span>
                  <span>
                    Tạo: <span className="text-slate-400">{q.createdAt}</span>
                  </span>
                  {q.completedAt && (
                    <span className="text-emerald-400">
                      Xong: {q.completedAt}
                    </span>
                  )}
                </div>

                {/* Countdown ticker */}
                {!q.archived && (
                  <div
                    className={`text-xs font-mono mb-2.5 flex items-center gap-1.5 ${
                      isOverdue
                        ? 'text-red-400 font-bold drop-shadow-[0_0_8px_rgba(255,59,107,0.7)]'
                        : 'text-cyan-300'
                    }`}
                  >
                    {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                    <span>{cdText}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  {!q.archived && !q.completed && (
                    <button
                      onClick={() => onCompleteEpic(q.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 text-xs font-head tracking-wider uppercase font-semibold transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>XÁC NHẬN HOÀN THÀNH (+{q.expReward} EXP)</span>
                    </button>
                  )}

                  {!q.archived && q.completed && (
                    <>
                      <button
                        onClick={() => onUndoEpic(q.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-head tracking-wider uppercase transition-all"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>HOÀN TÁC</span>
                      </button>

                      <button
                        onClick={() => onArchiveEpic(q.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 border border-purple-500/40 text-xs font-head tracking-wider uppercase transition-all"
                      >
                        <Archive className="w-3 h-3" />
                        <span>LƯU TRỮ</span>
                      </button>
                    </>
                  )}

                  {q.archived && (
                    <button
                      onClick={() => onRestoreEpic(q.id)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 border border-cyan-500/40 text-xs font-head tracking-wider uppercase transition-all"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>KHÔI PHỤC VỀ DANH SÁCH</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
