<template>
  <div class="admin-layout">
    <NavBar />
    
    <div class="admin-container">
      <el-container>
        <el-aside width="200px">
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
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { User, Document, Setting, HomeFilled, FolderOpened } from '@element-plus/icons-vue';
import NavBar from '../components/NavBar.vue';

const route = useRoute();
const router = useRouter();
const activeMenu = computed(() => route.path);

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

.admin-menu {
  height: 100%;
  border-right: none;
}

.menu-header {
  padding: 15px;
}

.el-aside {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.el-main {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: 20px;
}
</style>
