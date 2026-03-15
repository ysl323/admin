import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import AdminService from './AdminService.js';
import AudioCacheService from './AudioCacheService.js';

/**
 * TTS 服务类
 * 提供火山引擎和谷歌 TTS 的实际调用功能
 */
class TTSService {
  /**
   * 测试火山引擎 TTS 配置（支持 Token 和签名认证）
   * @param {string} text - 测试文本
   * @returns {Promise<Object>} 测试结果
   */
  async testVolcengineTTS(text = 'Hello, this is a test.') {
    try {
      const config = await AdminService.getTTSConfig();
      const volcConfig = config.volcengine;

      // 验证配置完整性
      if (!volcConfig.appId || !volcConfig.apiKey) {
        return {
          success: false,
          message: '火山引擎 TTS 配置不完整（需要 AppID 和 Access Token）'
        };
      }

      // 准备请求参数
      const timestamp = Math.floor(Date.now() / 1000);
      const requestBody = {
        app: {
          appid: volcConfig.appId,
          token: volcConfig.apiKey,  // 使用真实的 access token
          cluster: volcConfig.cluster || 'volcano_tts'
        },
        user: {
          uid: 'test_user_' + timestamp
        },
        audio: {
          voice_type: volcConfig.voiceType || 'BV001_streaming',
          encoding: 'mp3',
          speed_ratio: 1.0,
          volume_ratio: 1.0,
          pitch_ratio: 1.0
        },
        request: {
          reqid: `test_${timestamp}_${Math.random().toString(36).substring(7)}`,
          text: text,
          text_type: 'plain',
          operation: 'query'
        }
      };

      logger.info('发送火山引擎 TTS 请求:', {
        appId: volcConfig.appId,
        endpoint: volcConfig.endpoint,
        textLength: text.length,
        hasSecretKey: !!volcConfig.apiSecret
      });

      const headers = {
        'Content-Type': 'application/json'
      };

      // 如果有 Secret Key，使用签名认证
      if (volcConfig.apiSecret) {
        const bodyStr = JSON.stringify(requestBody);
        const signature = this.generateVolcengineSignature(volcConfig.apiSecret, bodyStr);
        headers['Authorization'] = `Bearer;${volcConfig.apiKey}`;
        headers['X-Signature'] = signature;
        logger.info('使用签名认证');
      } else {
        // 否则使用 Token 认证
        headers['Authorization'] = `Bearer;${volcConfig.apiKey}`;
        logger.info('使用 Token 认证');
      }

      // 发送请求
      const response = await axios.post(
        volcConfig.endpoint || 'https://openspeech.bytedance.com/api/v1/tts',
        requestBody,
        {
          headers,
          timeout: 10000
        }
      );

      logger.info('火山引擎 TTS 响应:', {
        code: response.data?.code,
        message: response.data?.message
      });

      // 检查响应
      // 注意：火山引擎 TTS 成功的响应码是 3000，不是 0！
      if (response.data && response.data.code === 3000) {
        logger.info('火山引擎 TTS 测试成功');
        return {
          success: true,
          message: '火山引擎 TTS 配置测试成功',
          data: {
            reqid: response.data.reqid,
            hasAudio: !!response.data.data
          }
        };
      } else if (response.data && response.data.code === 3001) {
        // 访问被拒绝
        return {
          success: false,
          message: '访问被拒绝：请检查 Access Token 是否有效或已过期',
          code: response.data.code
        };
      } else if (response.data && response.data.code === 0) {
        // 认证失败或其他错误
        return {
          success: false,
          message: '认证失败：AppID 或 Access Token 不正确，请检查控制台配置',
          code: response.data.code
        };
      } else {
        logger.warn('火山引擎 TTS 测试失败:', response.data);
        return {
          success: false,
          message: `火山引擎 TTS 返回错误: ${response.data?.message || '未知错误'}`,
          code: response.data?.code
        };
      }
    } catch (error) {
      logger.error('火山引擎 TTS 测试异常:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response) {
        if (error.response.status === 401) {
          return {
            success: false,
            message: '认证失败：请检查 AppID 和 Access Token 是否正确',
            details: error.response.data
          };
        }
        return {
          success: false,
          message: `API 调用失败: ${error.response.status} ${error.response.statusText}`,
          details: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          message: '网络请求失败，请检查网络连接和接口地址'
        };
      } else {
        return {
          success: false,
          message: `测试失败: ${error.message}`
        };
      }
    }
  }

  /**
   * 生成火山引擎签名
   * @param {string} secret - Secret Key
   * @param {string} body - 请求体
   * @returns {string} 签名
   */
  generateVolcengineSignature(secret, body) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    return hmac.digest('hex');
  }

  /**
   * 测试谷歌 TTS 配置
   * @param {string} text - 测试文本
   * @returns {Promise<Object>} 测试结果
   */
  async testGoogleTTS(text = 'Hello, this is a test.') {
    try {
      const config = await AdminService.getTTSConfig();
      const googleConfig = config.google;

      // 验证配置完整性
      if (!googleConfig.apiKey) {
        return {
          success: false,
          message: '谷歌 TTS 配置不完整'
        };
      }

      // 准备请求参数
      const requestBody = {
        input: { text: text },
        voice: {
          languageCode: googleConfig.languageCode,
          name: googleConfig.voiceName
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: googleConfig.speakingRate
        }
      };

      // 发送请求
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleConfig.apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      // 检查响应
      if (response.data && response.data.audioContent) {
        logger.info('谷歌 TTS 测试成功');
        return {
          success: true,
          message: '谷歌 TTS 配置测试成功',
          data: {
            hasAudio: true,
            audioLength: response.data.audioContent.length
          }
        };
      } else {
        logger.warn('谷歌 TTS 测试失败:', response.data);
        return {
          success: false,
          message: '谷歌 TTS 返回数据异常'
        };
      }
    } catch (error) {
      logger.error('谷歌 TTS 测试异常:', error);
      
      if (error.response) {
        return {
          success: false,
          message: `API 调用失败: ${error.response.status} ${error.response.statusText}`,
          details: error.response.data
        };
      } else if (error.request) {
        return {
          success: false,
          message: '网络请求失败，请检查网络连接'
        };
      } else {
        return {
          success: false,
          message: `测试失败: ${error.message}`
        };
      }
    }
  }

  /**
   * 获取火山引擎 TTS 音频（使用 Token 认证方式）
   * 优先从缓存获取，缓存未命中时调用 API 并缓存结果
   * @param {string} text - 要转换的文本
   * @returns {Promise<Buffer>} 音频数据
   */
  async getVolcengineAudio(text) {
    try {
      // 1. 先查询缓存
      const cache = await AudioCacheService.getCache(text);
      if (cache) {
        logger.info(`从缓存返回音频: ${text.substring(0, 50)}...`);
        return await AudioCacheService.readCacheFile(cache);
      }

      // 2. 缓存未命中，调用 API
      logger.info(`缓存未命中，调用火山引擎 API: ${text.substring(0, 50)}...`);
      
      const config = await AdminService.getTTSConfig();
      const volcConfig = config.volcengine;

      const timestamp = Math.floor(Date.now() / 1000);
      const requestBody = {
        app: {
          appid: volcConfig.appId,
          token: volcConfig.apiKey,  // 使用真实的 access token
          cluster: volcConfig.cluster || 'volcano_tts'
        },
        user: {
          uid: 'user_' + timestamp
        },
        audio: {
          voice_type: volcConfig.voiceType || 'BV001_streaming',
          encoding: 'mp3',
          speed_ratio: 1.0,
          volume_ratio: 1.0,
          pitch_ratio: 1.0
        },
        request: {
          reqid: `req_${timestamp}`,
          text: text,
          text_type: 'plain',
          operation: 'query',
          with_frontend: 1,
          frontend_type: 'unitTson'
        }
      };

      // Token 认证需要 Authorization header
      const response = await axios.post(
        volcConfig.endpoint || 'https://openspeech.bytedance.com/api/v1/tts',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer;${volcConfig.apiKey}`  // 使用 Access Token
          },
          timeout: 10000
        }
      );

      // 注意：火山引擎 TTS 成功的响应码是 3000，不是 0！
      if (response.data && response.data.code === 3000 && response.data.data) {
        // 返回 base64 编码的音频数据
        const audioBuffer = Buffer.from(response.data.data, 'base64');
        
        // 3. 保存到缓存
        try {
          await AudioCacheService.saveCache(text, audioBuffer, 'volcengine');
          logger.info(`音频已缓存: ${text.substring(0, 50)}...`);
        } catch (cacheError) {
          logger.error('保存缓存失败（不影响返回）:', cacheError);
        }
        
        return audioBuffer;
      } else {
        const errorMsg = `获取音频失败: code=${response.data?.code}, message=${response.data?.message}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      logger.error('获取火山引擎音频失败:', error);
      throw error;
    }
  }
}

export default new TTSService();
