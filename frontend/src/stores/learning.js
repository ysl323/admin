import { defineStore } from 'pinia'
import { SequentialStrategy } from '../strategies/SequentialStrategy'
import { RandomStrategy } from '../strategies/RandomStrategy'
import { LoopStrategy } from '../strategies/LoopStrategy'
import { RandomLoopStrategy } from '../strategies/RandomLoopStrategy'
import wordMasteryService from '../services/wordMastery'

// 显示模式枚举（英文是否显示）
export const DisplayMode = {
  BEGINNER: 'beginner',  // 小白模式：显示英文
  ADVANCED: 'advanced'   // 进阶模式：隐藏英文
}

// 顺序模式枚举（学习顺序）
export const SequenceMode = {
  SEQUENTIAL: 'sequential',     // 顺序学习
  RANDOM: 'random',             // 随机学习
  LOOP: 'loop',                 // 循环学习
  RANDOM_LOOP: 'random_loop'    // 随机循环
}

// 兼容旧代码的 LearningMode（已废弃，但保留兼容）
export const LearningMode = {
  BEGINNER: 'beginner',
  ADVANCED: 'advanced',
  SEQUENTIAL: 'sequential',
  RANDOM: 'random',
  LOOP: 'loop',
  RANDOM_LOOP: 'random_loop'
}

// 会话状态枚举
export const SessionStatus = {
  IDLE: 'idle',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
}

export const useLearningStore = defineStore('learning', {
  state: () => ({
    // 显示模式（小白/进阶）
    displayMode: DisplayMode.BEGINNER,
    
    // 顺序模式（顺序/随机/循环/随机循环）
    sequenceMode: SequenceMode.SEQUENTIAL,
    
    // 兼容旧代码的 mode（根据 displayMode 和 sequenceMode 计算）
    mode: LearningMode.BEGINNER,

    // 会话信息
    session: null,
    sessionId: null,
    lessonId: null,
    status: SessionStatus.IDLE,

    // 当前单词和策略
    currentWord: null,
    strategy: null,
    words: [],

    // 学习进度
    progress: {
      currentIndex: 0,
      totalWords: 0,
      learnedCount: 0,
      loopCount: 0,
      sessionStartTime: null
    },

    // UI 状态
    isLoading: false,
    error: null,

    // 单词掌握状态
    masteredWords: [], // 使用数组存储已掌握的单词ID，便于序列化
    masteryLoading: false,

    // 本地存储的学习偏好
    preferences: {
      lastDisplayMode: DisplayMode.BEGINNER,
      lastSequenceMode: SequenceMode.SEQUENTIAL,
      autoSave: true,
      showProgress: true
    }
  }),

  getters: {
    // 是否有活跃会话
    hasActiveSession: (state) => state.status === SessionStatus.ACTIVE,
    
    // 进度百分比
    progressPercentage: (state) => {
      if (state.progress.totalWords === 0) return 0
      return Math.round((state.progress.learnedCount / state.progress.totalWords) * 100)
    },
    
    // 当前模式的显示名称（组合显示模式和顺序模式）
    currentModeDisplayName: (state) => {
      const displayNames = {
        [DisplayMode.BEGINNER]: '小白',
        [DisplayMode.ADVANCED]: '进阶'
      }
      const sequenceNames = {
        [SequenceMode.SEQUENTIAL]: '顺序',
        [SequenceMode.RANDOM]: '随机',
        [SequenceMode.LOOP]: '循环',
        [SequenceMode.RANDOM_LOOP]: '随机循环'
      }
      return `${displayNames[state.displayMode] || '未知'}+${sequenceNames[state.sequenceMode] || '未知'}`
    },
    
    // 是否可以切换模式
    canSwitchMode: (state) => !state.isLoading,
    
    // 会话持续时间（毫秒）
    sessionDuration: (state) => {
      if (!state.progress.sessionStartTime) return 0
      return Date.now() - state.progress.sessionStartTime.getTime()
    },

    // 当前单词是否已掌握
    isCurrentWordMastered: (state) => {
      return state.currentWord ? state.masteredWords.includes(state.currentWord.id) : false
    },

    // 当前模式是否为小白模式（显示英文）
    isBeginnerMode: (state) => {
      return state.displayMode === DisplayMode.BEGINNER
    },

    // 当前模式是否为进阶模式（隐藏英文）
    isAdvancedMode: (state) => {
      return state.displayMode === DisplayMode.ADVANCED
    },

    // 当前单词在小白模式下是否应该显示英文
    shouldShowEnglishForCurrentWord: (state) => {
      // 小白模式：未掌握的单词显示英文，已掌握的隐藏
      // 进阶模式：默认隐藏英文
      if (state.displayMode !== DisplayMode.BEGINNER) {
        return false;
      }
      if (!state.currentWord) {
        return false; // 没有当前单词时不显示，避免渲染错误
      }
      // 小白模式下，已掌握的单词隐藏英文
      return !state.masteredWords.includes(state.currentWord.id);
    }
  },

  actions: {
    // 初始化状态管理
    initialize() {
      this.loadPreferences()
      // 应用保存的偏好设置
      if (this.preferences.lastDisplayMode) {
        this.displayMode = this.preferences.lastDisplayMode
      }
      if (this.preferences.lastSequenceMode) {
        this.sequenceMode = this.preferences.lastSequenceMode
      }
    },

    // 创建学习策略实例（根据顺序模式）
    createStrategy(sequenceMode) {
      switch (sequenceMode) {
        case SequenceMode.SEQUENTIAL:
          return new SequentialStrategy()
        case SequenceMode.RANDOM:
          return new RandomStrategy()
        case SequenceMode.LOOP:
          return new LoopStrategy()
        case SequenceMode.RANDOM_LOOP:
          return new RandomLoopStrategy()
        default:
          throw new Error(`Unknown sequence mode: ${sequenceMode}`)
      }
    },

    // 切换显示模式（小白/进阶）
    async switchDisplayMode(newDisplayMode) {
      if (newDisplayMode === this.displayMode) {
        return // 相同模式，无需切换
      }
      
      this.displayMode = newDisplayMode
      this.preferences.lastDisplayMode = newDisplayMode
      this.savePreferences()
      
      console.log(`Display mode switched to: ${newDisplayMode}`)
    },

    // 切换顺序模式
    async switchSequenceMode(newSequenceMode) {
      try {
        if (newSequenceMode === this.sequenceMode) {
          return // 相同模式，无需切换
        }
        
        this.isLoading = true
        
        const oldMode = this.sequenceMode
        this.sequenceMode = newSequenceMode
        
        // 如果有活跃会话，重新初始化策略
        if (this.hasActiveSession && this.words.length > 0) {
          this.strategy = this.createStrategy(newSequenceMode)
          this.strategy.initialize(this.words)
          
          // 重置进度
          this.progress = {
            ...this.progress,
            currentIndex: 0,
            loopCount: 0
          }
          
          // 加载第一个单词
          await this.loadNextWord()
        }
        
        // 保存偏好设置
        this.preferences.lastSequenceMode = newSequenceMode
        this.savePreferences()
        
        console.log(`Sequence mode switched from ${oldMode} to ${newSequenceMode}`)
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to switch sequence mode:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 开始学习会话
    async startSession(lessonId, words, options = null) {
      try {
        this.isLoading = true
        this.error = null

        // 使用指定模式或当前模式
        const sessionDisplayMode = options?.displayMode || this.displayMode
        const sessionSequenceMode = options?.sequenceMode || this.sequenceMode

        // 验证输入
        if (!lessonId || !words || words.length === 0) {
          throw new Error('Invalid lesson or words data')
        }

        // 创建会话ID
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        this.lessonId = lessonId
        this.displayMode = sessionDisplayMode
        this.sequenceMode = sessionSequenceMode
        this.words = [...words]

        // 加载单词掌握状态
        await this.loadMasteryData(lessonId)

        // 创建并初始化策略（根据顺序模式）
        this.strategy = this.createStrategy(sessionSequenceMode)
        this.strategy.initialize(words)

        // 初始化进度
        this.progress = {
          currentIndex: 0,
          totalWords: words.length,
          learnedCount: 0,
          loopCount: 0,
          sessionStartTime: new Date()
        }

        // 设置会话状态
        this.status = SessionStatus.ACTIVE

        // 加载第一个单词
        await this.loadNextWord()

        // 保存偏好设置
        this.preferences.lastDisplayMode = sessionDisplayMode
        this.preferences.lastSequenceMode = sessionSequenceMode
        this.savePreferences()

        console.log(`Learning session started: ${this.sessionId}, display: ${sessionDisplayMode}, sequence: ${sessionSequenceMode}, words: ${words.length}`)

      } catch (error) {
        this.error = error.message
        this.status = SessionStatus.IDLE
        console.error('Failed to start learning session:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // 加载下一个单词
    async loadNextWord() {
      try {
        if (!this.strategy) {
          throw new Error('No active strategy')
        }
        
        // 从策略获取下一个单词
        const nextWord = this.strategy.getNextWord()
        
        if (nextWord) {
          this.currentWord = nextWord
          
          // 更新进度信息
          const strategyProgress = this.strategy.getProgress()
          this.progress = {
            ...this.progress,
            currentIndex: strategyProgress.currentIndex,
            learnedCount: strategyProgress.learnedCount,
            loopCount: strategyProgress.loopCount
          }
          
          console.log(`Loaded next word: ${nextWord.english}, progress: ${this.progress.learnedCount}/${this.progress.totalWords}`)
        } else {
          // 没有更多单词，会话完成
          this.currentWord = null
          this.status = SessionStatus.COMPLETED
          console.log('Learning session completed')
        }
        
        return nextWord
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to load next word:', error)
        throw error
      }
    },

    // 提交答案并继续
    async submitAnswer(wordId, correct, timeSpent = 0) {
      try {
        if (!this.strategy || !this.currentWord) {
          throw new Error('No active word or strategy')
        }

        // 只有答对才标记为已学习并推进
        if (correct) {
          // 标记单词为已学习
          this.strategy.markWordLearned(wordId, correct)

          // 记录学习数据
          const learningRecord = {
            sessionId: this.sessionId,
            wordId: wordId,
            correct: correct,
            timeSpent: timeSpent,
            timestamp: new Date()
          }

          console.log('Answer submitted:', learningRecord)

          // 加载下一个单词
          await this.loadNextWord()

          // 自动保存进度
          if (this.preferences.autoSave) {
            this.saveSessionState()
          }
        } else {
          // 答错：只记录，不推进
          console.log('Answer incorrect, staying on current word:', wordId)
        }

      } catch (error) {
        this.error = error.message
        console.error('Failed to submit answer:', error)
        throw error
      }
    },

    // 暂停会话
    pauseSession() {
      if (this.status === SessionStatus.ACTIVE) {
        this.status = SessionStatus.PAUSED
        this.saveSessionState()
        console.log('Learning session paused')
      }
    },

    // 恢复会话
    resumeSession() {
      if (this.status === SessionStatus.PAUSED) {
        this.status = SessionStatus.ACTIVE
        console.log('Learning session resumed')
      }
    },

    // 结束会话
    endSession() {
      this.saveSessionState()
      this.resetSession()
      console.log('Learning session ended')
    },

    // 重置会话状态
    resetSession() {
      this.session = null
      this.sessionId = null
      this.lessonId = null
      this.status = SessionStatus.IDLE
      this.currentWord = null
      this.strategy = null
      this.words = []
      this.progress = {
        currentIndex: 0,
        totalWords: 0,
        learnedCount: 0,
        loopCount: 0,
        sessionStartTime: null
      }
      this.error = null
    },

    // 保存会话状态到本地存储
    saveSessionState() {
      if (!this.sessionId) return
      
      try {
        const sessionData = {
          sessionId: this.sessionId,
          lessonId: this.lessonId,
          displayMode: this.displayMode,
          sequenceMode: this.sequenceMode,
          progress: this.progress,
          status: this.status,
          timestamp: new Date().toISOString()
        }
        
        const key = `learning_session_${this.lessonId}_${this.displayMode}_${this.sequenceMode}`
        localStorage.setItem(key, JSON.stringify(sessionData))
        
        console.log('Session state saved to localStorage')
      } catch (error) {
        console.error('Failed to save session state:', error)
      }
    },

    // 从本地存储恢复会话状态
    restoreSessionState(lessonId, displayMode, sequenceMode) {
      try {
        const key = `learning_session_${lessonId}_${displayMode}_${sequenceMode}`
        const savedData = localStorage.getItem(key)
        
        if (savedData) {
          const sessionData = JSON.parse(savedData)
          
          // 恢复基本信息
          this.sessionId = sessionData.sessionId
          this.lessonId = sessionData.lessonId
          this.displayMode = sessionData.displayMode
          this.sequenceMode = sessionData.sequenceMode
          this.progress = {
            ...sessionData.progress,
            sessionStartTime: new Date(sessionData.progress.sessionStartTime)
          }
          this.status = SessionStatus.PAUSED // 恢复为暂停状态
          
          console.log('Session state restored from localStorage')
          return true
        }
      } catch (error) {
        console.error('Failed to restore session state:', error)
      }
      
      return false
    },

    // 保存用户偏好设置
    savePreferences() {
      try {
        localStorage.setItem('learning_preferences', JSON.stringify(this.preferences))
      } catch (error) {
        console.error('Failed to save preferences:', error)
      }
    },

    // 加载用户偏好设置
    loadPreferences() {
      try {
        const saved = localStorage.getItem('learning_preferences')
        if (saved) {
          this.preferences = { ...this.preferences, ...JSON.parse(saved) }
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    },

    // 清除错误状态
    clearError() {
      this.error = null
    },

    // 获取学习统计
    getStatistics() {
      return {
        mode: this.mode,
        totalWords: this.progress.totalWords,
        learnedCount: this.progress.learnedCount,
        loopCount: this.progress.loopCount,
        progressPercentage: this.progressPercentage,
        sessionDuration: this.sessionDuration,
        wordsPerMinute: this.sessionDuration > 0 ?
          (this.progress.learnedCount / (this.sessionDuration / 60000)).toFixed(1) : 0
      }
    },

    // 标记单词为已掌握
    async markAsMastered(wordId) {
      try {
        if (!wordId) {
          throw new Error('Invalid word ID');
        }

        this.masteryLoading = true;

        // 添加到已掌握数组（去重）
        const wasAlreadyMastered = this.masteredWords.includes(wordId);
        if (!wasAlreadyMastered) {
          this.masteredWords.push(wordId);

          // 立即保存到本地存储
          this.saveMasteryData();

          // 尝试同步到服务器（异步，不阻塞UI）
          if (this.lessonId) {
            wordMasteryService.markAsMastered(this.lessonId, wordId)
              .then(() => {
                console.log(`Word ${wordId} synced to server`);
              })
              .catch((error) => {
                console.warn(`Failed to sync word ${wordId} to server:`, error);
                // 失败了也没关系，本地已有保存
              });
          }
        }

        console.log(`Word ${wordId} marked as mastered, was already mastered: ${wasAlreadyMastered}`);

        return {
          success: true,
          isNew: !wasAlreadyMastered,
          wasAlreadyMastered
        };
      } catch (error) {
        console.error('Failed to mark word as mastered:', error);
        this.error = error.message;
        return { success: false, isNew: false, wasAlreadyMastered: false };
      } finally {
        this.masteryLoading = false;
      }
    },

    // 取消单词掌握状态（用于误操作撤销）
    async unmarkAsMastered(wordId) {
      try {
        if (!wordId) {
          throw new Error('Invalid word ID');
        }

        this.masteryLoading = true;

        // 从已掌握数组中移除
        const index = this.masteredWords.indexOf(wordId);
        if (index !== -1) {
          this.masteredWords.splice(index, 1);

          // 更新本地存储
          this.saveMasteryData();

          // 尝试同步到服务器（异步）
          wordMasteryService.unmarkAsMastered(wordId)
            .then(() => {
              console.log(`Word ${wordId} unmarked on server`);
            })
            .catch((error) => {
              console.warn(`Failed to unmark word ${wordId} on server:`, error);
            });

          console.log(`Word ${wordId} unmarked as mastered`);
          return true;
        }

        console.log(`Word ${wordId} was not marked as mastered`);
        return false;
      } catch (error) {
        console.error('Failed to unmark word as mastered:', error);
        this.error = error.message;
        return false;
      } finally {
        this.masteryLoading = false;
      }
    },

    // 同步离线的掌握数据到服务器
    async syncOfflineMasteryData() {
      try {
        // 获取所有课程的本地掌握数据
        const offlineData = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key.startsWith('word_mastery_')) {
            try {
              const saved = localStorage.getItem(key);
              const masteryData = JSON.parse(saved);
              const lessonId = parseInt(key.replace('word_mastery_', ''));

              if (masteryData.masteredIds && masteryData.masteredIds.length > 0) {
                masteryData.masteredIds.forEach(wordId => {
                  offlineData.push({
                    lessonId,
                    wordId,
                    masteredAt: masteryData.updatedAt
                  });
                });
              }
            } catch (error) {
              console.warn(`Failed to parse offline mastery data for key ${key}:`, error);
            }
          }
        }

        if (offlineData.length === 0) {
          console.log('No offline mastery data to sync');
          return { synced: 0, failed: 0 };
        }

        // 批量同步到服务器
        const response = await wordMasteryService.syncMastery(offlineData);

        console.log(`Synced offline mastery data: ${response.data?.synced || 0} synced, ${response.data?.failed || 0} failed`);

        return {
          synced: response.data?.synced || 0,
          failed: response.data?.failed || 0
        };
      } catch (error) {
        console.error('Failed to sync offline mastery data:', error);
        return { synced: 0, failed: 0 };
      }
    },

    // 检查单词是否已掌握
    checkMasteryStatus(wordId) {
      return this.masteredWords.includes(wordId);
    },

    // 加载课程的掌握状态数据
    async loadMasteryData(lessonId) {
      try {
        // 无论lessonId是否为空，都重置掌握状态
        this.masteredWords = [];

        if (!lessonId) {
          return;
        }

        this.masteryLoading = true;

        // 首先从本地存储加载（快速显示）
        const localKey = `word_mastery_${lessonId}`;
        const localSaved = localStorage.getItem(localKey);

        if (localSaved) {
          try {
            const localMasteryData = JSON.parse(localSaved);
            this.masteredWords = localMasteryData.masteredIds || [];
            console.log(`Loaded ${this.masteredWords.length} mastered words from local storage for lesson ${lessonId}`);
          } catch (error) {
            console.warn('Failed to parse local mastery data:', error);
          }
        }

        // 然后从服务器同步最新数据
        try {
          const serverMasteredIds = await wordMasteryService.getLessonMastery(lessonId);
          this.masteredWords = serverMasteredIds;

          // 更新本地存储
          this.saveMasteryData();

          console.log(`Synced ${this.masteredWords.length} mastered words from server for lesson ${lessonId}`);
        } catch (error) {
          console.warn('Failed to sync mastery data from server:', error);
          // 服务器同步失败，继续使用本地数据
        }

      } catch (error) {
        console.error('Failed to load mastery data:', error);
        this.masteredWords = [];
      } finally {
        this.masteryLoading = false;
      }
    },

    // 保存掌握状态到本地存储
    saveMasteryData() {
      try {
        if (!this.lessonId) {
          return;
        }

        const key = `word_mastery_${this.lessonId}`;
        const masteryData = {
          lessonId: this.lessonId,
          masteredIds: this.masteredWords,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem(key, JSON.stringify(masteryData));

        console.log(`Mastery data saved: ${this.masteredWords.length} words`);
      } catch (error) {
        console.error('Failed to save mastery data:', error);
      }
    },

    // 清除掌握状态
    clearMasteryData() {
      this.masteredWords = [];

      if (this.lessonId) {
        const key = `word_mastery_${this.lessonId}`;
        localStorage.removeItem(key);
      }

      console.log('Mastery data cleared');
    }
  }
})