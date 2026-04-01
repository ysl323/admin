<template>
  <div :class="['learning-mode-selector', { 'compact': compact }]">
    <h3 v-if="!compact" class="selector-title">选择学习模式</h3>
    <div :class="['mode-selectors', { 'compact-selectors': compact }]">
      <!-- 显示模式选择器（小白/进阶） -->
      <div class="selector-group">
        <label v-if="!compact" class="selector-label">英文显示</label>
        <select
          :class="['mode-select', { 'compact-select': compact }]"
          :value="currentDisplayMode"
          :disabled="disabled"
          @change="handleDisplayModeChange($event.target.value)"
        >
          <option v-for="mode in displayModes" :key="mode.value" :value="mode.value">
            {{ mode.name }}
          </option>
        </select>
      </div>
      
      <!-- 顺序模式选择器 -->
      <div class="selector-group">
        <label v-if="!compact" class="selector-label">学习顺序</label>
        <select
          :class="['mode-select', { 'compact-select': compact }]"
          :value="currentSequenceMode"
          :disabled="disabled"
          @change="handleSequenceModeChange($event.target.value)"
        >
          <option v-for="mode in sequenceModes" :key="mode.value" :value="mode.value">
            {{ mode.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { DisplayMode, SequenceMode } from '../stores/learning.js'

export default {
  name: 'LearningModeSelector',
  
  props: {
    currentDisplayMode: {
      type: String,
      default: DisplayMode.BEGINNER,
      validator: (value) => Object.values(DisplayMode).includes(value)
    },
    currentSequenceMode: {
      type: String,
      default: SequenceMode.SEQUENTIAL,
      validator: (value) => Object.values(SequenceMode).includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    compact: {
      type: Boolean,
      default: false
    }
  },

  emits: ['display-mode-change', 'sequence-mode-change'],

  data() {
    return {
      displayModes: [
        { value: DisplayMode.BEGINNER, name: '小白模式', description: '显示英文辅助学习' },
        { value: DisplayMode.ADVANCED, name: '进阶模式', description: '隐藏英文，听写练习' }
      ],
      sequenceModes: [
        { value: SequenceMode.SEQUENTIAL, name: '顺序学习', description: '按顺序逐个学习' },
        { value: SequenceMode.RANDOM, name: '随机学习', description: '随机选择学习' },
        { value: SequenceMode.LOOP, name: '循环学习', description: '循环重复所有单词' },
        { value: SequenceMode.RANDOM_LOOP, name: '随机循环', description: '随机顺序循环学习' }
      ]
    }
  },

  methods: {
    handleDisplayModeChange(mode) {
      if (this.disabled || mode === this.currentDisplayMode) {
        return
      }
      this.$emit('display-mode-change', mode)
    },

    handleSequenceModeChange(mode) {
      if (this.disabled || mode === this.currentSequenceMode) {
        return
      }
      this.$emit('sequence-mode-change', mode)
    }
  }
}
</script>

<style scoped>
.learning-mode-selector {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.selector-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.mode-selectors {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selector-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.mode-select {
  padding: 10px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.mode-select:hover:not(:disabled) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.mode-select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.mode-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 紧凑模式样式 */
.learning-mode-selector.compact {
  padding: 0;
  background: transparent;
  border-radius: 0;
  margin-bottom: 0;
}

.compact-selectors {
  display: flex;
  gap: 8px;
  height: 36px;
}

.compact-select {
  padding: 6px 28px 6px 10px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 13px;
  min-width: auto;
  height: 36px;
  background-position: right 8px center;
}

.compact-select:hover:not(:disabled) {
  border-color: #409eff;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.2);
}

/* 响应式 */
@media (max-width: 767px) {
  .mode-selectors {
    flex-direction: column;
    gap: 12px;
  }
  
  .mode-select {
    width: 100%;
    min-width: auto;
  }
  
  .compact-selectors {
    flex-direction: row;
    gap: 6px;
  }
  
  .compact-select {
    flex: 1;
    font-size: 12px;
    padding: 6px 24px 6px 8px;
  }
}
</style>
