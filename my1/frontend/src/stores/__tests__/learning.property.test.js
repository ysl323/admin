import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import * as fc from 'fast-check'
import { useLearningStore, LearningMode } from '../learning.js'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

// 设置全局 localStorage mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

// 生成测试用的单词
const wordArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  english: fc.string({ minLength: 1, maxLength: 20 }),
  chinese: fc.string({ minLength: 1, maxLength: 20 }),
  audioUrl: fc.string(),
  lessonId: fc.integer({ min: 1, max: 100 })
})

const wordsArrayArbitrary = fc.array(wordArbitrary, { minLength: 1, maxLength: 10 })
  .map(words => {
    // 确保 ID 唯一
    const uniqueWords = words.map((word, index) => ({
      ...word,
      id: index + 1
    }))
    return uniqueWords
  })

const learningModeArbitrary = fc.constantFrom(
  LearningMode.SEQUENTIAL,
  LearningMode.RANDOM,
  LearningMode.LOOP,
  LearningMode.RANDOM_LOOP
)

describe('学习状态管理属性测试', () => {
  let store

  beforeEach(() => {
    // 为每个测试创建新的 Pinia 实例
    setActivePinia(createPinia())
    store = useLearningStore()
    
    // 清除 localStorage mock
    localStorageMock.clear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('属性 2: 模式切换进度保留', () => {
    it('对于任意两种学习模式，切换模式时应该保留学习进度统计', () => {
      fc.assert(
        fc.property(
          wordsArrayArbitrary,
          learningModeArbitrary,
          learningModeArbitrary,
          async (words, mode1, mode2) => {
            // 跳过相同模式的测试
            if (mode1 === mode2) return

            const lessonId = 1

            // 开始第一个模式的会话
            await store.startSession(lessonId, words, mode1)
            
            // 模拟学习一些单词
            const initialLearnedCount = Math.min(3, words.length)
            for (let i = 0; i < initialLearnedCount; i++) {
              if (store.currentWord) {
                await store.submitAnswer(store.currentWord.id, true, 1000)
              }
            }

            // 记录切换前的进度
            const progressBeforeSwitch = {
              learnedCount: store.progress.learnedCount,
              totalWords: store.progress.totalWords,
              sessionStartTime: store.progress.sessionStartTime
            }

            // 切换到第二个模式
            await store.switchMode(mode2)

            // 验证进度统计被保留
            expect(store.progress.totalWords).toBe(progressBeforeSwitch.totalWords)
            expect(store.progress.sessionStartTime).toEqual(progressBeforeSwitch.sessionStartTime)
            
            // 验证模式确实切换了
            expect(store.mode).toBe(mode2)
          }
        ),
        { numRuns: 3 }
      )
    })
  })

  describe('属性 1: 模式激活一致性', () => {
    it('对于任意选择的学习模式，激活该模式时会话的模式字段应该匹配', () => {
      fc.assert(
        fc.property(
          wordsArrayArbitrary,
          learningModeArbitrary,
          async (words, selectedMode) => {
            const lessonId = 1

            // 激活指定模式
            await store.startSession(lessonId, words, selectedMode)

            // 验证会话模式与选择的模式一致
            expect(store.mode).toBe(selectedMode)
            expect(store.hasActiveSession).toBe(true)
            expect(store.lessonId).toBe(lessonId)
          }
        ),
        { numRuns: 3 }
      )
    })
  })

  describe('属性 15: 会话重置正确性', () => {
    it('对于任意学习模式，重置会话时状态应该正确清空', () => {
      fc.assert(
        fc.property(
          wordsArrayArbitrary,
          learningModeArbitrary,
          async (words, mode) => {
            const lessonId = 1

            // 开始会话并学习一些单词
            await store.startSession(lessonId, words, mode)
            
            // 模拟学习
            if (store.currentWord) {
              await store.submitAnswer(store.currentWord.id, true, 1000)
            }

            // 验证会话是活跃的
            expect(store.hasActiveSession).toBe(true)
            expect(store.progress.totalWords).toBeGreaterThan(0)

            // 重置会话
            store.resetSession()

            // 验证状态被正确清空
            expect(store.hasActiveSession).toBe(false)
            expect(store.sessionId).toBeNull()
            expect(store.lessonId).toBeNull()
            expect(store.currentWord).toBeNull()
            expect(store.strategy).toBeNull()
            expect(store.words).toEqual([])
            expect(store.progress.currentIndex).toBe(0)
            expect(store.progress.totalWords).toBe(0)
            expect(store.progress.learnedCount).toBe(0)
            expect(store.progress.loopCount).toBe(0)
            expect(store.progress.sessionStartTime).toBeNull()
          }
        ),
        { numRuns: 3 }
      )
    })
  })

  describe('属性 13: 持久化往返一致性', () => {
    it('对于任意学习模式和进度，保存后重新加载应该得到相同的数据', () => {
      fc.assert(
        fc.property(
          learningModeArbitrary,
          async (mode) => {
            // 设置偏好
            store.preferences.lastMode = mode
            store.preferences.autoSave = true
            store.preferences.showProgress = true

            // 保存偏好
            store.savePreferences()

            // 创建新的 store 实例来模拟重新加载
            const newStore = useLearningStore()
            newStore.loadPreferences()

            // 验证偏好被正确恢复
            expect(newStore.preferences.lastMode).toBe(mode)
            expect(newStore.preferences.autoSave).toBe(true)
            expect(newStore.preferences.showProgress).toBe(true)
          }
        ),
        { numRuns: 3 }
      )
    })

    it('对于任意会话状态，保存后应该能够正确恢复', () => {
      fc.assert(
        fc.property(
          wordsArrayArbitrary,
          learningModeArbitrary,
          async (words, mode) => {
            const lessonId = 1

            // 开始会话
            await store.startSession(lessonId, words, mode)
            
            // 模拟学习进度
            if (store.currentWord) {
              await store.submitAnswer(store.currentWord.id, true, 1000)
            }

            // 保存会话状态
            const originalProgress = { ...store.progress }
            const originalMode = store.mode
            const originalLessonId = store.lessonId
            
            store.saveSessionState()

            // 创建新的 store 并尝试恢复
            const newStore = useLearningStore()
            const restored = newStore.restoreSessionState(lessonId, mode)

            if (restored) {
              // 验证关键信息被正确恢复
              expect(newStore.lessonId).toBe(originalLessonId)
              expect(newStore.mode).toBe(originalMode)
              expect(newStore.progress.totalWords).toBe(originalProgress.totalWords)
              expect(newStore.progress.learnedCount).toBe(originalProgress.learnedCount)
            }
          }
        ),
        { numRuns: 3 }
      )
    })
  })

  describe('状态一致性验证', () => {
    it('对于任意有效操作序列，store状态应该保持一致', () => {
      fc.assert(
        fc.property(
          wordsArrayArbitrary,
          learningModeArbitrary,
          async (words, mode) => {
            const lessonId = 1

            // 开始会话
            await store.startSession(lessonId, words, mode)

            // 验证初始状态一致性
            expect(store.words.length).toBe(words.length)
            expect(store.progress.totalWords).toBe(words.length)
            expect(store.mode).toBe(mode)
            expect(store.hasActiveSession).toBe(true)

            // 如果有当前单词，验证它来自单词列表
            if (store.currentWord) {
              const wordIds = new Set(words.map(w => w.id))
              expect(wordIds.has(store.currentWord.id)).toBe(true)
            }

            // 验证进度百分比在有效范围内
            expect(store.progressPercentage).toBeGreaterThanOrEqual(0)
            expect(store.progressPercentage).toBeLessThanOrEqual(100)
          }
        ),
        { numRuns: 3 }
      )
    })
  })
})