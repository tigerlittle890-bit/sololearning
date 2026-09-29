export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DailyQuest {
  id: string;
  text: string;
  completed: boolean;
}

export interface EpicQuest {
  id: string;
  title: string;
  deadline: string;
  difficulty: Difficulty;
  expReward: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string | null;
  archived?: boolean;
  archivedAt?: string | null;
}

export interface StudyLog {
  id: string;
  timestamp: string;
  content: string;
  edited?: boolean;
}

export interface HunterStats {
  dailyCompleted: number;
  epicCompleted: number;
  daysActive: number;
}

export interface HunterState {
  version: number;
  playerName: string;
  level: number;
  exp: number;
  totalExp: number;
  soundEnabled: boolean;
  lastActiveDate: string;
  streak: number;
  lastStreakDate: string | null;
  dailyBonusClaimed: boolean;
  dailyQuests: DailyQuest[];
  epicQuests: EpicQuest[];
  archivedQuests: EpicQuest[];
  studyLogs: StudyLog[];
  stats: HunterStats;
  updatedAt: number;
}

export type OfflineDisplayMode = 'banner' | 'badge' | 'minimal' | 'hidden';

export interface SyncConfig {
  syncCode: string | null;
  autoSync: boolean;
  forceOffline: boolean;
  offlineDisplayMode: OfflineDisplayMode;
  notifyNetworkChanges: boolean;
  lastSyncedAt: number | null;
  pendingSync: boolean;
  linkedDeviceCount?: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'gold' | 'danger';
  icon?: string;
}
