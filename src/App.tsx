import { useState, useEffect, useRef, useCallback } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { Header } from './components/Header';
import { OfflineIndicator } from './components/OfflineIndicator';
import { HunterStatus } from './components/HunterStatus';
import { DailyQuests } from './components/DailyQuests';
import { EpicQuests } from './components/EpicQuests';
import { StudyLogs } from './components/StudyLogs';
import { DataManagement } from './components/DataManagement';
import { SyncModal } from './components/SyncModal';
import { LevelUpModal } from './components/LevelUpModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer } from './components/ToastContainer';

import {
  Difficulty,
  HunterState,
  SyncConfig,
  ToastMessage
} from './types/hunter';
import {
  loadHunterState,
  saveHunterState,
  loadSyncConfig,
  saveSyncConfig,
  defaultHunterState,
  todayStr,
  stamp,
  EXP_PER_LEVEL,
  DAILY_EXP,
  DAILY_BONUS_EXP,
  DIFF_MAP,
  titleFor,
  toLocalInput,
  uid
} from './services/storage';
import { sound } from './services/sound';
import { syncService } from './services/syncService';

export default function App() {
  const [state, setState] = useState<HunterState>(() => loadHunterState());
  const [syncConfig, setSyncConfig] = useState<SyncConfig>(() => loadSyncConfig());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [levelUpOverlay, setLevelUpOverlay] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirmation Modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    body: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    body: null,
    onConfirm: () => {}
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const syncConfigRef = useRef(syncConfig);
  syncConfigRef.current = syncConfig;

  // Toast helper
  const addToast = useCallback(
    (text: string, type: 'info' | 'success' | 'gold' | 'danger' = 'info', icon?: string) => {
      const id = uid('t');
      setToasts((prev) => [...prev, { id, text, type, icon }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3400);
    },
    []
  );

  // Helper to commit state changes locally and notify sync
  const updateState = useCallback(
    (updater: (prev: HunterState) => HunterState, shouldTriggerSync = true) => {
      setState((prev) => {
        const next = updater(prev);
        const finalState = {
          ...next,
          updatedAt: Date.now()
        };
        saveHunterState(finalState);
        return finalState;
      });

      if (shouldTriggerSync) {
        setSyncConfig((prev) => {
          const next = { ...prev, pendingSync: true };
          saveSyncConfig(next);
          return next;
        });
      }
    },
    []
  );

  // EXP handling
  const addExperience = useCallback(
    (amount: number, reason?: string) => {
      if (amount <= 0) return;
      let newLevel = stateRef.current.level;
      let leveledUp = false;

      updateState((prev) => {
        let curExp = prev.exp + amount;
        let curLevel = prev.level;
        let lvCount = 0;

        while (curExp >= EXP_PER_LEVEL) {
          curExp -= EXP_PER_LEVEL;
          curLevel++;
          lvCount++;
        }

        if (lvCount > 0) {
          leveledUp = true;
          newLevel = curLevel;
        }

        return {
          ...prev,
          exp: curExp,
          level: curLevel,
          totalExp: prev.totalExp + amount
        };
      });

      if (leveledUp) {
        sound.level(stateRef.current.soundEnabled);
        setLevelUpOverlay(newLevel);
        addToast(
          `THĂNG CẤP <b>LV.${newLevel}</b> — Danh hiệu mới: <b>${titleFor(newLevel)}</b>`,
          'gold',
          '★'
        );
      } else {
        sound.add(stateRef.current.soundEnabled);
        if (reason) {
          addToast(`${reason} · <b>+${amount} EXP</b>`, 'success', '◈');
        }
      }
    },
    [addToast, updateState]
  );

  const removeExperience = useCallback(
    (amount: number, reason?: string) => {
      if (amount <= 0) return;
      updateState((prev) => {
        let total = (prev.level - 1) * EXP_PER_LEVEL + prev.exp;
        total = Math.max(0, total - amount);
        const nextLevel = Math.floor(total / EXP_PER_LEVEL) + 1;
        const nextExp = total % EXP_PER_LEVEL;
        const nextTotalExp = Math.max(0, prev.totalExp - amount);

        return {
          ...prev,
          level: nextLevel,
          exp: nextExp,
          totalExp: nextTotalExp
        };
      });

      if (reason) {
        addToast(`${reason} · <b>-${amount} EXP</b>`, 'gold');
      }
    },
    [addToast, updateState]
  );

  // Daily Activity & Streak registration
  const registerDailyStreak = useCallback(() => {
    const today = todayStr();
    if (stateRef.current.lastStreakDate === today) return;

    updateState((prev) => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = prev.lastStreakDate === todayStr(yesterday);
      const nextStreak = isConsecutive ? prev.streak + 1 : 1;

      return {
        ...prev,
        streak: nextStreak,
        lastStreakDate: today
      };
    });
  }, [updateState]);

  // Check Daily Reset
  const checkDailyReset = useCallback(
    (silent = false) => {
      const today = todayStr();
      const current = stateRef.current;

      if (current.lastActiveDate !== today) {
        const completedCount = current.dailyQuests.filter((q) => q.completed).length;

        updateState((prev) => {
          const resetDaily = prev.dailyQuests.map((q) => ({ ...q, completed: false }));
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const streakPreserved = prev.lastStreakDate === todayStr(yesterday) || prev.lastStreakDate === today;

          return {
            ...prev,
            dailyQuests: resetDaily,
            lastActiveDate: today,
            dailyBonusClaimed: false,
            streak: streakPreserved ? prev.streak : 0,
            stats: {
              ...prev.stats,
              daysActive: prev.stats.daysActive + 1
            }
          };
        });

        if (!silent) {
          sound.done(current.soundEnabled);
          addToast(
            `NGÀY MỚI ĐÃ BẮT ĐẦU — Đã bỏ tích ${completedCount} nhiệm vụ hàng ngày. Sẵn sàng chinh phục!`,
            'gold',
            '⟳'
          );
        }
        return true;
      } else if (!silent) {
        addToast('Hôm nay chưa sang ngày mới. Dùng "RESET NGÀY MỚI" nếu muốn đặt lại thủ công.', 'info', '⟳');
      }
      return false;
    },
    [addToast, updateState]
  );

  // Cloud Synchronization Methods
  const pushStateToCloud = useCallback(async () => {
    const cfg = syncConfigRef.current;
    if (!cfg.syncCode || cfg.forceOffline || !isOnline) return;

    try {
      setIsSyncing(true);
      const res = await syncService.pushUpdate(cfg.syncCode, stateRef.current);
      setSyncConfig((prev) => {
        const next = {
          ...prev,
          lastSyncedAt: res.updatedAt,
          pendingSync: false
        };
        saveSyncConfig(next);
        return next;
      });
    } catch (e: any) {
      console.warn('Sync push deferred', e);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  const pullStateFromCloud = useCallback(async () => {
    const cfg = syncConfigRef.current;
    if (!cfg.syncCode || cfg.forceOffline || !isOnline) return;

    try {
      setIsSyncing(true);
      const res = await syncService.fetchByCode(cfg.syncCode);
      const localUpdated = stateRef.current.updatedAt || 0;

      // If server state is newer than local state, update local
      if (res.updatedAt > localUpdated + 1000) {
        setState(res.data);
        saveHunterState(res.data);
        sound.sync(res.data.soundEnabled);
        addToast(`Đồng bộ thành công dữ liệu từ thiết bị liên kết!`, 'success', '⚡');
      }

      setSyncConfig((prev) => {
        const next = {
          ...prev,
          lastSyncedAt: res.updatedAt,
          linkedDeviceCount: res.deviceCount || 1,
          pendingSync: false
        };
        saveSyncConfig(next);
        return next;
      });
    } catch (e: any) {
      console.warn('Sync pull error', e);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, addToast]);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (syncConfigRef.current.notifyNetworkChanges) {
        addToast('Đã khôi phục kết nối Internet. Sẵn sàng đồng bộ.', 'success', '📶');
      }
      // Push pending changes if any
      if (syncConfigRef.current.pendingSync && !syncConfigRef.current.forceOffline) {
        pushStateToCloud();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (syncConfigRef.current.notifyNetworkChanges) {
        addToast('Mất kết nối Internet. Chuyển sang chế độ lưu cục bộ.', 'gold', '📵');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addToast, pushStateToCloud]);

  // Daily reset checker & sync background interval
  useEffect(() => {
    checkDailyReset(true);

    const resetInterval = setInterval(() => {
      checkDailyReset(true);
    }, 25000);

    const syncInterval = setInterval(() => {
      if (syncConfigRef.current.syncCode && !syncConfigRef.current.forceOffline && navigator.onLine) {
        if (syncConfigRef.current.pendingSync) {
          pushStateToCloud();
        } else {
          pullStateFromCloud();
        }
      }
    }, 30000);

    return () => {
      clearInterval(resetInterval);
      clearInterval(syncInterval);
    };
  }, [checkDailyReset, pushStateToCloud, pullStateFromCloud]);

  // Debounced push when local state changes
  useEffect(() => {
    if (!syncConfig.syncCode || syncConfig.forceOffline || !isOnline || !syncConfig.pendingSync) {
      return;
    }

    const timer = setTimeout(() => {
      pushStateToCloud();
    }, 2500);

    return () => clearTimeout(timer);
  }, [state, syncConfig.syncCode, syncConfig.forceOffline, syncConfig.pendingSync, isOnline, pushStateToCloud]);

  // Sync Modal Handlers
  const handleGenerateCode = async () => {
    try {
      setIsSyncing(true);
      const res = await syncService.generateCode(stateRef.current);
      setSyncConfig((prev) => {
        const next = {
          ...prev,
          syncCode: res.code,
          lastSyncedAt: res.updatedAt,
          pendingSync: false
        };
        saveSyncConfig(next);
        return next;
      });
      sound.sync(stateRef.current.soundEnabled);
      addToast(`Đã tạo mã đồng bộ: <b>${res.code}</b>`, 'success', '🔑');
    } catch (e: any) {
      sound.error(stateRef.current.soundEnabled);
      addToast(e.message || 'Không thể tạo mã đồng bộ lúc này.', 'danger');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectCode = async (code: string) => {
    try {
      setIsSyncing(true);
      const res = await syncService.fetchByCode(code);

      setConfirmDialog({
        isOpen: true,
        title: 'LIÊN KẾT MÃ ĐỒNG BỘ',
        body: (
          <div className="space-y-2">
            <p>
              Tìm thấy dữ liệu thợ săn cho mã: <b className="text-cyan-400">{res.code}</b>
            </p>
            <div className="p-2.5 rounded bg-black/50 border border-cyan-500/20 text-xs font-mono">
              <div>Người chơi: <b className="text-white">{res.data.playerName}</b></div>
              <div>Cấp độ: <b className="text-amber-300">LV.{res.data.level}</b> ({res.data.exp}/100 EXP)</div>
              <div>Nhiệm vụ hàng ngày: <b>{res.data.dailyQuests.length}</b></div>
              <div>Mục tiêu: <b>{res.data.epicQuests.length}</b></div>
            </div>
            <p className="text-amber-300 text-xs">
              Dữ liệu từ thiết bị liên kết sẽ thay thế dữ liệu trên máy này. Bạn có muốn tiếp tục?
            </p>
          </div>
        ),
        confirmText: 'ĐỒNG Ý LIÊN KẾT',
        isDanger: false,
        onConfirm: () => {
          setState(res.data);
          saveHunterState(res.data);
          setSyncConfig((prev) => {
            const next = {
              ...prev,
              syncCode: res.code,
              lastSyncedAt: res.updatedAt,
              pendingSync: false,
              linkedDeviceCount: res.deviceCount || 1
            };
            saveSyncConfig(next);
            return next;
          });
          sound.level(res.data.soundEnabled);
          addToast(`Đã liên kết thành công với mã <b>${res.code}</b>!`, 'success', '✔');
          setConfirmDialog((c) => ({ ...c, isOpen: false }));
        }
      });
    } catch (e: any) {
      sound.error(stateRef.current.soundEnabled);
      addToast(e.message || 'Không thể liên kết mã này.', 'danger');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUnlinkCode = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'NGẮT LIÊN KẾT MÃ ĐỒNG BỘ',
      body: 'Bạn có chắc chắn muốn ngắt liên kết thiết bị này khỏi mã đồng bộ đám mây? Dữ liệu hiện tại trên máy vẫn sẽ được giữ nguyên.',
      confirmText: 'NGẮT LIÊN KẾT',
      isDanger: true,
      onConfirm: () => {
        setSyncConfig((prev) => {
          const next = {
            ...prev,
            syncCode: null,
            lastSyncedAt: null,
            pendingSync: false
          };
          saveSyncConfig(next);
          return next;
        });
        addToast('Đã ngắt liên kết mã đồng bộ.', 'gold');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  const handleManualSync = async () => {
    if (!syncConfig.syncCode) {
      addToast('Chưa có mã đồng bộ. Vui lòng tạo mã trước.', 'info');
      return;
    }
    sound.click(state.soundEnabled);
    await pushStateToCloud();
    await pullStateFromCloud();
    addToast('Đã đồng bộ dữ liệu mới nhất với máy chủ.', 'success', '⚡');
  };

  const handleUpdateConfig = (partial: Partial<SyncConfig>) => {
    setSyncConfig((prev) => {
      const next = { ...prev, ...partial };
      saveSyncConfig(next);
      return next;
    });
    addToast('Đã cập nhật tùy chọn đồng bộ và hiển thị.', 'info');
  };

  // Quest and State Handlers
  const handleUpdatePlayerName = (name: string) => {
    updateState((prev) => ({ ...prev, playerName: name }));
    sound.click(state.soundEnabled);
    addToast(`Đã đổi tên thợ săn: <b>${name}</b>`, 'success');
  };

  const handleToggleSound = () => {
    const nextVal = !state.soundEnabled;
    updateState((prev) => ({ ...prev, soundEnabled: nextVal }));
    if (nextVal) {
      sound.add(true);
      addToast('Đã bật âm thanh hệ thống.', 'success', '🔊');
    } else {
      addToast('Đã tắt âm thanh hệ thống.', 'info', '🔇');
    }
  };

  const handleManualResetDay = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'RESET TÍCH NHIỆM VỤ NGÀY',
      body: 'Bỏ tích toàn bộ nhiệm vụ hàng ngày để làm lại từ đầu hôm nay? Cấp độ và EXP đã tích lũy vẫn được bảo toàn nguyên vẹn.',
      confirmText: 'RESET NGAY',
      isDanger: false,
      onConfirm: () => {
        updateState((prev) => ({
          ...prev,
          dailyQuests: prev.dailyQuests.map((q) => ({ ...q, completed: false })),
          dailyBonusClaimed: false,
          lastActiveDate: todayStr()
        }));
        sound.done(state.soundEnabled);
        addToast('Đã reset trạng thái nhiệm vụ hàng ngày.', 'gold', '⟳');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  // Daily Quests Actions
  const handleAddDaily = (text: string) => {
    updateState((prev) => ({
      ...prev,
      dailyQuests: [...prev.dailyQuests, { id: uid('d'), text, completed: false }]
    }));
    sound.add(state.soundEnabled);
    addToast(`Đã thêm nhiệm vụ: <b>${text}</b>`, 'success', '◈');
  };

  const handleToggleDaily = (id: string) => {
    const quest = state.dailyQuests.find((q) => q.id === id);
    if (!quest) return;

    if (!quest.completed) {
      // Completed quest
      updateState((prev) => ({
        ...prev,
        dailyQuests: prev.dailyQuests.map((q) => (q.id === id ? { ...q, completed: true } : q)),
        stats: { ...prev.stats, dailyCompleted: prev.stats.dailyCompleted + 1 }
      }));
      addExperience(DAILY_EXP, `HOÀN THÀNH: ${quest.text}`);
      registerDailyStreak();

      // Check if all are done for bonus
      setTimeout(() => {
        const fresh = stateRef.current;
        const allDone = fresh.dailyQuests.length > 0 && fresh.dailyQuests.every((q) => q.completed);
        if (allDone && !fresh.dailyBonusClaimed) {
          updateState((prev) => ({ ...prev, dailyBonusClaimed: true }));
          addExperience(DAILY_BONUS_EXP);
          sound.done(stateRef.current.soundEnabled);
          addToast(
            `BONUS KỶ LUẬT! Hoàn thành 100% nhiệm vụ hôm nay · <b>+${DAILY_BONUS_EXP} EXP</b>`,
            'gold',
            '★'
          );
        }
      }, 300);
    } else {
      // Uncheck quest
      updateState((prev) => ({
        ...prev,
        dailyQuests: prev.dailyQuests.map((q) => (q.id === id ? { ...q, completed: false } : q))
      }));
      removeExperience(DAILY_EXP, `BỎ TÍCH: ${quest.text}`);
    }
  };

  const handleDeleteDaily = (id: string) => {
    const q = state.dailyQuests.find((x) => x.id === id);
    updateState((prev) => ({
      ...prev,
      dailyQuests: prev.dailyQuests.filter((x) => x.id !== id)
    }));
    sound.click(state.soundEnabled);
    if (q) addToast(`Đã xóa nhiệm vụ: <b>${q.text}</b>`, 'gold');
  };

  // Epic Quests Actions
  const handleAddEpic = (title: string, deadline: string, difficulty: Difficulty) => {
    const diff = DIFF_MAP[difficulty] || DIFF_MAP.medium;
    updateState((prev) => ({
      ...prev,
      epicQuests: [
        ...prev.epicQuests,
        {
          id: uid('e'),
          title,
          deadline,
          difficulty,
          expReward: diff.exp,
          completed: false,
          createdAt: stamp()
        }
      ]
    }));
    sound.add(state.soundEnabled);
    addToast(`ĐÃ KÍCH HOẠT NHIỆM VỤ MỤC TIÊU · Thưởng <b>+${diff.exp} EXP</b>`, 'success', '◆');
  };

  const handleCompleteEpic = (id: string) => {
    const q = state.epicQuests.find((x) => x.id === id);
    if (!q || q.completed) return;

    updateState((prev) => ({
      ...prev,
      epicQuests: prev.epicQuests.map((item) =>
        item.id === id ? { ...item, completed: true, completedAt: stamp() } : item
      ),
      stats: { ...prev.stats, epicCompleted: prev.stats.epicCompleted + 1 }
    }));
    addExperience(q.expReward, `MỤC TIÊU HOÀN THÀNH: ${q.title}`);
    registerDailyStreak();
    sound.done(state.soundEnabled);
  };

  const handleUndoEpic = (id: string) => {
    const q = state.epicQuests.find((x) => x.id === id);
    if (!q || !q.completed) return;

    updateState((prev) => ({
      ...prev,
      epicQuests: prev.epicQuests.map((item) =>
        item.id === id ? { ...item, completed: false, completedAt: null } : item
      )
    }));
    removeExperience(q.expReward, `HOÀN TÁC MỤC TIÊU: ${q.title}`);
    sound.click(state.soundEnabled);
  };

  const handleArchiveEpic = (id: string) => {
    const q = state.epicQuests.find((x) => x.id === id);
    if (!q) return;

    updateState((prev) => ({
      ...prev,
      epicQuests: prev.epicQuests.filter((x) => x.id !== id),
      archivedQuests: [...prev.archivedQuests, { ...q, archived: true, archivedAt: stamp() }]
    }));
    sound.click(state.soundEnabled);
    addToast(`Đã chuyển mục tiêu vào kho lưu trữ: <b>${q.title}</b>`, 'success', '▣');
  };

  const handleRestoreEpic = (id: string) => {
    const q = state.archivedQuests.find((x) => x.id === id);
    if (!q) return;

    updateState((prev) => ({
      ...prev,
      archivedQuests: prev.archivedQuests.filter((x) => x.id !== id),
      epicQuests: [...prev.epicQuests, { ...q, archived: false, archivedAt: null }]
    }));
    sound.click(state.soundEnabled);
    addToast('Đã khôi phục mục tiêu về danh sách.', 'success');
  };

  const handleDeleteEpic = (id: string, fromArchive: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: 'XÓA NHIỆM VỤ MỤC TIÊU',
      body: 'Bạn có chắc chắn muốn xóa vĩnh viễn nhiệm vụ mục tiêu này?',
      confirmText: 'XÓA VĨNH VIỄN',
      isDanger: true,
      onConfirm: () => {
        updateState((prev) => ({
          ...prev,
          epicQuests: fromArchive ? prev.epicQuests : prev.epicQuests.filter((x) => x.id !== id),
          archivedQuests: fromArchive ? prev.archivedQuests.filter((x) => x.id !== id) : prev.archivedQuests
        }));
        sound.click(state.soundEnabled);
        addToast('Đã xóa nhiệm vụ mục tiêu.', 'gold');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  // Study Logs Actions
  const handleAddLog = (content: string) => {
    updateState((prev) => ({
      ...prev,
      studyLogs: [...prev.studyLogs, { id: uid('l'), timestamp: stamp(), content }]
    }));
    sound.log(state.soundEnabled);
    addToast(`Đã lưu nhật ký vào lúc <b>${stamp()}</b>`, 'success', '✎');
  };

  const handleEditLog = (id: string, content: string) => {
    updateState((prev) => ({
      ...prev,
      studyLogs: prev.studyLogs.map((l) => (l.id === id ? { ...l, content, edited: true } : l))
    }));
    sound.log(state.soundEnabled);
    addToast('Đã cập nhật nội dung ghi chú.', 'success', '✎');
  };

  const handleDeleteLog = (id: string) => {
    updateState((prev) => ({
      ...prev,
      studyLogs: prev.studyLogs.filter((l) => l.id !== id)
    }));
    sound.click(state.soundEnabled);
    addToast('Đã xóa bản ghi nhật ký.', 'gold');
  };

  // Data & Reset Actions
  const handleImportState = (newState: HunterState, filename: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'XÁC NHẬN NẠP DỮ LIỆU SAO LƯU',
      body: (
        <div className="space-y-2">
          <p>Tệp sao lưu: <b className="text-cyan-300">{filename}</b></p>
          <div className="p-2.5 rounded bg-black/60 border border-cyan-500/20 text-xs font-mono">
            <div>Người chơi: <b className="text-white">{newState.playerName}</b></div>
            <div>Cấp độ: <b className="text-amber-300">LV.{newState.level}</b> ({newState.exp}/100 EXP)</div>
            <div>Nhiệm vụ ngày: <b>{newState.dailyQuests.length}</b></div>
            <div>Mục tiêu: <b>{newState.epicQuests.length}</b></div>
            <div>Nhật ký: <b>{newState.studyLogs.length}</b> bản ghi</div>
          </div>
          <p className="text-amber-300 text-xs font-semibold">
            Dữ liệu hiện tại trên máy sẽ bị thay thế toàn bộ. Tiếp tục?
          </p>
        </div>
      ),
      confirmText: 'GHI ĐÈ & PHỤC HỒI',
      isDanger: false,
      onConfirm: () => {
        setState(newState);
        saveHunterState(newState);
        sound.level(newState.soundEnabled);
        addToast(`Phục hồi thành công dữ liệu từ ${filename}`, 'success', '✔');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  const handleImportDemo = () => {
    const demo: HunterState = {
      version: 2,
      playerName: 'Sung Jin-Woo',
      level: 3,
      exp: 70,
      totalExp: 270,
      soundEnabled: true,
      lastActiveDate: todayStr(),
      streak: 3,
      lastStreakDate: todayStr(),
      dailyBonusClaimed: false,
      dailyQuests: [
        { id: uid('d'), text: 'Chạy bộ 10km rèn luyện thể lực', completed: true },
        { id: uid('d'), text: '100 cái hít đất, 100 cái gập bụng', completed: true },
        { id: uid('d'), text: 'Đọc tài liệu chuyên ngành 45 phút', completed: false },
        { id: uid('d'), text: 'Luyện ngoại ngữ và giải đề thi', completed: false }
      ],
      epicQuests: [
        {
          id: uid('e'),
          title: 'Hoàn thành Hầm Ngục Hạng D: Giáo trình Giải Tích Nâng Cao',
          deadline: toLocalInput(new Date(Date.now() + 2 * 86400000)),
          difficulty: 'hard',
          expReward: 100,
          completed: false,
          createdAt: stamp()
        },
        {
          id: uid('e'),
          title: 'Đọc trọn vẹn 1 cuốn sách phát triển tư duy',
          deadline: toLocalInput(new Date(Date.now() + 5 * 86400000)),
          difficulty: 'medium',
          expReward: 50,
          completed: true,
          createdAt: stamp(),
          completedAt: stamp()
        }
      ],
      archivedQuests: [],
      studyLogs: [
        {
          id: uid('l'),
          timestamp: stamp(),
          content: 'Hôm nay cảm nhận rõ sự tiến bộ khi duy trì chuỗi kỷ luật 3 ngày liên tục.'
        },
        {
          id: uid('l'),
          timestamp: stamp(),
          content: 'Khởi động Hệ Thống Thăng Cấp. Bắt đầu hành trình kỷ luật bản thân.'
        }
      ],
      stats: { dailyCompleted: 6, epicCompleted: 1, daysActive: 3 },
      updatedAt: Date.now()
    };

    setConfirmDialog({
      isOpen: true,
      title: 'NẠP DỮ LIỆU MẪU',
      body: 'Nạp bộ dữ liệu mẫu (Cấp 3 · 70 EXP · thói quen & nhiệm vụ có sẵn) để trải nghiệm giao diện?',
      confirmText: 'NẠP DỮ LIỆU',
      isDanger: false,
      onConfirm: () => {
        setState(demo);
        saveHunterState(demo);
        sound.level(demo.soundEnabled);
        addToast('Đã nạp bộ dữ liệu mẫu thành công!', 'success', '✦');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  const handleResetDailyChecks = () => {
    updateState((prev) => ({
      ...prev,
      dailyQuests: prev.dailyQuests.map((q) => ({ ...q, completed: false })),
      dailyBonusClaimed: false
    }));
    sound.click(state.soundEnabled);
    addToast('Đã bỏ tích toàn bộ nhiệm vụ hàng ngày.', 'gold');
  };

  const handleResetProgress = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'RESET CẤP ĐỘ & EXP',
      body: 'Đưa người chơi về Cấp 1 · 0 EXP (tổng EXP cũng về 0)? Danh sách nhiệm vụ và nhật ký vẫn giữ nguyên.',
      confirmText: 'RESET TIẾN TRÌNH',
      isDanger: true,
      onConfirm: () => {
        updateState((prev) => ({
          ...prev,
          level: 1,
          exp: 0,
          totalExp: 0,
          streak: 0,
          lastStreakDate: null
        }));
        sound.click(state.soundEnabled);
        addToast('Tiến trình thợ săn đã đưa về Cấp 1 · 0 EXP.', 'gold');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  const handleResetArchive = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'XÓA KHO LƯU TRỮ',
      body: `Xóa vĩnh viễn ${state.archivedQuests.length} nhiệm vụ trong kho lưu trữ?`,
      confirmText: 'XÓA KHO LƯU TRỮ',
      isDanger: true,
      onConfirm: () => {
        updateState((prev) => ({ ...prev, archivedQuests: [] }));
        sound.click(state.soundEnabled);
        addToast('Đã làm trống kho lưu trữ.', 'gold');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  const handleResetLogs = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'XÓA TOÀN BỘ NHẬT KÝ',
      body: `Xóa vĩnh viễn ${state.studyLogs.length} bản ghi nhật ký học tập?`,
      confirmText: 'XÓA NHẬT KÝ',
      isDanger: true,
      onConfirm: () => {
        updateState((prev) => ({ ...prev, studyLogs: [] }));
        sound.click(state.soundEnabled);
        addToast('Đã xóa toàn bộ nhật ký.', 'gold');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  const handleResetEpicQuests = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'XÓA TẤT CẢ MỤC TIÊU',
      body: `Xóa vĩnh viễn ${state.epicQuests.length} nhiệm vụ mục tiêu đang có (không bao gồm kho lưu trữ)?`,
      confirmText: 'XÓA TẤT CẢ',
      isDanger: true,
      onConfirm: () => {
        updateState((prev) => ({ ...prev, epicQuests: [] }));
        sound.click(state.soundEnabled);
        addToast('Đã xóa toàn bộ nhiệm vụ mục tiêu.', 'gold');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  const handleFactoryReset = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'KHÔI PHỤC TOÀN BỘ HỆ THỐNG',
      body: 'CẢNH BÁO: Xóa 100% dữ liệu trong trình duyệt: cấp độ, EXP, nhiệm vụ, kho lưu trữ, nhật ký và khôi phục cài đặt gốc ban đầu. Hành động này KHÔNG thể hoàn tác.',
      confirmText: 'XÓA TOÀN BỘ',
      isDanger: true,
      onConfirm: () => {
        const fresh = defaultHunterState();
        setState(fresh);
        saveHunterState(fresh);
        setSyncConfig((prev) => {
          const next = { ...prev, pendingSync: false };
          saveSyncConfig(next);
          return next;
        });
        sound.error(true);
        addToast('Hệ thống đã khôi phục trạng thái ban đầu.', 'danger', '⛔');
        setConfirmDialog((c) => ({ ...c, isOpen: false }));
      }
    });
  };

  return (
    <div className="min-h-screen text-[#ddf7ff] px-3 sm:px-4 py-4 sm:py-6 relative z-10 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic Cyber Ember Canvas */}
      <ParticleBackground />

      <div className="max-w-[1360px] mx-auto">
        {/* Header */}
        <Header
          soundEnabled={state.soundEnabled}
          onToggleSound={handleToggleSound}
          syncConfig={syncConfig}
          isOnline={isOnline}
          isSyncing={isSyncing}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          onManualReset={() => checkDailyReset(false)}
        />

        {/* Offline Indicator Alert Banner */}
        <OfflineIndicator
          isOnline={isOnline}
          syncConfig={syncConfig}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
        />

        {/* 1. Hunter Status Profile */}
        <HunterStatus
          state={state}
          onUpdatePlayerName={handleUpdatePlayerName}
          onManualResetDay={handleManualResetDay}
        />

        {/* 2. Quests Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <DailyQuests
            quests={state.dailyQuests}
            bonusClaimed={state.dailyBonusClaimed}
            onAddQuest={handleAddDaily}
            onToggleQuest={handleToggleDaily}
            onDeleteQuest={handleDeleteDaily}
          />

          <EpicQuests
            epicQuests={state.epicQuests}
            archivedQuests={state.archivedQuests}
            onAddEpic={handleAddEpic}
            onCompleteEpic={handleCompleteEpic}
            onUndoEpic={handleUndoEpic}
            onArchiveEpic={handleArchiveEpic}
            onRestoreEpic={handleRestoreEpic}
            onDeleteEpic={handleDeleteEpic}
          />
        </div>

        {/* 3. Study Diary & Logs */}
        <StudyLogs
          logs={state.studyLogs}
          onAddLog={handleAddLog}
          onEditLog={handleEditLog}
          onDeleteLog={handleDeleteLog}
        />

        {/* 4. Data Management & System Reset */}
        <DataManagement
          state={state}
          syncCode={syncConfig.syncCode}
          onImportState={handleImportState}
          onImportDemo={handleImportDemo}
          onResetDailyChecks={handleResetDailyChecks}
          onResetProgress={handleResetProgress}
          onResetArchive={handleResetArchive}
          onResetLogs={handleResetLogs}
          onResetEpicQuests={handleResetEpicQuests}
          onFactoryReset={handleFactoryReset}
          onToast={addToast}
        />

        {/* Footer */}
        <footer className="text-center font-mono text-xs text-slate-500 tracking-wider py-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SOLO LEVELING SYSTEM v2.0 — Offline-Ready &amp; Multi-Device Cloud Sync</span>
          <span className="text-cyan-400/80">Thiết kế đáp ứng đa nền tảng PC &amp; Mobile</span>
        </footer>
      </div>

      {/* Sync Hub Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncConfig={syncConfig}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onGenerateCode={handleGenerateCode}
        onConnectCode={handleConnectCode}
        onUnlinkCode={handleUnlinkCode}
        onManualSync={handleManualSync}
        onUpdateConfig={handleUpdateConfig}
        onToast={addToast}
      />

      {/* Level Up Awakening Overlay */}
      <LevelUpModal
        level={levelUpOverlay}
        onClose={() => setLevelUpOverlay(null)}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        body={confirmDialog.body}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((c) => ({ ...c, isOpen: false }))}
      />

      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
