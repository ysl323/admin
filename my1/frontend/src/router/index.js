/**
 * Vue Router 配置
 */

import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/auth';

const routes = [
  {
    path: '/',
    redirect: '/categories'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/CategoriesPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/:id/lessons',
    name: 'Lessons',
    component: () => import('../views/LessonsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lessons/:id/learning',
    name: 'Learning',
    component: () => import('../views/LearningPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/admin/UserManagement.vue')
      },
      {
        path: 'content',
        name: 'AdminContent',
        component: () => import('../views/admin/ContentManagement.vue')
      },
      {
        path: 'config',
        name: 'AdminConfig',
        component: () => import('../views/admin/ConfigManagement.vue')
      },
      {
        path: 'cache',
        name: 'AdminCache',
        component: () => import('../views/admin/CacheManagement.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 导航守卫
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth) {
    try {
      // 检查认证状态
      const response = await authService.checkAuth();
      
      if (response.authenticated && response.user) {
        // 已登录
        if (requiresAdmin && !response.user.isAdmin) {
          // 需要管理员权限但用户不是管理员
          console.error('需要管理员权限');
          next('/categories');
        } else {
          next();
        }
      } else {
        // 未登录
        next('/login');
      }
    } catch (error) {
      // 认证检查失败，跳转到登录页
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
