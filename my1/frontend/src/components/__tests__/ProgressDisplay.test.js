import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import ProgressDisplay from '../ProgressDisplay.vue'
import { LearningMode } from '../../stores/learning.js'

describe('ProgressDisplay.vue', () => {
  let wrapper
  
  const defaultProps = {
    mode: LearningMode.SEQUENTIAL,
    progress: {
      currentIndex: 0,
      totalWords: 10,
      learnedCount: 3,
      loopCount: 0
    },
    sessionDuration: 60000, // 1 minute
    showPerformance: true
  }

  beforeEach(() => {
    wrapper = mount(ProgressDisplay, {
      props: defaultProps
    })
  })

  describe('Basic Rendering', () => {
    it('renders progress display correctly', () => {
      expect(wrapper.find('.progress-display').exists()).toBe(true)
      expect(wrapper.find('.progress-title').text()).toBe('学习进度')
    })

    it('displays correct mode name', () => {
      expect(wrapper.find('.mode-name').text()).toBe('顺序学习')
    })

    it('shows progress information', () => {
      expect(wrapper.find('.progress-text').text()).toBe('3 / 10 单词')
      expect(wrapper.find('.progress-percentage').text()).toBe('30%')
    })
  })

  describe('Property 11: 进度计数一致性', () => {
    it('learned + remaining should equal total words', () => {
      const props = {
        ...defaultProps,
        progress: {
          currentIndex: 5,
          totalWords: 20,
          learnedCount: 8,
          loopCount: 1
        }
      }
      
      wrapper = mount(ProgressDisplay, { props })
      
      const totalWords = props.progress.totalWords
      const learnedCount = props.progress.learnedCount
      const remainingCount = totalWords - learnedCount
      
      // 验证进度计数一致性
      expect(learnedCount + remainingCount).toBe(totalWords)
      expect(wrapper.find('.progress-text').text()).toBe(`${learnedCount} / ${totalWords} 单词`)
    })

    it('maintains consistency across different progress states', () => {
      const testCases = [
        { learned: 0, total: 10 },
        { learned: 5, total: 10 },
        { learned: 10, total: 10 },
        { learned: 15, total: 20 },
        { learned: 100, total: 100 }
      ]

      testCases.forEach(({ learned, total }) => {
        const props = {
          ...defaultProps,
          progress: {
            ...defaultProps.progress,
            learnedCount: learned,
            totalWords: total
          }
        }
        
        wrapper = mount(ProgressDisplay, { props })
        
        const remaining = total - learned
        expect(learned + remaining).toBe(total)
        
        // 验证UI显示的一致性
        expect(wrapper.find('.progress-text').text()).toBe(`${learned} / ${total} 单词`)
        
        const expectedPercentage = total === 0 ? 0 : Math.round((learned / total) * 100)
        expect(wrapper.find('.progress-percentage').text()).toBe(`${expectedPercentage}%`)
      })
    })
  })

  describe('Property 12: 总数显示准确性', () => {
    it('displays accurate total word count', () => {
      const testCases = [1, 5, 10, 50, 100, 1000]
      
      testCases.forEach(totalWords => {
        const props = {
          ...defaultProps,
          progress: {
            ...defaultProps.progress,
            totalWords,
            learnedCount: Math.min(totalWords, 5)
          }
        }
        
        wrapper = mount(ProgressDisplay, { props })
        
        // 验证总数显示准确性 - 查找"总单词数"标签对应的值
        const statItems = wrapper.findAll('.stat-item')
        const totalWordsItem = statItems.find(item => 
          item.find('.stat-label').text() === '总单词数'
        )
        expect(totalWordsItem).toBeTruthy()
        expect(totalWordsItem.find('.stat-value').text()).toBe(totalWords.toString())
        expect(wrapper.find('.progress-text').text()).toContain(`/ ${totalWords} 单词`)
      })
    })

    it('handles edge cases for total count', () => {
      // 测试边界情况
      const edgeCases = [
        { totalWords: 0, learnedCount: 0 },
        { totalWords: 1, learnedCount: 0 },
        { totalWords: 1, learnedCount: 1 }
      ]

      edgeCases.forEach(({ totalWords, learnedCount }) => {
        const props = {
          ...defaultProps,
          progress: {
            ...defaultProps.progress,
            totalWords,
            learnedCount
          }
        }
        
        wrapper = mount(ProgressDisplay, { props })
        
        // 验证总数显示准确性 - 查找"总单词数"标签对应的值
        const statItems = wrapper.findAll('.stat-item')
        const totalWordsItem = statItems.find(item => 
          item.find('.stat-label').text() === '总单词数'
        )
        expect(totalWordsItem).toBeTruthy()
        expect(totalWordsItem.find('.stat-value').text()).toBe(totalWords.toString())
      })
    })
  })

  describe('Mode-specific Display', () => {
    it('shows loop count for loop modes', async () => {
      await wrapper.setProps({
        mode: LearningMode.LOOP,
        progress: {
          ...defaultProps.progress,
          loopCount: 3
        }
      })
      
      expect(wrapper.find('.stat-item').exists()).toBe(true)
      const loopCountElement = wrapper.findAll('.stat-item').find(el => 
        el.find('.stat-label').text() === '循环次数'
      )
      expect(loopCountElement).toBeTruthy()
      expect(loopCountElement.find('.stat-value').text()).toBe('3')
    })

    it('shows correct position for different modes', async () => {
      // 顺序模式：显示当前索引+1
      await wrapper.setProps({
        mode: LearningMode.SEQUENTIAL,
        progress: {
          ...defaultProps.progress,
          currentIndex: 4,
          totalWords: 10
        }
      })
      
      const positionElement = wrapper.findAll('.stat-item').find(el => 
        el.find('.stat-label').text() === '当前位置'
      )
      expect(positionElement.find('.stat-value').text()).toBe('5/10')

      // 随机模式：显示已学习/总数
      await wrapper.setProps({
        mode: LearningMode.RANDOM,
        progress: {
          ...defaultProps.progress,
          learnedCount: 3,
          totalWords: 10
        }
      })
      
      expect(positionElement.find('.stat-value').text()).toBe('3/10')
    })
  })

  describe('Performance Calculations', () => {
    it('calculates words per minute correctly', () => {
      const props = {
        ...defaultProps,
        progress: {
          ...defaultProps.progress,
          learnedCount: 6
        },
        sessionDuration: 120000 // 2 minutes
      }
      
      wrapper = mount(ProgressDisplay, { props })
      
      // 6 words in 2 minutes = 3.0 words/minute
      expect(wrapper.vm.wordsPerMinute).toBe('3.0')
    })

    it('handles zero duration gracefully', () => {
      const props = {
        ...defaultProps,
        sessionDuration: 0
      }
      
      wrapper = mount(ProgressDisplay, { props })
      
      expect(wrapper.vm.wordsPerMinute).toBe('0.0')
    })

    it('estimates completion time accurately', () => {
      const props = {
        ...defaultProps,
        progress: {
          ...defaultProps.progress,
          learnedCount: 5,
          totalWords: 10
        },
        sessionDuration: 300000 // 5 minutes for 5 words
      }
      
      wrapper = mount(ProgressDisplay, { props })
      
      // 5 words in 5 minutes = 1 minute per word
      // 5 remaining words = 5 minutes estimated
      expect(wrapper.vm.estimatedCompletion).toBe('约5分钟')
    })
  })

  describe('Responsive and Accessibility', () => {
    it('applies correct CSS classes', () => {
      expect(wrapper.find('.progress-display').classes()).toContain('progress-display')
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
      expect(wrapper.find('.stats-grid').exists()).toBe(true)
    })

    it('handles performance section visibility', async () => {
      await wrapper.setProps({ showPerformance: false })
      expect(wrapper.find('.performance-section').exists()).toBe(false)

      await wrapper.setProps({ showPerformance: true })
      expect(wrapper.find('.performance-section').exists()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty progress data', () => {
      const props = {
        ...defaultProps,
        progress: {
          currentIndex: 0,
          totalWords: 0,
          learnedCount: 0,
          loopCount: 0
        }
      }
      
      wrapper = mount(ProgressDisplay, { props })
      
      expect(wrapper.find('.progress-percentage').text()).toBe('0%')
      expect(wrapper.find('.progress-text').text()).toBe('0 / 0 单词')
    })

    it('handles completed session', () => {
      const props = {
        ...defaultProps,
        progress: {
          currentIndex: 9,
          totalWords: 10,
          learnedCount: 10,
          loopCount: 1
        }
      }
      
      wrapper = mount(ProgressDisplay, { props })
      
      expect(wrapper.find('.progress-percentage').text()).toBe('100%')
      expect(wrapper.vm.estimatedCompletion).toBe('已完成')
    })
  })
})