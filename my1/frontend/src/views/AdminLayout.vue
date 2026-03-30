<template>
  <div class="admin-layout">
    <NavBar />
    
    <div class="admin-container">
      <!-- 移动端顶部菜单栏 -->
      <div class="mobile-header">
        <el-button type="primary" @click="drawerVisible = true">
          <el-icon><Menu /></el-icon>
          菜单
        </el-button>
        <span class="current-page">{{ currentPageTitle }}</span>
      </div>

      <el-container>
        <!-- PC端侧边栏 -->
        <el-aside width="200px" class="pc-aside">
          <el-menu
            :default-active="activeMenu"
            router
            class="admin-menu"
          >
            <div class="menu-header">
              <el-button type="primary" size="small" @click="goHome" style="width: 100%; margin-bottom: 10px;">
                <el-icon><HomeFilled /></el-icon>
                返回主页
              </el-button>
            </div>
            
            <el-menu-item index="/admin/users">
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/content">
              <el-icon><Document /></el-icon>
              <span>内容管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/config">
              <el-icon><Setting /></el-icon>
              <span>配置管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/cache">
              <el-icon><FolderOpened /></el-icon>
              <span>缓存管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </div>

    <!-- 移动端抽屉菜单 -->
    <el-drawer
      v-model="drawerVisible"
      direction="ltr"
      size="70%"
      title="管理菜单"
    >
      <el-menu
        :default-active="activeMenu"
        router
        class="mobile-menu"
        @select="drawerVisible = false"
      >
        <el-menu-item index="/categories">
          <el-icon><HomeFilled /></el-icon>
          <span>返回主页</span>
        </el-menu-item>
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/content">
          <el-icon><Document /></el-icon>
          <span>内容管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/config">
          <el-icon><Setting /></el-icon>
          <span>配置管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/cache">
          <el-icon><FolderOpened /></el-icon>
          <span>缓存管理</span>
        </el-menu-item>
      </el-menu>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { User, Document, Setting, HomeFilled, FolderOpened, Menu } from '@element-plus/icons-vue';
import NavBar from '../components/NavBar.vue';

const route = useRoute();
const router = useRouter();
const drawerVisible = ref(false);

const activeMenu = computed(() => route.path);

const currentPageTitle = computed(() => {
  const titles = {
    '/admin/users': '用户管理',
    '/admin/content': '内容管理',
    '/admin/config': '配置管理',
    '/admin/cache': '缓存管理'
  };
  return titles[route.path] || '管理后台';
});

const goHome = () => {
  router.push('/categories');
};
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-container {
  max-width: 1400px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 移动端顶部菜单栏 - 默认隐藏 */
.mobile-header {
  display: none;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.current-page {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

/* PC端侧边栏 - 默认显示 */
.pc-aside {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.admin-menu {
  height: 100%;
  border-right: none;
}

.menu-header {
  padding: 15px;
}

.el-main {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: 20px;
  padding: 15px;
}

.mobile-menu {
  border-right: none;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .admin-container {
    margin: 10px auto;
    padding: 0 10px;
  }

  /* 显示移动端顶部菜单栏 */
  .mobile-header {
    display: flex;
  }

  /* 隐藏PC端侧边栏 */
  .pc-aside {
    display: none;
  }

  .el-main {
    margin-left: 0;
    padding: 10px;
  }

  .el-container {
    display: block;
  }
}
</style>
