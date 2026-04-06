<template>
  <div class="review-lesson-selector" @click.prevent @click.stop @submit.prevent>
    <div class="popover-container">
      <div
        class="reference-wrapper"
        @click.stop="toggleDropdown"
        @submit.prevent
      >
        <el-input
          :model-value="selectedLabel"
          placeholder="复习课程（可选）"
          :disabled="disabled || availableLessons.length === 0"
          readonly
          class="review-input"
          @submit.prevent
        >
          <template #suffix>
            <el-icon v-if="selectedLessonIds.length > 0" class="clear-icon" @click.stop="clearReview">
              <CircleClose />
            </el-icon>
            <el-icon class="arrow-icon" :class="{ 'is-open': dropdownVisible }">
              <ArrowDown />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div v-show="dropdownVisible" class="custom-dropdown" @click.stop @mousedown.stop @mouseup.stop @submit.prevent>
        <div class="select-header">
          <span class="select-count">已选 {{ selectedLessonIds.length }}/{{ availableLessons.length }}</span>
        </div>
        <div class="lesson-list">
          <div
            v-for="lesson in availableLessons"
            :key="lesson.id"
            class="lesson-item"
            :class="{ selected: selectedLessonIds.includes(lesson.id) }"
            @click.stop.prevent="toggleLesson(lesson.id)"
            @mousedown.stop.prevent
            @mouseup.stop.prevent
            @submit.prevent
            role="button"
            aria-label="选择第{{ lesson.lessonNumber }}课"
          >
            <span class="custom-checkbox">
              <span v-if="selectedLessonIds.includes(lesson.id)" class="check-mark">✓</span>
            </span>
            <span class="lesson-label">第{{ lesson.lessonNumber }}课</span>
          </div>
        </div>
        <div class="select-footer">
          <el-button
            size="small"
            @click.stop="selectAll"
            :disabled="selectedLessonIds.length === availableLessons.length"
            @submit.prevent
          >
            全选
          </el-button>
          <el-button
            size="small"
            @click.stop="deselectAll"
            :disabled="selectedLessonIds.length === 0"
            @submit.prevent
          >
            取消全选
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ArrowDown, CircleClose } from '@element-plus/icons-vue';
import { onBeforeUnmount, onMounted } from 'vue';

export default {
  name: 'ReviewLessonSelector',
  components: {
    ArrowDown,
    CircleClose
  },

  props: {
    // 当前课程ID
    currentLessonId: {
      type: Number,
      required: true
    },
    // 分类下的所有课程
    allLessons: {
      type: Array,
      default: () => []
    },
    // 已选择的复习课程ID
    modelValue: {
      type: Array,
      default: () => []
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'change'],

  data() {
    return {
      selectedLessonIds: [...this.modelValue],
      dropdownVisible: false,
      clickOutsideHandler: null
    };
  },

  computed: {
    // 可供选择的复习课程（排除当前课程）
    availableLessons() {
      return this.allLessons.filter(l => l.id !== this.currentLessonId);
    },

    // 显示标签
    selectedLabel() {
      if (this.selectedLessonIds.length === 0) {
        return '';
      }
      if (this.selectedLessonIds.length === 1) {
        const lesson = this.availableLessons.find(l => l.id === this.selectedLessonIds[0]);
        return lesson ? `第${lesson.lessonNumber}课` : '';
      }
      return `已选 ${this.selectedLessonIds.length} 课`;
    }
  },

  watch: {
    modelValue(newVal) {
      this.selectedLessonIds = [...newVal];
    },
    dropdownVisible(newVal) {
      if (newVal) {
        // 添加点击外部关闭事件
        this.$nextTick(() => {
          this.clickOutsideHandler = (e) => {
            const dropdown = this.$el.querySelector('.custom-dropdown');
            const reference = this.$el.querySelector('.reference-wrapper');
            if (dropdown && reference && !dropdown.contains(e.target) && !reference.contains(e.target)) {
              this.dropdownVisible = false;
            }
          };
          document.addEventListener('click', this.clickOutsideHandler);
        });
      } else {
        // 移除事件监听
        if (this.clickOutsideHandler) {
          document.removeEventListener('click', this.clickOutsideHandler);
          this.clickOutsideHandler = null;
        }
      }
    }
  },

  mounted() {
    // 组件卸载时清理事件监听
    this.$options.beforeUnmount = () => {
      if (this.clickOutsideHandler) {
        document.removeEventListener('click', this.clickOutsideHandler);
      }
    };
  },

  methods: {
    handleChange(value) {
      this.$emit('update:modelValue', value);
      this.$emit('change', value);
    },

    // 切换下拉框显示状态
    toggleDropdown() {
      if (this.disabled || this.availableLessons.length === 0) {
        return;
      }
      this.dropdownVisible = !this.dropdownVisible;

      if (this.dropdownVisible) {
        this.$nextTick(() => {
          this.positionDropdown();
        });
      }
    },

    // 定位下拉框
    positionDropdown() {
      const reference = this.$el.querySelector('.reference-wrapper');
      const dropdown = this.$el.querySelector('.custom-dropdown');
      if (reference && dropdown) {
        const rect = reference.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
      }
    },

    // 切换单个课程选择状态
    toggleLesson(lessonId) {
      console.log('[ReviewLessonSelector] Toggle lesson:', lessonId, 'current:', this.selectedLessonIds);
      const index = this.selectedLessonIds.indexOf(lessonId);
      if (index > -1) {
        this.selectedLessonIds.splice(index, 1);
        console.log('[ReviewLessonSelector] Removed lesson:', lessonId, 'new:', this.selectedLessonIds);
      } else {
        this.selectedLessonIds.push(lessonId);
        console.log('[ReviewLessonSelector] Added lesson:', lessonId, 'new:', this.selectedLessonIds);
      }
      this.$emit('update:modelValue', [...this.selectedLessonIds]);
      this.$emit('change', [...this.selectedLessonIds]);
    },

    // 全选所有可选课程
    selectAll() {
      const allIds = this.availableLessons.map(l => l.id);
      this.selectedLessonIds = [...allIds];
      this.$emit('update:modelValue', allIds);
      this.$emit('change', allIds);
    },

    // 取消全选
    deselectAll() {
      this.selectedLessonIds = [];
      this.$emit('update:modelValue', []);
      this.$emit('change', []);
    },

    clearReview() {
      this.selectedLessonIds = [];
      this.$emit('update:modelValue', []);
      this.$emit('change', []);
    }
  }
};
</script>

<style scoped>
.review-lesson-selector {
  width: 100%;
  position: relative;
}

.popover-container {
  position: relative;
}

.reference-wrapper {
  cursor: pointer;
}

.review-input {
  cursor: pointer;
}

.review-input :deep(.el-input__wrapper) {
  padding: 6px 12px;
  box-shadow: 0 0 0 1px #e1e5e9 inset;
}

.review-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.clear-icon {
  margin-right: 4px;
  cursor: pointer;
  color: #909399;
}

.clear-icon:hover {
  color: #409eff;
}

.arrow-icon {
  margin-left: 4px;
  transition: transform 0.3s;
}

.arrow-icon.is-open {
  transform: rotate(180deg);
}

.custom-dropdown {
  position: fixed;
  top: auto;
  left: auto;
  z-index: 9999;
  width: 240px;
  max-height: 400px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.select-header {
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 4px 4px 0 0;
}

.select-count {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.lesson-list {
  flex: 1;
  max-height: 280px;
  overflow-y: auto;
  padding: 8px 0;
}

.lesson-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.lesson-item:hover {
  background: #f5f7fa;
}

.lesson-item.selected {
  background: #ecf5ff;
}

.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  background: #fff;
  margin-right: 8px;
  flex-shrink: 0;
}

.lesson-item.selected .custom-checkbox {
  background: #409eff;
  border-color: #409eff;
}

.check-mark {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

.lesson-label {
  color: #606266;
}

.select-footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  border-radius: 0 0 4px 4px;
}

.select-footer .el-button {
  flex: 1;
}
</style>
