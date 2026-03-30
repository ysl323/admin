import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import LearningPage from '../LearningPage.vue'
import { useLearningStore, LearningMode } from '../../stores/learning.js'

// Mock the router
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn()
}

const mockRoute = {
  params: { id: '1' }
}

// Mock the services
vi.mock('../../services/learning', () => ({
  default: {
    getWordsByLesson: vi.fn(),
    checkAnswer: vi.fn()
  }
}))

vi.mock('../../services/tts', () => ({
  default: {
    speak: vi.fn()
  }
}))

vi.mock('../../utils/AudioManager', () => ({
  default: {
    play: vi.fn(),
    stop: vi.fn()
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

describe('LearningPage Integration Tests', () => {
  let wrapper
  let pinia
  let learningStore
  let learningService
  
  const mockWords = [
    { id: 1, english: 'hello', chinese: '你好' },
    { id: 2, english: 'world', chinese: '世界' },
    { id: 3, english: 'test word', chinese: '测试单词' },
    { id: 4, english: 'learning', chinese: '学习' },
    { id: 5, english: 'mode', chinese: '模式' }
  ]

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)
    learningStore = useLearningStore()
    
    // Import and mock the learning service
    learningService = (await import('../../services/learning')).default
    vi.mocked(learningService.getWordsByLesson).mockResolvedValue({
      success: true,
      words: mockWords,
      lesson: {
        categoryId: 1,
        categoryName: '基础英语',
        lessonNumber: 1
      }
    })
    
    vi.mocked(learningService.checkAnswer).mockResolvedValue({
      correct: true
    })
  })

  const createWrapper = () => {
    return mount(LearningPage, {
      global: {
        plugins: [pinia],
        mocks: {
          $router: mockRouter,
          $route: mockRoute
        },
        stubs: {
          'el-breadcrumb': true,
          'el-breadcrumb-item': true,
          'el-skeleton': true,
          'el-card': true,
          'el-progress': true,
          'el-button': true,
          'el-dialog': true,
          'el-empty': true,
          'el-icon': true,
          'NavBar': true
        }
      }
    })
  }

  describe('Learning Mode Integration', () => {
    it('integrates mode selector with learning session', async () => {
      wrapper = createWrapper()
      
      // Wait for component to load
      await wrapper.vm.$nextTick()
      
      // Verify mode selector is rendered
      expect(wrapper.findComponent({ name: 'LearningModeSelector' }).exists()).toBe(true)
      
      // Verify progress display is rendered
      expect(wrapper.findComponent({ name: 'ProgressDisplay' }).exists()).toBe(true)
      
      // Check initial mode
      expect(learningStore.mode).toBe(LearningMode.SEQUENTIAL)
    })

    it('handles mode switching correctly', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      const modeSelector = wrapper.findComponent({ name: 'LearningModeSelector' })
      
      // Switch to random mode
      await modeSelector.vm.$emit('mode-change', LearningMode.RANDOM)
      await wrapper.vm.$nextTick()
      
      // Verify mode changed in store
      expect(learningStore.mode).toBe(LearningMode.RANDOM)
      
      // Verify progress display updated
      const progressDisplay = wrapper.findComponent({ name: 'ProgressDisplay' })
      expect(progressDisplay.props('mode')).toBe(LearningMode.RANDOM)
    })

    it('maintains progress across mode switches', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Start learning session
      await learningStore.startSession(1, mockWords, LearningMode.SEQUENTIAL)
      
      // Submit some answers
      await learningStore.submitAnswer(1, true)
      await learningStore.submitAnswer(2, true)
      
      const initialLearnedCount = learningStore.progress.learnedCount
      
      // Switch mode
      const modeSelector = wrapper.findComponent({ name: 'LearningModeSelector' })
      await modeSelector.vm.$emit('mode-change', LearningMode.RANDOM)
      await wrapper.vm.$nextTick()
      
      // Verify learned count is preserved
      expect(learningStore.progress.learnedCount).toBe(initialLearnedCount)
    })
  })

  describe('Complete Learning Flow', () => {
    it('completes full learning session in sequential mode', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Start session
      await learningStore.startSession(1, mockWords, LearningMode.SEQUENTIAL)
      
      // Complete all words
      for (let i = 0; i < mockWords.length; i++) {
        const currentWord = learningStore.currentWord
        expect(currentWord).toBeTruthy()
        
        await learningStore.submitAnswer(currentWord.id, true)
        
        if (i < mockWords.length - 1) {
          await learningStore.loadNextWord()
        }
      }
      
      // Verify session completion
      expect(learningStore.progress.learnedCount).toBe(mockWords.length)
    })

    it('handles random mode word selection', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Start random session
      await learningStore.startSession(1, mockWords, LearningMode.RANDOM)
      
      const seenWords = new Set()
      
      // Learn some words
      for (let i = 0; i < 3; i++) {
        const currentWord = learningStore.currentWord
        expect(currentWord).toBeTruthy()
        expect(mockWords.some(w => w.id === currentWord.id)).toBe(true)
        
        seenWords.add(currentWord.id)
        await learningStore.submitAnswer(currentWord.id, true)
        await learningStore.loadNextWord()
      }
      
      // Verify no duplicates in random mode (within one round)
      expect(seenWords.size).toBe(3)
    })

    it('handles loop mode cycling', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Start loop session
      await learningStore.startSession(1, mockWords, LearningMode.LOOP)
      
      // Complete one full cycle
      for (let i = 0; i < mockWords.length; i++) {
        const currentWord = learningStore.currentWord
        expect(currentWord.id).toBe(mockWords[i].id)
        
        await learningStore.submitAnswer(currentWord.id, true)
        await learningStore.loadNextWord()
      }
      
      // Verify loop count increased
      expect(learningStore.progress.loopCount).toBe(1)
      
      // Verify it cycles back to first word
      expect(learningStore.currentWord.id).toBe(mockWords[0].id)
    })
  })

  describe('Error Handling', () => {
    it('handles mode switch errors gracefully', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Mock an error in mode switching
      const originalSwitchMode = learningStore.switchMode
      learningStore.switchMode = vi.fn().mockRejectedValue(new Error('Switch failed'))
      
      const modeSelector = wrapper.findComponent({ name: 'LearningModeSelector' })
      
      // Attempt mode switch
      await modeSelector.vm.$emit('mode-change', LearningMode.RANDOM)
      await wrapper.vm.$nextTick()
      
      // Verify error handling (mode should remain unchanged)
      expect(learningStore.mode).toBe(LearningMode.SEQUENTIAL)
      
      // Restore original method
      learningStore.switchMode = originalSwitchMode
    })

    it('handles empty word list gracefully', async () => {
      // Mock empty word list
      vi.mocked(learningService.getWordsByLesson).mockResolvedValue({
        success: true,
        words: [],
        lesson: { categoryId: 1, categoryName: '空课程', lessonNumber: 1 }
      })
      
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Should show empty state
      expect(wrapper.find('.el-empty').exists()).toBe(true)
    })
  })

  describe('Progress Tracking', () => {
    it('tracks progress accurately across different modes', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Test sequential mode progress
      await learningStore.startSession(1, mockWords, LearningMode.SEQUENTIAL)
      
      expect(learningStore.progress.totalWords).toBe(mockWords.length)
      expect(learningStore.progress.learnedCount).toBe(0)
      expect(learningStore.progress.currentIndex).toBe(0)
      
      // Submit answer
      await learningStore.submitAnswer(mockWords[0].id, true)
      await learningStore.loadNextWord()
      
      expect(learningStore.progress.learnedCount).toBe(1)
      expect(learningStore.progress.currentIndex).toBe(1)
      
      // Switch to random mode
      await learningStore.switchMode(LearningMode.RANDOM)
      
      // Progress should be maintained
      expect(learningStore.progress.totalWords).toBe(mockWords.length)
      expect(learningStore.progress.learnedCount).toBe(1)
    })

    it('calculates progress percentage correctly', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      await learningStore.startSession(1, mockWords, LearningMode.SEQUENTIAL)
      
      // Initial progress
      expect(learningStore.progressPercentage).toBe(0)
      
      // After learning 2 out of 5 words
      await learningStore.submitAnswer(mockWords[0].id, true)
      await learningStore.loadNextWord()
      await learningStore.submitAnswer(mockWords[1].id, true)
      await learningStore.loadNextWord()
      
      expect(learningStore.progressPercentage).toBe(40) // 2/5 * 100
    })
  })

  describe('Session Management', () => {
    it('handles session lifecycle correctly', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Start session
      await learningStore.startSession(1, mockWords, LearningMode.SEQUENTIAL)
      expect(learningStore.hasActiveSession).toBe(true)
      expect(learningStore.sessionId).toBeTruthy()
      
      // Pause session
      learningStore.pauseSession()
      expect(learningStore.status).toBe('paused')
      
      // Resume session
      learningStore.resumeSession()
      expect(learningStore.status).toBe('active')
      
      // End session
      learningStore.endSession()
      expect(learningStore.hasActiveSession).toBe(false)
    })

    it('saves and restores session state', async () => {
      wrapper = createWrapper()
      await wrapper.vm.$nextTick()
      
      // Start session and make progress
      await learningStore.startSession(1, mockWords, LearningMode.RANDOM)
      await learningStore.submitAnswer(mockWords[0].id, true)
      
      const sessionData = {
        mode: learningStore.mode,
        progress: { ...learningStore.progress }
      }
      
      // Save session state
      learningStore.saveSessionState()
      
      // Reset store
      learningStore.resetSession()
      
      // Restore session state
      const restored = learningStore.restoreSessionState(1, LearningMode.RANDOM)
      expect(restored).toBe(true)
      
      // Verify data restored
      expect(learningStore.mode).toBe(sessionData.mode)
    })
  })
})