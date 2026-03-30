/**
 * 火山引擎 TTS 正确的测试脚本
 * 根据用户提供的正确代码修复
 */

import axios from 'axios';

// 使用已验证可用的配置
const CONFIG = {
  app_id: '2128862431',
  access_token: 'eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq',
  voice_type: 'BV001_streaming',
  cluster: 'volcano_tts',
  endpoint: 'https://openspeech.bytedance.com/api/v1/tts'  // ✅ 正确的端点
};

async function testVolcanoTTS(text = 'Hello, this is a test.') {
  console.log('========================================');
  console.log('火山TTS测试 - 使用正确的配置');
  console.log('========================================');
  console.log('应用ID:', CONFIG.app_id);
  console.log('访问令牌:', CONFIG.access_token);
  console.log('API端点:', CONFIG.endpoint);
  console.log('测试文本:', text);
  console.log('========================================\n');

  const timestamp = Math.floor(Date.now() / 1000);

  // ✅ 正确的请求体结构
  const requestBody = {
    app: {
      appid: CONFIG.app_id,           // ✅ 使用真实app_id
      token: CONFIG.access_token,     // ✅ 使用真实token，不是字符串'access_token'
      cluster: CONFIG.cluster
    },
    user: {
      uid: 'test-user-' + timestamp
    },
    audio: {
      voice_type: CONFIG.voice_type,
      encoding: 'mp3',
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0
    },
    request: {
      reqid: 'test-' + timestamp,
      text: text,
      text_type: 'plain',
      operation: 'query'
    }
  };

  console.log('请求体:');
  console.log(JSON.stringify(requestBody, null, 2));
  console.log('');

  try {
    // ✅ 正确的请求头
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer;' + CONFIG.access_token  // ✅ 正确的格式
    };

    console.log('请求头:');
    console.log(headers);
    console.log('');

    const response = await axios.post(CONFIG.endpoint, requestBody, {
      headers,
      timeout: 10000
    });

    console.log('API响应:');
    console.log('- 响应代码:', response.data.code);
    console.log('- 响应消息:', response.data.message || '无');

    if (response.data.code === 3000 && response.data.data) {
      const audioSize = Buffer.from(response.data.data, 'base64').length;
      console.log('- 音频大小:', audioSize, '字节');
      console.log('\n✅ 成功！');
      return {
        success: true,
        audioBuffer: Buffer.from(response.data.data, 'base64'),
        size: audioSize
      };
    } else {
      console.log('\n❌ 失败！');
      console.log('错误代码:', response.data.code);
      console.log('错误消息:', response.data.message);
      return {
        success: false,
        code: response.data.code,
        message: response.data.message
      };
    }
  } catch (error) {
    console.log('❌ 请求失败:');
    if (error.response) {
      console.log('  状态码:', error.response.status);
      console.log('  响应:', error.response.data);
    } else {
      console.log('  错误:', error.message);
    }
    return {
      success: false,
      error: error.message
    };
  }
}

// 运行测试
testVolcanoTTS('Hello, this is a test.')
  .then(result => {
    if (result.success) {
      console.log('\n测试完成，音频大小:', result.size, '字节');
      process.exit(0);
    } else {
      console.log('\n测试失败');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n测试异常:', error.message);
    process.exit(1);
  });
