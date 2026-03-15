/**
 * TTS 服务
 */

import api from './api';

export default {
  /**
   * 合成语音（使用火山引擎TTS）
   */
  async speak(text) {
    try {
      const response = await api.post('/tts/speak', { text }, {
        responseType: 'blob' // 接收二进制数据
      });
      
      // 创建音频URL
      const audioBlob = new Blob([response], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return {
        success: true,
        audioUrl
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
  }
};
