import request from './request';

/**
 * 单词掌握状态API服务
 */
class WordMasteryService {
  /**
   * 标记单词为已掌握
   * @param {number} lessonId - 课程ID
   * @param {number} wordId - 单词ID
   * @returns {Promise<Object>} API响应
   */
  async markAsMastered(lessonId, wordId) {
    return request.post('/word-mastery', {
      lessonId,
      wordId
    });
  }

  /**
   * 取消单词掌握状态
   * @param {number} wordId - 单词ID
   * @returns {Promise<Object>} API响应
   */
  async unmarkAsMastered(wordId) {
    return request.delete(`/word-mastery/${wordId}`);
  }

  /**
   * 获取用户在指定课程的所有掌握单词
   * @param {number} lessonId - 课程ID
   * @returns {Promise<Array>} 掌握的单词ID数组
   */
  async getLessonMastery(lessonId) {
    const response = await request.get(`/word-mastery/lesson/${lessonId}`);
    return response.data?.masteredWordIds || [];
  }

  /**
   * 获取用户的掌握统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getUserMasteryStats() {
    const response = await request.get('/word-mastery/stats');
    return response.data?.stats || [];
  }

  /**
   * 获取课程的整体掌握率
   * @param {number} lessonId - 课程ID
   * @returns {Promise<Object>} 掌握率信息
   */
  async getLessonMasteryRate(lessonId) {
    return request.get(`/word-mastery/lesson/${lessonId}/rate`);
  }

  /**
   * 批量同步掌握状态（离线数据同步）
   * @param {Array} masteryData - 掌握数据数组
   * @returns {Promise<Object>} 同步结果
   */
  async syncMastery(masteryData) {
    return request.post('/word-mastery/sync', {
      masteryData
    });
  }
}

export default new WordMasteryService();
