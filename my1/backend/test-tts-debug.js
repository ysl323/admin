/**
 * 详细调试火山引擎 TTS 请求
 */

import axios from 'axios';
import AdminService from './src/services/AdminService.js';

async function debugTTS() {
  try {
    console.log('=== 火山引擎 TTS 详细调试 ===\n');
    
    // 获取配置
    const config = await AdminService.getTTSConfig();
    const volcConfig = config.volcengine;
    
    console.log('1. 当前配置:');
    console.log('  AppID:', volcConfig.appId);
    console.log('  Access Token:', volcConfig.apiKey);
    console.log('  Endpoint:', volcConfig.endpoint);
    console.log('  Voice Type:', volcConfig.voiceType);
    console.log('  Cluster:', volcConfig.cluster);
    console.log('');
    
    // 准备请求
    const timestamp = Math.floor(Date.now() / 1000);
    const requestBody = {
      app: {
        appid: volcConfig.appId,
        token: 'access_token',
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
        reqid: `test_${timestamp}`,
        text: 'Hello, this is a test.',
        text_type: 'plain',
        operation: 'query'
      }
    };
    
    console.log('2. 请求体:');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer;${volcConfig.apiKey}`
    };
    
    console.log('3. 请求头:');
    console.log('  Content-Type:', headers['Content-Type']);
    console.log('  Authorization:', `Bearer;${volcConfig.apiKey.substring(0, 10)}...`);
    console.log('');
    
    console.log('4. 发送请求...');
    console.log('  URL:', volcConfig.endpoint);
    console.log('');
    
    try {
      const response = await axios.post(
        volcConfig.endpoint,
        requestBody,
        {
          headers,
          timeout: 10000
        }
      );
      
      console.log('5. 响应:');
      console.log('  Status:', response.status);
      console.log('  Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.code === 0) {
        console.log('\n✓ 请求成功!');
      } else {
        console.log('\n✗ 请求失败');
        console.log('  错误码:', response.data?.code);
        console.log('  错误信息:', response.data?.message);
      }
    } catch (error) {
      console.log('5. 请求异常:');
      console.log('  Message:', error.message);
      
      if (error.response) {
        console.log('  Status:', error.response.status);
        console.log('  Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n调试失败:', error);
    process.exit(1);
  }
}

debugTTS();
