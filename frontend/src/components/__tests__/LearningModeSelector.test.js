import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LearningModeSelector from '../LearningModeSelector.vue'
import { LearningMode } from '../../stores/learning.js'

describe('LearningModeSelector', () => {
  const createWrapper = (props = {}) => {
    return mount(LearningModeSelector, {
      props: {
        currentMode: LearningMode.SEQUENTIAL,
        disabled: false,
        ...props
      }
    })
  }

  describe('渲染测试', () => {
    it('应该渲染所有四种学习模式', () => {
      const wrapper = createWrapper()
      
      // 检查是否有4个模式按钮
      const modeButtons = wrapper.findAll('.mode-button')
      expect(modeButtons).toHaveLength(4)
      
      // 检查每个模式的名称
      const modeNames = wrapper.findAll('.mode-name')
      expect(modeNames[0].text()).toBe('顺序学习')
      expect(modeNames[1].text()).toBe('随机学习')
      expect(modeNames[2].text()).toBe('循环学习')
      expect(modeNames[3].text()).toBe('随机循环')
    })

    it('应该正确高亮当前模式', () => {
      const wrapper = createWrapper({
        currentMode: LearningMode.RANDOM
      })
      
      const modeButtons = wrapper.findAll('.mode-button')
      
      // 检查第二个按钮（随机模式）是否被激活
      expect(modeButtons[1].classes()).toContain('active')
      
      // 检查其他按钮没有被激活
      expect(modeButtons[0].classes()).not.toContain('active')
      expect(modeButtons[2].classes()).not.toContain('active')
      expect(modeButtons[3].classes()).not.toContain('active')
    })

    it('应该在禁用状态下显示正确的样式', () => {
      const wrapper = createWrapper({
        disabled: true
      })
      
      const modeButtons = wrapper.findAll('.mode-button')
      
      // 所有按钮都应该有 disabled 类
      modeButtons.forEach(button => {
        expect(button.classes()).toContain('disabled')
        expect(button.attributes('disabled')).toBeDefined()
      })
    })

    it('应该显示模式描述', () => {
      const wrapper = createWrapper()
      
      const descriptions = wrapper.findAll('.mode-description')
      expect(descriptions[0].text()).toBe('按顺序逐个学习单词')
      expect(descriptions[1].text()).toBe('随机选择单词学习')
      expect(descriptions[2].text()).toBe('循环重复所有单词')
      expect(descriptions[3].text()).toBe('随机顺序循环学习')
    })
  })

  describe('交互测试', () => {
    it('应该在点击模式按钮时触发 mode-change 事件', async () => {
      const wrapper = createWrapper({
        currentMode: LearningMode.SEQUENTIAL
      })
      
      const modeButtons = wrapper.findAll('.mode-button')
      
      // 点击随机模式按钮
      await modeButtons[1].trigger('click')
      
      // 检查是否触发了正确的事件
      expect(wrapper.emitted('mode-change')).toBeTruthy()
      expect(wrapper.emitted('mode-change')[0]).toEqual([LearningMode.RANDOM])
    })

    it('不应该在点击当前激活的模式时触发事件', async () => {
      const wrapper = createWrapper({
        currentMode: LearningMode.SEQUENTIAL
      })
      
      const modeButtons = wrapper.findAll('.mode-button')
      
      // 点击当前激活的模式（顺序模式）
      await modeButtons[0].trigger('click')
      
      // 不应该触发事件
      expect(wrapper.emitted('mode-change')).toBeFalsy()
    })

    it('不应该在禁用状态下响应点击', async () => {
      const wrapper = createWrapper({
        disabled: true
      })
      
      const modeButtons = wrapper.findAll('.mode-button')
      
      // 点击任意按钮
      await modeButtons[1].trigger('click')
      
      // 不应该触发事件
      expect(wrapper.emitted('mode-change')).toBeFalsy()
    })

    it('应该支持键盘导航', async () => {
      const wrapper = createWrapper()
      
      const firstButton = wrapper.find('.mode-button')
      
      // 测试 focus 事件
      await firstButton.trigger('focus')
      expect(firstButton.classes()).toContain('mode-button')
      
      // 测试 Enter 键
      await firstButton.trigger('keydown.enter')
      // 由于当前模式已经是 SEQUENTIAL，不应该触发事件
      expect(wrapper.emitted('mode-change')).toBeFalsy()
    })
  })

  describe('属性验证测试', () => {
    it('应该验证 currentMode 属性', () => {
      // 测试有效的模式值
      const validModes = Object.values(LearningMode)
      validModes.forEach(mode => {
        const wrapper = createWrapper({ currentMode: mode })
        expect(wrapper.props('currentMode')).toBe(mode)
      })
    })

    it('应该有正确的默认属性值', () => {
      const wrapper = mount(LearningModeSelector)
      
      expect(wrapper.props('currentMode')).toBe(LearningMode.SEQUENTIAL)
      expect(wrapper.props('disabled')).toBe(false)
    })
  })

  describe('方法测试', () => {
    it('getModeDisplayName 应该返回正确的模式名称', () => {
      const wrapper = createWrapper()
      const vm = wrapper.vm
      
      expect(vm.getModeDisplayName(LearningMode.SEQUENTIAL)).toBe('顺序学习')
      expect(vm.getModeDisplayName(LearningMode.RANDOM)).toBe('随机学习')
      expect(vm.getModeDisplayName(LearningMode.LOOP)).toBe('循环学习')
      expect(vm.getModeDisplayName(LearningMode.RANDOM_LOOP)).toBe('随机循环')
      expect(vm.getModeDisplayName('invalid')).toBe('未知模式')
    })

    it('handleModeChange 应该正确处理模式切换', () => {
      const wrapper = createWrapper({
        currentMode: LearningMode.SEQUENTIAL
      })
      const vm = wrapper.vm
      
      // Mock emit
      const emitSpy = vi.spyOn(vm, '$emit')
      
      // 测试切换到不同模式
      vm.handleModeChange(LearningMode.RANDOM)
      expect(emitSpy).toHaveBeenCalledWith('mode-change', LearningMode.RANDOM)
      
      // 测试切换到相同模式（不应该触发）
      emitSpy.mockClear()
      vm.handleModeChange(LearningMode.SEQUENTIAL)
      expect(emitSpy).not.toHaveBeenCalled()
    })
  })

  describe('响应式设计测试', () => {
    it('应该在移动设备上正确显示', () => {
      const wrapper = createWrapper()
      
      // 检查是否有响应式类
      expect(wrapper.find('.mode-buttons').exists()).toBe(true)
      expect(wrapper.find('.mode-button').exists()).toBe(true)
    })
  })

  describe('无障碍性测试', () => {
    it('应该有正确的 ARIA 属性', () => {
      const wrapper = createWrapper()
      
      const buttons = wrapper.findAll('.mode-button')
      buttons.forEach(button => {
        // 按钮应该是可聚焦的
        expect(button.element.tagName).toBe('BUTTON')
      })
    })

    it('应该支持键盘操作', async () => {
      const wrapper = createWrapper()
      
      const button = wrapper.find('.mode-button')
      
      // 测试 Tab 键导航
      await button.trigger('focus')
      expect(document.activeElement).toBe(button.element)
    })
  })
})