/**
 * 管理员服务
 */

import api from './api';

export default {
  // ========== 用户管理 ==========
  
  /**
   * 获取所有用户
   */
  async getUsers() {
    return await api.get('/admin/users');
  },

  /**
   * 修改用户名
   */
  async updateUsername(userId, newUsername) {
    return await api.put(`/admin/users/${userId}/update-username`, { newUsername });
  },

  /**
   * 重置用户密码
   */
  async resetPassword(userId, newPassword) {
    return await api.put(`/admin/users/${userId}/reset-password`, { newPassword });
  },

  /**
   * 增加用户访问天数
   */
  async addAccessDays(userId, days) {
    return await api.put(`/admin/users/${userId}/add-days`, { days });
  },

  /**
   * 切换用户状态
   */
  async toggleUserStatus(userId) {
    return await api.put(`/admin/users/${userId}/toggle-status`);
  },

  /**
   * 创建新用户
   */
  async createUser(userData) {
    return await api.post('/admin/users', userData);
  },

  /**
   * 更新用户权限
   */
  async updatePermissions(userId, permissions) {
    return await api.put(`/admin/users/${userId}/permissions`, permissions);
  },

  // ========== 内容管理 ==========
  
  /**
   * 获取所有分类
   */
  async getCategories() {
    return await api.get('/admin/categories');
  },

  /**
   * 创建分类
   */
  async createCategory(name) {
    return await api.post('/admin/categories', { name });
  },

  /**
   * 更新分类
   */
  async updateCategory(id, name) {
    return await api.put(`/admin/categories/${id}`, { name });
  },

  /**
   * 删除分类
   */
  async deleteCategory(id) {
    return await api.delete(`/admin/categories/${id}`);
  },

  /**
   * 获取所有课程
   */
  async getLessons() {
    return await api.get('/admin/lessons');
  },

  /**
   * 创建课程
   */
  async createLesson(categoryId, lessonNumber) {
    return await api.post('/admin/lessons', { categoryId, lessonNumber });
  },

  /**
   * 更新课程
   */
  async updateLesson(id, lessonNumber) {
    return await api.put(`/admin/lessons/${id}`, { lessonNumber });
  },

  /**
   * 删除课程
   */
  async deleteLesson(id) {
    return await api.delete(`/admin/lessons/${id}`);
  },

  /**
   * 获取所有单词
   */
  async getWords() {
    return await api.get('/admin/words');
  },

  /**
   * 创建单词
   */
  async createWord(data) {
    return await api.post('/admin/words', data);
  },

  /**
   * 更新单词
   */
  async updateWord(id, data) {
    return await api.put(`/admin/words/${id}`, data);
  },

  /**
   * 删除单词
   */
  async deleteWord(id) {
    return await api.delete(`/admin/words/${id}`);
  },

  /**
   * JSON 批量导入
   */
  async importJSON(data) {
    return await api.post('/admin/import-json-direct', data);
  },

  /**
   * 文件上传导入
   */
  async importJSONFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    return await api.post('/admin/import-json', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * 简化课程导入（新概念英语格式）
   */
  async importSimpleLesson(data, categoryName) {
    return await api.post('/admin/import-simple-lesson', {
      data,
      categoryName
    });
  },

  // ========== TTS 配置 ==========
  
  /**
   * 获取 TTS 配置
   */
  async getTTSConfig() {
    return await api.get('/admin/config/tts');
  },

  /**
   * 保存 TTS 配置
   */
  async saveTTSConfig(config) {
    return await api.put('/admin/config/tts', config);
  },

  /**
   * 测试 TTS 配置
   */
  async testTTSConfig() {
    return await api.post('/admin/config/tts/test');
  },

  /**
   * 测试指定提供商的 TTS 配置
   */
  async testTTSProvider(provider, text) {
    return await api.post('/admin/test-tts', { provider, text });
  },

  // ========== 导出功能 ==========

  /**
   * 导出所有课程数据
   */
  async exportAllData() {
    return await api.get('/admin/export/all');
  },

  /**
   * 导出指定分类的数据
   */
  async exportCategoryData(categoryId) {
    return await api.get(`/admin/export/category/${categoryId}`);
  },

  /**
   * 导出指定课程的数据
   */
  async exportLessonData(lessonId) {
    return await api.get(`/admin/export/lesson/${lessonId}`);
  },

  /**
   * 导出指定课程为TXT文件
   */
  async exportLessonTxt(lessonId) {
    const response = await fetch(`/api/admin/export/lesson/${lessonId}/txt`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('导出失败');
    }
    return await response.blob();
  }
};
