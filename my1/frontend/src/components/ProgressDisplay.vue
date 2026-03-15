<template>
  <div :class="['progress-display', { 'compact': compact }]">
    <div v-if="!compact" class="progress-header">
      <h4 class="progress-title">学习进度</h4>
      <div class="mode-indicator">
        <span class="mode-label">当前模式:</span>
        <span class="mode-name">{{ modeDisplayName }}</span>
      </div>
    </div>

    <div :class="['progress-content', { 'compact-content': compact }]">
      <!-- 紧凑模式的单行显示 -->
      <div v-if="compact" class="compact-stats">
        <div class="compact-stat">
          <span class="compact-label">{{ progress.learnedCount }}/{{ progress.totalWords }} 单词</span>
        </div>
        <div class="compact-stat">
          <span class="compact-label">{{ progressPercentage }}%</span>
        </div>
        <div class="compact-stat">
          <span class="compact-label">当前位置</span>
          <span class="compact-value">{{ currentPosition }}</span>
        </div>
        <div class="compact-stat">
          <span class="compact-label">总单词数</span>
          <span class="compact-value">{{ progress.totalWords }}</span>
        </div>
        <div v-if="sessionDuration > 0" class="compact-stat">
          <span class="compact-label">学习时长</span>
          <span class="compact-value">{{ formattedDuration }}</span>
        </div>
        <div v-if="showPerformance" class="compact-stat">
          <span class="compact-label">学习速度</span>
          <span class="compact-value">{{ wordsPerMinute }} 词/分钟</span>
        </div>
        <div v-if="showPerformance" class="compact-stat">
          <span class="compact-label">预计完成</span>
          <span class="compact-value">{{ estimatedCompletion }}</span>
        </div>
      </div>

      <!-- 原有的完整显示 -->
      <template v-else>
        <!-- 进度条 -->
        <div class="progress-bar-section">
          <div class="progress-info">
            <span class="progress-text">
              {{ progress.learnedCount }} / {{ progress.totalWords }} 单词
            </span>
            <span class="progress-percentage">{{ progressPercentage }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- 详细统计 -->
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">当前位置</div>
            <div class="stat-value">{{ currentPosition }}</div>
          </div>
          
          <div class="stat-item">
            <div class="stat-label">总单词数</div>
            <div class="stat-value">{{ progress.totalWords }}</div>
          </div>
          
          <div class="stat-item" v-if="showLoopCount">
            <div class="stat-label">循环次数</div>
            <div class="stat-value">{{ progress.loopCount }}</div>
          </div>
          
          <div class="stat-item" v-if="sessionDuration > 0">
            <div class="stat-label">学习时长</div>
            <div class="stat-value">{{ formattedDuration }}</div>
          </div>
        </div>

        <!-- 学习速度 -->
        <div class="performance-section" v-if="showPerformance">
          <div class="performance-item">
            <span class="performance-label">学习速度:</span>
            <span class="performance-value">{{ wordsPerMinute }} 词/分钟</span>
          </div>
          <div class="performance-item">
            <span class="performance-label">预计完成:</span>
            <span class="performance-value">{{ estimatedCompletion }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { LearningMode } from '../stores/learning.js'

export default {
  name: 'ProgressDisplay',
  
  props: {
    mode: {
      type: String,
      required: true,
      validator: (value) => Object.values(LearningMode).includes(value)
    },
    progress: {
      type: Object,
      required: true,
      validator: (value) => {
        return typeof value === 'object' &&
               typeof value.currentIndex === 'number' &&
               typeof value.totalWords === 'number' &&
               typeof value.learnedCount === 'number' &&
               typeof value.loopCount === 'number'
      }
    },
    sessionDuration: {
      type: Number,
      default: 0
    },
    showPerformance: {
      type: Boolean,
      default: true
    },
    compact: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    modeDisplayName() {
      const modeNames = {
        [LearningMode.SEQUENTIAL]: '顺序学习',
        [LearningMode.RANDOM]: '随机学习',
        [LearningMode.LOOP]: '循环学习',
        [LearningMode.RANDOM_LOOP]: '随机循环'
      }
      return modeNames[this.mode] || '未知模式'
    },

    progressPercentage() {
      if (this.progress.totalWords === 0) return 0
      return Math.round((this.progress.learnedCount / this.progress.totalWords) * 100)
    },

    currentPosition() {
      if (this.mode === LearningMode.RANDOM) {
        return `${this.progress.learnedCount}/${this.progress.totalWords}`
      }
      return `${this.progress.currentIndex + 1}/${this.progress.totalWords}`
    },

    showLoopCount() {
      return this.mode === LearningMode.LOOP || this.mode === LearningMode.RANDOM_LOOP
    },

    formattedDuration() {
      const minutes = Math.floor(this.sessionDuration / 60000)
      const seconds = Math.floor((this.sessionDuration % 60000) / 1000)
      
      if (minutes > 0) {
        return `${minutes}分${seconds}秒`
      }
      return `${seconds}秒`
    },

    wordsPerMinute() {
      if (this.sessionDuration === 0 || this.progress.learnedCount === 0) {
        return '0.0'
      }
      const minutes = this.sessionDuration / 60000
      return (this.progress.learnedCount / minutes).toFixed(1)
    },

    estimatedCompletion() {
      if (this.progress.learnedCount === 0 || this.sessionDuration === 0) {
        return '--'
      }
      
      const remainingWords = this.progress.totalWords - this.progress.learnedCount
      if (remainingWords <= 0) {
        return '已完成'
      }
      
      const avgTimePerWord = this.sessionDuration / this.progress.learnedCount
      const estimatedTime = remainingWords * avgTimePerWord
      
      const minutes = Math.ceil(estimatedTime / 60000)
      if (minutes < 60) {
        return `约${minutes}分钟`
      }
      
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `约${hours}小时${remainingMinutes}分钟`
    }
  },

  methods: {
    getProgressColor() {
      const percentage = this.progressPercentage
      if (percentage < 30) return '#f56c6c'
      if (percentage < 70) return '#e6a23c'
      return '#67c23a'
    }
  }
}
</script>

<style scoped>
.progress-display {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.progress-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.mode-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-label {
  font-size: 14px;
  color: #909399;
}

.mode-name {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
  background: #ecf5ff;
  padding: 4px 8px;
  border-radius: 4px;
}

.progress-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-bar-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  color: #606266;
}

.progress-percentage {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.progress-bar {
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.performance-section {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border-left: 4px solid #409eff;
}

.performance-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.performance-label {
  font-size: 12px;
  color: #606266;
}

.performance-value {
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
}

/* 紧凑模式样式 */
.progress-display.compact {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  margin-bottom: 0;
}

.compact-content {
  height: 44px;
  display: flex;
  align-items: center;
}

.compact-stats {
  display: flex;
  gap: 8px;
  align-items: center;
  height: 100%;
  overflow-x: auto;
  white-space: nowrap;
}

.compact-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: fit-content;
  padding: 0 6px;
}

.compact-label {
  font-size: 11px;
  color: #909399;
  line-height: 1.2;
  margin-bottom: 2px;
}

.compact-value {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  line-height: 1.2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-display {
    padding: 16px;
  }
  
  .progress-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .performance-section {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-item {
    padding: 8px;
  }
  
  .stat-value {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 动画效果 */
@keyframes progressUpdate {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}

.progress-fill {
  transform-origin: left;
  animation: progressUpdate 0.5s ease-out;
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .progress-display {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .progress-title {
    color: #e2e8f0;
  }
  
  .progress-bar {
    background: #4a5568;
  }
  
  .stat-item {
    background: #4a5568;
  }
  
  .stat-value {
    color: #e2e8f0;
  }
  
  .performance-section {
    background: #2a4365;
  }
}

/* 无障碍支持 */
.progress-display:focus-within {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .progress-bar {
    border: 1px solid #000;
  }
  
  .progress-fill {
    background: #000;
  }
  
  .stat-item {
    border: 1px solid #666;
  }
}
</style>