<template>
  <div class="categories-page">
    <NavBar />
    
    <div class="content">
      <!-- 访问权限提示 -->
      <el-alert
        v-if="accessInfo && accessInfo.accessDays <= 3"
        :title="getAccessMessage()"
        :type="accessInfo.accessDays > 0 ? 'warning' : 'error'"
        :closable="false"
        style="margin-bottom: 20px"
      />

      <!-- 页面标题 -->
      <div class="page-header">
        <h1>学习分类</h1>
        <p>选择一个分类开始学习</p>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 分类列表 -->
      <div v-else-if="categories.length > 0" class="categories-grid">
        <el-card
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          shadow="hover"
          @click="goToLessons(category.id)"
        >
          <div class="category-content">
            <div class="category-icon">
              <el-icon :size="48"><Reading /></el-icon>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-info">{{ category.lessonCount || 0 }} 个课程</p>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-else
        description="暂无学习分类"
        :image-size="200"
      >
        <el-button type="primary" @click="refreshCategories">刷新</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Reading } from '@element-plus/icons-vue';
import NavBar from '../components/NavBar.vue';
import learningService from '../services/learning';
import authService from '../services/auth';

const router = useRouter();
const loading = ref(true);
const categories = ref([]);
const accessInfo = ref(null);

onMounted(async () => {
  await loadAccessInfo();
  await loadCategories();
});

const loadAccessInfo = async () => {
  try {
    const response = await authService.checkAuth();
    if (response.success && response.user) {
      accessInfo.value = {
        accessDays: response.user.accessDays || 0
      };
    }
  } catch (error) {
    console.error('获取访问权限信息失败:', error);
  }
};

const loadCategories = async () => {
  loading.value = true;
  try {
    const response = await learningService.getCategories();
    if (response.success) {
      categories.value = response.categories || [];
    } else {
      ElMessage.error(response.message || '获取分类列表失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '获取分类列表失败');
  } finally {
    loading.value = false;
  }
};

const refreshCategories = () => {
  loadCategories();
};

const goToLessons = (categoryId) => {
  if (accessInfo.value && accessInfo.value.accessDays <= 0) {
    ElMessage.warning('访问权限已到期，请联系管理员');
    return;
  }
  router.push(`/categories/${categoryId}/lessons`);
};

const getAccessMessage = () => {
  if (!accessInfo.value) return '';
  
  const days = accessInfo.value.accessDays;
  if (days <= 0) {
    return '您的访问权限已到期，请联系管理员续期';
  } else if (days <= 3) {
    return `您的访问权限还剩 ${days} 天，即将到期`;
  }
  return '';
};
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.category-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-content {
  text-align: center;
  padding: 20px;
}

.category-icon {
  color: #409eff;
  margin-bottom: 15px;
}

.category-name {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.category-info {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

/* ==================== 移动端优化 ==================== */

@media (max-width: 768px) {
  .content {
    padding: 12px;
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

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .category-card {
    padding: 12px;
  }

  .category-content {
    padding: 15px;
  }

  .category-icon {
    margin-bottom: 10px;
  }

  .category-icon :deep(.el-icon) {
    font-size: 36px;
  }

  .category-name {
    font-size: 16px;
  }

  .category-info {
    font-size: 12px;
  }

  /* 访问权限提示优化 */
  .el-alert {
    font-size: 13px;
    padding: 8px 12px;
    margin-bottom: 16px;
  }

  .el-alert :deep(.el-alert__title) {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .category-content {
    padding: 12px;
  }
}

/* ==================== 触摸优化 ==================== */

@media (max-width: 768px) {
  .category-card:hover {
    transform: none;
  }

  .category-card:active {
    transform: scale(0.98);
    transition: transform 0.1s;
  }
}
</style>
