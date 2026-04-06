import api from './api';

/**
 * 音频缓存管理服务
 */
const audioCacheService = {
  /**
   * 获取缓存列表
   */
  async getCacheList(params = {}) {
    return await api.get('/audio-cache/list', { params });
  },

  /**
   * 获取统计信息
   */
  async getStatistics() {
    return await api.get('/audio-cache/statistics');
  },

  /**
   * 删除单个缓存
   */
  async deleteCache(id) {
    return await api.delete(`/audio-cache/${id}`);
  },

  /**
   * 批量删除缓存
   */
  async batchDeleteCaches(ids) {
    return await api.post('/audio-cache/batch-delete', { ids });
  },

  /**
   * 清空所有缓存
   */
  async clearAllCaches() {
    return await api.post('/audio-cache/clear-all');
  },

  /**
   * 获取音频 URL（用于播放）
   */
  getAudioUrl(id) {
    return `/api/audio-cache/audio/${id}`;
  },

  /**
   * 导出所有音频文件（ZIP格式）
   */
  async exportAudioFiles() {
    const response = await fetch('/api/audio-cache/export-files', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('导出音频文件失败');
    }

    return await response.blob();
  },

  /**
   * 导入音频文件（ZIP格式）
   */
  async importAudioFiles(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/audio-cache/import-files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '导入音频文件失败');
    }

    return await response.json();
  }
};

export default audioCacheService;
