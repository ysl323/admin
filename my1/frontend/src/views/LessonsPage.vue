<template>
  <div class="lessons-page">
    <NavBar />
    
    <div class="content">
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/categories' }">
          <el-icon><HomeFilled /></el-icon>
          学习分类
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ categoryName }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 页面标题 -->
      <div class="page-header">
        <h1>{{ categoryName }}</h1>
        <p>选择一个课程开始学习</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 课程列表 -->
      <div v-else-if="lessons.length > 0" class="lessons-list">
        <el-card
          v-for="(lesson, index) in lessons"
          :key="lesson.id"
          class="lesson-card"
          shadow="hover"
          @click="goToLearning(lesson.id)"
        >
          <div class="lesson-content">
            <div class="lesson-number">
              <span class="number">{{ lesson.lessonNumber || (index + 1) }}</span>
            </div>
            <div class="lesson-info">
              <h3 class="lesson-title">第 {{ lesson.lessonNumber || (index + 1) }} 课</h3>
              <p class="lesson-meta">
                <el-icon><Document /></el-icon>
                {{ lesson.wordCount || 0 }} 个单词
              </p>
            </div>
            <div class="lesson-action">
              <el-icon :size="24"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else
        description="该分类下暂无课程"
        :image-size="200"
      >
        <el-button type="primary" @click="goBack">返回分类列表</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { HomeFilled, Document, ArrowRight } from '@element-plus/icons-vue';
import NavBar from '../components/NavBar.vue';
import learningService from '../services/learning';

const router = useRouter();
const route = useRoute();
const loading = ref(true);
const lessons = ref([]);
const categoryName = ref('');

const categoryId = computed(() => parseInt(route.params.id));

onMounted(async () => {
  await loadLessons();
});

const loadLessons = async () => {
  loading.value = true;
  try {
    const response = await learningService.getLessonsByCategory(categoryId.value);
    if (response.success) {
      lessons.value = (response.lessons || []).sort((a, b) => a.lessonNumber - b.lessonNumber);
      
      // 获取分类名称
      if (lessons.value.length > 0 && lessons.value[0].category) {
        categoryName.value = lessons.value[0].category.name;
      } else {
        categoryName.value = '未知分类';
      }
    } else {
      ElMessage.error(response.message || '获取课程列表失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '获取课程列表失败');
    
    // 如果是 404 错误，返回分类列表
    if (error.message && error.message.includes('不存在')) {
      setTimeout(() => {
        router.push('/categories');
      }, 2000);
    }
  } finally {
    loading.value = false;
  }
};

const goToLearning = (lessonId) => {
  router.push(`/lessons/${lessonId}/learning`);
};

const goBack = () => {
  router.push('/categories');
};
</script>

<style scoped>
.lessons-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
  color: #303133;
}

.page-header p {
  margin: 0;
  font-size: 16px;
  color: #909399;
}

.loading-container {
  max-width: 800px;
  margin: 0 auto;
}

.lessons-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.lesson-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.lesson-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.lesson-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.lesson-number {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-right: 20px;
}

.lesson-number .number {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.lesson-meta {
  margin: 0;
  font-size: 14px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

.lesson-action {
  flex-shrink: 0;
  color: #909399;
}

/* ==================== 移动端优化 ==================== */

@media (max-width: 768px) {
  .content {
    padding: 12px;
  }

  .breadcrumb {
    font-size: 12px;
    margin-bottom: 12px;
  }

  .page-header {
    margin-bottom: 24px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .page-header p {
    font-size: 14px;
  }

  .lessons-list {
    gap: 10px;
  }

  .lesson-content {
    padding: 12px;
  }

  .lesson-number {
    width: 45px;
    height: 45px;
    margin-right: 12px;
    border-radius: 10px;
  }

  .lesson-number .number {
    font-size: 18px;
  }

  .lesson-title {
    font-size: 16px;
  }

  .lesson-meta {
    font-size: 12px;
  }

  .lesson-action {
    display: none;
  }
}

@media (max-width: 480px) {
  .page-header h1 {
    font-size: 20px;
  }

  .lesson-number {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }

  .lesson-number .number {
    font-size: 16px;
  }

  .lesson-title {
    font-size: 14px;
  }

  .lesson-content {
    padding: 10px;
  }
}

/* ==================== 触摸优化 ==================== */

@media (max-width: 768px) {
  .lesson-card:hover {
    transform: none;
  }

  .lesson-card:active {
    transform: scale(0.99);
    transition: transform 0.1s;
  }
}
</style>
