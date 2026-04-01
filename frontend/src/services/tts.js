/**
 * TTS 服务
 * 包含前端内存缓存，避免重复创建 blob URL
 */

import api from './api';

// 前端内存缓存：text -> audioUrl
const audioCache = new Map();

// 缓存大小限制
const MAX_CACHE_SIZE = 100;

export default {
  /**
   * 合成语音（使用火山引擎TTS）
   * 优先使用缓存，缓存未命中时调用后端
   */
  async speak(text) {
    try {
      // 1. 检查内存缓存
      if (audioCache.has(text)) {
        console.log(`[TTS缓存命中] ${text}`);
        return {
          success: true,
          audioUrl: audioCache.get(text),
          fromCache: true
        };
      }

      // 2. 调用后端（后端会检查服务器缓存）
      console.log(`[TTS请求] ${text}`);
      const response = await api.post('/tts/speak', { text }, {
        responseType: 'blob' // 接收二进制数据
      });
      
      // 3. 创建音频URL
      const audioBlob = new Blob([response], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // 4. 保存到内存缓存
      audioCache.set(text, audioUrl);
      
      // 5. 限制缓存大小（LRU策略）
      if (audioCache.size > MAX_CACHE_SIZE) {
        const firstKey = audioCache.keys().next().value;
        const oldUrl = audioCache.get(firstKey);
        URL.revokeObjectURL(oldUrl); // 释放内存
        audioCache.delete(firstKey);
        console.log(`[TTS缓存清理] 移除: ${firstKey}`);
      }
      
      return {
        success: true,
        audioUrl,
        fromCache: false
      };
    } catch (error) {
      console.error('TTS合成失败:', error);
      return {
        success: false,
        message: error.message || 'TTS合成失败'
      };
    }
  },

  /**
   * 合成语音（旧接口，保留兼容性）
   */
  async synthesize(text) {
    return await api.post('/tts/synthesize', { text });
  },

  /**
   * 获取音频文件 URL
   */
  getAudioUrl(filename) {
    return `/api/tts/audio/${filename}`;
  },

  /**
   * 清除所有缓存
   */
  clearCache() {
    for (const url of audioCache.values()) {
      URL.revokeObjectURL(url);
    }
    audioCache.clear();
    console.log('[TTS缓存] 已清空');
  },

  /**
   * 获取缓存状态
   */
  getCacheStatus() {
    return {
      size: audioCache.size,
      maxSize: MAX_CACHE_SIZE,
      keys: Array.from(audioCache.keys())
    };
  }
};
