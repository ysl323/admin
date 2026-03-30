import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
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

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('学习状态管理基础测试', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useLearningStore()
    localStorageMock.clear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  const sampleWords = [
    { id: 1, english: 'hello', chinese: '你好', audioUrl: 'hello.mp3', lessonId: 1 },
    { id: 2, english: 'world', chinese: '世界', audioUrl: 'world.mp3', lessonId: 1 },
    { id: 3, english: 'test', chinese: '测试', audioUrl: 'test.mp3', lessonId: 1 }
  ]

  describe('基础功能测试', () => {
    it('应该能够创建学习会话', async () => {
      await store.startSession(1, sampleWords, LearningMode.SEQUENTIAL)
      
      expect(store.mode).toBe(LearningMode.SEQUENTIAL)
      expect(store.hasActiveSession).toBe(true)
      expect(store.lessonId).toBe(1)
      expect(store.words.length).toBe(3)
      expect(store.progress.totalWords).toBe(3)
    })

    it('应该能够切换学习模式', async () => {
      await store.startSession(1, sampleWords, LearningMode.SEQUENTIAL)
      expect(store.mode).toBe(LearningMode.SEQUENTIAL)
      
      await store.switchMode(LearningMode.RANDOM)
      expect(store.mode).toBe(LearningMode.RANDOM)
    })

    it('应该能够重置会话', async () => {
      await store.startSession(1, sampleWords, LearningMode.SEQUENTIAL)
      expect(store.hasActiveSession).toBe(true)
      
      store.resetSession()
      expect(store.hasActiveSession).toBe(false)
      expect(store.sessionId).toBeNull()
      expect(store.currentWord).toBeNull()
    })

    it('应该能够保存和加载偏好设置', () => {
      store.preferences.lastMode = LearningMode.RANDOM
      store.savePreferences()
      
      // 创建新的 store 实例
      const newStore = useLearningStore()
      newStore.loadPreferences()
      
      expect(newStore.preferences.lastMode).toBe(LearningMode.RANDOM)
    })
  })

  describe('进度追踪测试', () => {
    it('应该正确追踪学习进度', async () => {
      await store.startSession(1, sampleWords, LearningMode.SEQUENTIAL)
      
      expect(store.progress.learnedCount).toBe(0)
      expect(store.progress.totalWords).toBe(3)
      
      if (store.currentWord) {
        await store.submitAnswer(store.currentWord.id, true, 1000)
        expect(store.progress.learnedCount).toBeGreaterThan(0)
      }
    })

    it('应该计算正确的进度百分比', async () => {
      await store.startSession(1, sampleWords, LearningMode.SEQUENTIAL)
      
      expect(store.progressPercentage).toBe(0)
      
      // 模拟学习一个单词
      if (store.currentWord) {
        await store.submitAnswer(store.currentWord.id, true, 1000)
        expect(store.progressPercentage).toBeGreaterThan(0)
      }
    })
  })

  describe('错误处理测试', () => {
    it('应该处理无效的单词数据', async () => {
      await expect(store.startSession(1, [], LearningMode.SEQUENTIAL))
        .rejects.toThrow('Invalid lesson or words data')
    })

    it('应该处理无效的学习模式', () => {
      expect(() => store.createStrategy('invalid_mode'))
        .toThrow('Unknown learning mode: invalid_mode')
    })
  })
})