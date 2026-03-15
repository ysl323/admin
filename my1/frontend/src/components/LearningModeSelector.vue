<template>
  <div :class="['learning-mode-selector', { 'compact': compact }]">
    <h3 v-if="!compact" class="selector-title">选择学习模式</h3>
    <div :class="['mode-buttons', { 'compact-buttons': compact }]">
      <button
        v-for="mode in availableModes"
        :key="mode.value"
        :class="[
          'mode-button',
          { 'active': currentMode === mode.value },
          { 'disabled': disabled },
          { 'compact-button': compact }
        ]"
        :disabled="disabled"
        @click="handleModeChange(mode.value)"
      >
        <div v-if="!compact" class="mode-icon">
          <i :class="mode.icon"></i>
        </div>
        <div class="mode-info">
          <div class="mode-name">{{ mode.name }}</div>
          <div v-if="!compact" class="mode-description">{{ mode.description }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script>
import { LearningMode } from '../stores/learning.js'

export default {
  name: 'LearningModeSelector',
  
  props: {
    currentMode: {
      type: String,
      default: LearningMode.SEQUENTIAL,
      validator: (value) => Object.values(LearningMode).includes(value)
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

  emits: ['mode-change'],

  data() {
    return {
      availableModes: [
        {
          value: LearningMode.SEQUENTIAL,
          name: '顺序学习',
          description: '按顺序逐个学习单词',
          icon: 'el-icon-sort'
        },
        {
          value: LearningMode.RANDOM,
          name: '随机学习',
          description: '随机选择单词学习',
          icon: 'el-icon-refresh'
        },
        {
          value: LearningMode.LOOP,
          name: '循环学习',
          description: '循环重复所有单词',
          icon: 'el-icon-refresh-right'
        },
        {
          value: LearningMode.RANDOM_LOOP,
          name: '随机循环',
          description: '随机顺序循环学习',
          icon: 'el-icon-refresh-left'
        }
      ]
    }
  },

  methods: {
    handleModeChange(mode) {
      if (this.disabled || mode === this.currentMode) {
        return
      }
      
      this.$emit('mode-change', mode)
    },

    getModeDisplayName(mode) {
      const modeInfo = this.availableModes.find(m => m.value === mode)
      return modeInfo ? modeInfo.name : '未知模式'
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

.mode-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.mode-button {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.mode-button:hover:not(.disabled) {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-1px);
}

.mode-button.active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.mode-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-icon {
  margin-right: 12px;
  font-size: 24px;
  color: #409eff;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-button.active .mode-icon {
  color: #409eff;
}

.mode-info {
  flex: 1;
}

.mode-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.mode-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.mode-button.active .mode-name {
  color: #409eff;
}

/* 紧凑模式样式 */
.learning-mode-selector.compact {
  padding: 0;
  background: transparent;
  border-radius: 0;
  margin-bottom: 0;
}

.compact-buttons {
  display: flex;
  gap: 4px;
  height: 44px;
}

.mode-button.compact-button {
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background: white;
  min-height: 44px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-button.compact-button .mode-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 0;
  white-space: nowrap;
}

.mode-button.compact-button:hover:not(.disabled) {
  border-color: #409eff;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.2);
  transform: none;
}

.mode-button.compact-button.active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.3);
}

.mode-button.compact-button.active .mode-name {
  color: #409eff;
}
@media (max-width: 768px) {
  .mode-buttons {
    grid-template-columns: 1fr;
  }
  
  .mode-button {
    padding: 12px;
  }
  
  .mode-icon {
    font-size: 20px;
    margin-right: 8px;
    min-width: 24px;
  }
  
  .mode-name {
    font-size: 14px;
  }
  
  .mode-description {
    font-size: 12px;
  }
}

/* 无障碍支持 */
.mode-button:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

.mode-button:focus:not(.active) {
  border-color: #409eff;
}

/* 动画效果 */
@keyframes modeSelect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

.mode-button.active {
  animation: modeSelect 0.2s ease-out;
}
</style>