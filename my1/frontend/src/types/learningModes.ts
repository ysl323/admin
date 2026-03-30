/**
 * 学习模式功能的类型定义
 * 
 * 本文件定义了学习模式功能所需的所有 TypeScript 接口和枚举类型
 */

/**
 * 学习模式枚举
 *
 * 定义六种学习模式：
 * - BEGINNER: 小白模式，初学者模式，显示英文辅助学习
 * - ADVANCED: 进阶模式，进阶学习者，隐藏英文听写练习
 * - SEQUENTIAL: 顺序模式，按原始顺序学习单词
 * - RANDOM: 随机模式，随机选择单词学习
 * - LOOP: 循环模式，按顺序循环学习所有单词
 * - RANDOM_LOOP: 随机循环模式，随机顺序循环学习所有单词
 */
export enum LearningMode {
  BEGINNER = 'beginner',
  ADVANCED = 'advanced',
  SEQUENTIAL = 'sequential',
  RANDOM = 'random',
  LOOP = 'loop',
  RANDOM_LOOP = 'random_loop'
}

/**
 * 单词接口
 * 
 * 表示一个学习单词的基本信息
 */
export interface Word {
  id: number;
  english: string;
  chinese: string;
  audioUrl?: string;
  lessonId: number;
}

/**
 * 会话状态接口
 * 
 * 维护学习会话的内部状态
 */
export interface SessionState {
  /** 单词 ID 序列（按当前模式排序） */
  wordSequence: number[];
  
  /** 当前单词在序列中的索引位置 */
  currentIndex: number;
  
  /** 已学习的单词 ID 集合 */
  learnedWords: Set<number>;
  
  /** 循环次数（仅循环模式使用） */
  loopCount: number;
}

/**
 * 进度信息接口
 * 
 * 用于显示学习进度的统计信息
 */
export interface ProgressInfo {
  /** 当前单词在序列中的索引（从 0 开始） */
  currentIndex: number;
  
  /** 课程总单词数 */
  totalWords: number;
  
  /** 已学习的单词数量 */
  learnedCount: number;
  
  /** 循环次数（循环模式） */
  loopCount: number;
  
  /** 会话开始时间 */
  sessionStartTime: Date;
}

/**
 * 学习会话接口
 * 
 * 表示一个完整的学习会话
 */
export interface LearningSession {
  /** 会话唯一标识符 */
  id: string;
  
  /** 用户 ID */
  userId: number;
  
  /** 课程 ID */
  lessonId: number;
  
  /** 学习模式 */
  mode: LearningMode;
  
  /** 会话开始时间 */
  startTime: Date;
  
  /** 最后活动时间 */
  lastActivityTime: Date;
  
  /** 会话状态 */
  state: SessionState;
  
  /** 进度信息 */
  progress: ProgressInfo;
}

/**
 * 学习记录接口
 * 
 * 记录单个单词的学习情况
 */
export interface LearningRecord {
  /** 记录 ID */
  id: number;
  
  /** 所属会话 ID */
  sessionId: string;
  
  /** 单词 ID */
  wordId: number;
  
  /** 是否答对 */
  correct: boolean;
  
  /** 学习耗时（毫秒） */
  timeSpent: number;
  
  /** 记录时间戳 */
  timestamp: Date;
}

/**
 * 单词选择策略接口
 * 
 * 定义所有学习模式策略必须实现的方法
 */
export interface WordSelectionStrategy {
  /**
   * 初始化策略
   * @param words 课程的所有单词
   */
  initialize(words: Word[]): void;
  
  /**
   * 获取下一个单词
   * @returns 下一个要学习的单词，如果没有则返回 null
   */
  getNextWord(): Word | null;
  
  /**
   * 标记单词已学习
   * @param wordId 单词 ID
   */
  markWordLearned(wordId: number): void;
  
  /**
   * 获取当前进度信息
   * @returns 进度信息对象
   */
  getProgress(): ProgressInfo;
  
  /**
   * 重置策略状态
   */
  reset(): void;
}

/**
 * 本地存储的学习数据接口
 * 
 * 用于在 localStorage 中持久化学习数据
 */
export interface StoredLearningData {
  /** 用户最后使用的学习模式 */
  lastMode: LearningMode;
  
  /** 各课程各模式的会话状态 */
  sessionStates: {
    [lessonId: number]: {
      [mode: string]: SessionState;
    };
  };
  
  /** 用户偏好设置 */
  preferences: {
    /** 自动保存间隔（毫秒） */
    autoSaveInterval: number;
    
    /** 是否显示进度 */
    showProgress: boolean;
  };
}

/**
 * 学习错误类型枚举
 */
export enum LearningError {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_MODE = 'INVALID_MODE',
  NO_WORDS_AVAILABLE = 'NO_WORDS_AVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

/**
 * 学习异常类
 * 
 * 用于处理学习模式相关的错误
 */
export class LearningException extends Error {
  constructor(
    public code: LearningError,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'LearningException';
  }
}

/**
 * API 请求和响应类型
 */

/** 创建学习会话请求 */
export interface CreateSessionRequest {
  lessonId: number;
  mode: LearningMode;
}

/** 创建学习会话响应 */
export interface CreateSessionResponse {
  sessionId: string;
  words: Word[];
  initialState: SessionState;
}

/** 更新学习进度请求 */
export interface UpdateProgressRequest {
  wordId: number;
  correct: boolean;
  timeSpent: number;
}

/** 更新学习进度响应 */
export interface UpdateProgressResponse {
  nextWord: Word | null;
  progress: ProgressInfo;
}

/** 获取会话状态响应 */
export interface GetSessionResponse {
  sessionId: string;
  mode: LearningMode;
  progress: ProgressInfo;
  currentState: SessionState;
}
