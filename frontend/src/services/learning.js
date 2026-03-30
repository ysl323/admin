/**
 * 学习服务
 */

import api from './api';

export default {
  /**
   * 获取所有分类
   */
  async getCategories() {
    return await api.get('/learning/categories');
  },

  /**
   * 获取分类的课程列表
   */
  async getLessonsByCategory(categoryId) {
    return await api.get(`/learning/categories/${categoryId}/lessons`);
  },

  /**
   * 获取课程的单词列表
   */
  async getWordsByLesson(lessonId) {
    return await api.get(`/learning/lessons/${lessonId}/words`);
  },

  /**
   * 检查答案
   */
  async checkAnswer(wordId, answer) {
    return await api.post('/learning/check-answer', { wordId, answer });
  }
};
