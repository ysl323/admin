<template>
  <div :class="['learning-mode-selector', { 'compact': compact }]">
    <h3 v-if="!compact" class="selector-title">选择学习模式</h3>
    <div :class="['mode-buttons', { 'compact-buttons': compact }]">
      <button
        v-for="mode in availableModes"
        :key="mode.value"
        :data-mode="mode.value"
        :aria-label="mode.name + ': ' + mode.description"
        :aria-pressed="currentMode === mode.value"
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
      default: LearningMode.BEGINNER,
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
          value: LearningMode.BEGINNER,
          name: '小白模式',
          description: '初学者模式，显示英文辅助学习',
          icon: 'el-icon-data-analysis'
        },
        {
          value: LearningMode.ADVANCED,
          name: '进阶模式',
          description: '隐藏英文的顺序学习，适合听写练习',
          icon: 'el-icon-s-custom'
        },
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
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
}

/* 6个按钮时，优先3列布局 */
@media (min-width: 900px) {
  .mode-buttons {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) and (max-width: 899px) {
  .mode-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 767px) {
  .mode-buttons {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .mode-button {
    padding: 10px 8px;
  }

  .mode-icon {
    font-size: 18px;
    margin-right: 6px;
    min-width: 24px;
  }

  .mode-name {
    font-size: 13px;
  }

  .mode-description {
    font-size: 11px;
  }

  /* 紧凑模式下的移动端优化 */
  .compact-buttons {
    gap: 2px;
    height: 36px;
  }

  .mode-button.compact-button {
    padding: 3px 6px;
    min-height: 36px;
  }

  .mode-button.compact-button .mode-name {
    font-size: 11px;
  }
}

.mode-button {
  display: flex;
  align-items: center;
  padding: 10px 8px;
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

/* 小白模式和进阶模式的hover状态保持原有边框色 */
.mode-button[data-mode="beginner"]:hover:not(.disabled) {
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.2);
}

.mode-button[data-mode="advanced"]:hover:not(.disabled) {
  border-color: #e6a23c;
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.2);
}

.mode-button.active[data-mode="beginner"]:hover {
  border-color: #67c23a;
}

.mode-button.active[data-mode="advanced"]:hover {
  border-color: #e6a23c;
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
  margin-right: 6px;
  font-size: 18px;
  color: #409eff;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 小白模式和进阶模式的特殊图标样式 */
.mode-button[data-mode="beginner"] .mode-icon {
  color: #67c23a;
}

.mode-button[data-mode="advanced"] .mode-icon {
  color: #e6a23c;
}

.mode-button.active[data-mode="beginner"] .mode-icon {
  color: #67c23a;
}

.mode-button.active[data-mode="advanced"] .mode-icon {
  color: #e6a23c;
}

.mode-button.active:not([data-mode="beginner"]):not([data-mode="advanced"]) .mode-name {
  color: #409eff;
}

/* 小白模式和进阶模式的激活文字颜色 */
.mode-button.active[data-mode="beginner"] .mode-name {
  color: #67c23a;
}

.mode-button.active[data-mode="advanced"] .mode-name {
  color: #e6a23c;
}

.mode-button.active[data-mode="beginner"] {
  border-color: #67c23a;
  background: #e8f5e9; /* 绿色系背景 */
}

.mode-button.active[data-mode="advanced"] {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.mode-info {
  flex: 1;
}

.mode-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 3px;
}

.mode-description {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
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
  gap: 3px;
  height: 40px;
}

.mode-button.compact-button {
  padding: 4px 8px;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background: white;
  min-height: 40px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-button.compact-button .mode-name {
  font-size: 12px;
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

/* 紧凑模式下小白和进阶模式的特殊样式 */
.mode-button.compact-button[data-mode="beginner"] {
  border-color: #b3e19d;
}

.mode-button.compact-button[data-mode="advanced"] {
  border-color: #f5dab1;
}

.mode-button.compact-button.active[data-mode="beginner"] {
  border-color: #67c23a;
  background: #e8f5e9;
}

.mode-button.compact-button.active[data-mode="advanced"] {
  border-color: #e6a23c;
  background: #fdf6ec;
}

.mode-button.compact-button.active[data-mode="beginner"] .mode-name {
  color: #67c23a;
}

.mode-button.compact-button.active[data-mode="advanced"] .mode-name {
  color: #e6a23c;
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