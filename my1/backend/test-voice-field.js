/**
 * 测试官方文档中的 voice 字段
 * 官方示例中有 voice 和 voice_type 两个字段
 */

import axios from 'axios';
import AdminService from './src/services/AdminService.js';

async function testVoiceField() {
  try {
    console.log('=== 测试 voice 字段 ===\n');
    
    const config = await AdminService.getTTSConfig();
    const volcConfig = config.volcengine;
    
    // 官方文档中的格式包含 voice 和 voice_type
    const params = {
      app: {
        appid: volcConfig.appId,
        token: "access_token",
        cluster: volcConfig.cluster
      },
      user: {
        uid: "uid"
      },
      audio: {
        voice: "other",  // 官方文档中有这个字段
        voice_type: volcConfig.voiceType,
        encoding: "mp3",
        speed: 1.0,  // 注意：官方文档用的是 speed，不是 speed_ratio
        volume: 1.0,  // volume，不是 volume_ratio
        pitch: 1.0   // pitch，不是 pitch_ratio
      },
      request: {
        reqid: "test_" + Date.now(),
        text: "Hello",
        text_type: "plain",
        operation: "query"
      }
    };
    
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer;${volcConfig.apiKey}`
    };
    
    console.log('使用官方文档中的字段名:');
    console.log('  audio.voice: "other"');
    console.log('  audio.speed (不是 speed_ratio)');
    console.log('  audio.volume (不是 volume_ratio)');
    console.log('  audio.pitch (不是 pitch_ratio)');
    console.log('');
    
    console.log('发送请求...');
    const response = await axios.post(
      volcConfig.endpoint,
      params,
      { headers, timeout: 10000 }
    );
    
    console.log('\n响应:');
    console.log('  Code:', response.data.code);
    console.log('  Message:', response.data.message);
    
    if (response.data.code === 3000) {
      console.log('\n✓ 成功! 使用 voice/speed/volume/pitch 字段有效');
    } else {
      console.log('\n✗ 失败');
      console.log('完整响应:', JSON.stringify(response.data, null, 2));
    }
    
    process.exit(response.data.code === 3000 ? 0 : 1);
  } catch (error) {
    console.error('\n异常:', error.message);
    if (error.response) {
      console.error('响应:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testVoiceField();
