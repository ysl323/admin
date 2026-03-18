import { defineStore } from 'pinia'
import { SequentialStrategy } from '../strategies/SequentialStrategy'
import { RandomStrategy } from '../strategies/RandomStrategy'
import { LoopStrategy } from '../strategies/LoopStrategy'
import { RandomLoopStrategy } from '../strategies/RandomLoopStrategy'

// 学习模式枚举
export const LearningMode = {
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
    // 当前学习模式
    mode: LearningMode.SEQUENTIAL,
    
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
    
    // 本地存储的学习偏好
    preferences: {
      lastMode: LearningMode.SEQUENTIAL,
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
    
    // 当前模式的显示名称
    currentModeDisplayName: (state) => {
      const names = {
        [LearningMode.SEQUENTIAL]: '顺序学习',
        [LearningMode.RANDOM]: '随机学习',
        [LearningMode.LOOP]: '循环学习',
        [LearningMode.RANDOM_LOOP]: '随机循环'
      }
      return names[state.mode] || '未知模式'
    },
    
    // 是否可以切换模式
    canSwitchMode: (state) => !state.isLoading,
    
    // 会话持续时间（毫秒）
    sessionDuration: (state) => {
      if (!state.progress.sessionStartTime) return 0
      return Date.now() - state.progress.sessionStartTime.getTime()
    }
  },

  actions: {
    // 初始化状态管理
    initialize() {
      this.loadPreferences()
      // 不要自动设置模式，让用户显式选择
    },

    // 创建学习策略实例
    createStrategy(mode) {
      switch (mode) {
        case LearningMode.SEQUENTIAL:
          return new SequentialStrategy()
        case LearningMode.RANDOM:
          return new RandomStrategy()
        case LearningMode.LOOP:
          return new LoopStrategy()
        case LearningMode.RANDOM_LOOP:
          return new RandomLoopStrategy()
        default:
          throw new Error(`Unknown learning mode: ${mode}`)
      }
    },

    // 开始学习会话
    async startSession(lessonId, words, mode = null) {
      try {
        this.isLoading = true
        this.error = null
        
        // 使用指定模式或当前模式
        const sessionMode = mode || this.mode
        
        // 验证输入
        if (!lessonId || !words || words.length === 0) {
          throw new Error('Invalid lesson or words data')
        }
        
        // 创建会话ID
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        this.lessonId = lessonId
        this.mode = sessionMode
        this.words = [...words]
        
        // 创建并初始化策略
        this.strategy = this.createStrategy(sessionMode)
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
        this.preferences.lastMode = sessionMode
        this.savePreferences()
        
        console.log(`Learning session started: ${this.sessionId}, mode: ${sessionMode}, words: ${words.length}`)
        
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

    // 切换学习模式
    async switchMode(newMode) {
      try {
        if (newMode === this.mode) {
          return // 相同模式，无需切换
        }
        
        this.isLoading = true
        
        // 保存当前会话状态
        if (this.hasActiveSession) {
          this.saveSessionState()
        }
        
        // 切换模式
        const oldMode = this.mode
        this.mode = newMode
        
        // 如果有活跃会话，重新初始化策略
        if (this.hasActiveSession && this.words.length > 0) {
          this.strategy = this.createStrategy(newMode)
          this.strategy.initialize(this.words)
          
          // 重置进度（保留已学习统计）
          const oldLearnedCount = this.progress.learnedCount
          this.progress = {
            ...this.progress,
            currentIndex: 0,
            loopCount: 0
          }
          
          // 加载第一个单词
          await this.loadNextWord()
        }
        
        // 保存偏好设置
        this.preferences.lastMode = newMode
        this.savePreferences()
        
        console.log(`Switched learning mode from ${oldMode} to ${newMode}`)
        
      } catch (error) {
        this.error = error.message
        console.error('Failed to switch mode:', error)
        throw error
      } finally {
        this.isLoading = false
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
          mode: this.mode,
          progress: this.progress,
          status: this.status,
          timestamp: new Date().toISOString()
        }
        
        const key = `learning_session_${this.lessonId}_${this.mode}`
        localStorage.setItem(key, JSON.stringify(sessionData))
        
        console.log('Session state saved to localStorage')
      } catch (error) {
        console.error('Failed to save session state:', error)
      }
    },

    // 从本地存储恢复会话状态
    restoreSessionState(lessonId, mode) {
      try {
        const key = `learning_session_${lessonId}_${mode}`
        const savedData = localStorage.getItem(key)
        
        if (savedData) {
          const sessionData = JSON.parse(savedData)
          
          // 恢复基本信息
          this.sessionId = sessionData.sessionId
          this.lessonId = sessionData.lessonId
          this.mode = sessionData.mode
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
    }
  }
})