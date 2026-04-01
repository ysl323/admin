<template>
  <div class="navbar">
    <div class="navbar-content">
      <div class="navbar-left">
        <h1 class="title" @click="goHome">编程英语单词学习系统</h1>
      </div>
      
      <div class="navbar-right">
        <!-- 设置按钮 -->
        <el-button 
          link 
          class="settings-btn"
          @click="openSettings"
          title="设置"
        >
          <el-icon><Setting /></el-icon>
        </el-button>
        
        <el-button 
          v-if="isAdmin" 
          type="primary" 
          size="small" 
          class="admin-btn"
          @click="goToAdmin"
        >
          <el-icon><Setting /></el-icon>
          <span class="btn-text">进入后台</span>
        </el-button>
        
        <span class="username">{{ username }}</span>
        
        <el-dropdown @command="handleCommand" trigger="click">
          <el-button link class="user-button">
            <el-icon><User /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="home">
                <el-icon><HomeFilled /></el-icon>
                首页
              </el-dropdown-item>
              <el-dropdown-item command="admin" v-if="isAdmin">
                <el-icon><Setting /></el-icon>
                管理后台
              </el-dropdown-item>
              <el-dropdown-item command="logout" divided>
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, HomeFilled, Setting, SwitchButton } from '@element-plus/icons-vue';
import authService from '../services/auth';
import { openSettings } from '../utils/eventBus';

const router = useRouter();
const username = ref('');
const isAdmin = ref(false);

onMounted(async () => {
  try {
    const response = await authService.checkAuth();
    if (response.authenticated && response.user) {
      username.value = response.user.username;
      isAdmin.value = response.user.isAdmin;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
});

const goHome = () => {
  router.push('/categories');
};

const goToAdmin = () => {
  router.push('/admin/users');
};

const handleCommand = async (command) => {
  switch (command) {
    case 'home':
      router.push('/categories');
      break;
    case 'admin':
      router.push('/admin/users');
      break;
    case 'logout':
      await handleLogout();
      break;
  }
};

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    // 调用退出登录 API
    await authService.logout();
    
    ElMessage.success('已退出登录');
    
    // 跳转到登录页
    router.push('/login');
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消
      return;
    }
    console.error('退出登录失败:', error);
  }
};
</script>

<style scoped>
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 20px;
  color: #409eff;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.title:hover {
  opacity: 0.8;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-shrink: 0;
}

.username {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-button {
  font-size: 20px;
  padding: 8px;
}

.settings-btn {
  font-size: 20px;
  padding: 8px;
  color: #606266;
}

.settings-btn:hover {
  color: #409eff;
}

.admin-btn .btn-text {
  display: inline;
}

/* ==================== 移动端优化 ==================== */

@media (max-width: 768px) {
  .navbar-content {
    padding: 0 12px;
    height: 50px;
  }

  .title {
    font-size: 14px;
    max-width: 180px;
  }

  .navbar-right {
    gap: 8px;
  }

  .username {
    display: none;
  }

  .user-button {
    padding: 4px;
    font-size: 18px;
  }

  .settings-btn {
    padding: 4px;
    font-size: 18px;
  }

  .admin-btn {
    padding: 5px 10px;
    font-size: 12px;
  }

  .admin-btn .btn-text {
    display: none;
  }

  .admin-btn :deep(.el-icon) {
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 13px;
    max-width: 150px;
  }

  .navbar-right {
    gap: 6px;
  }
}

/* ==================== 触摸优化 ==================== */

@media (max-width: 768px) {
  .title:active {
    opacity: 0.6;
    transition: opacity 0.1s;
  }

  .user-button:active {
    transform: scale(0.9);
    transition: transform 0.1s;
  }

  .admin-btn:active {
    transform: scale(0.95);
    transition: transform 0.1s;
  }
}
</style>
