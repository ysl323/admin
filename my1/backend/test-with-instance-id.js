/**
 * 使用实例ID作为 cluster 测试
 */

import axios from 'axios';

async function testWithInstanceId() {
  try {
    console.log('=== 使用实例ID测试 ===\n');
    
    const appId = '2322585992';
    const accessToken = 'xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys';
    const instanceId = 'BigTTS20000006481455355586';
    const voiceType = 'BV001_streaming';
    
    console.log('配置:');
    console.log('  AppID:', appId);
    console.log('  Access Token:', accessToken);
    console.log('  Instance ID (作为 cluster):', instanceId);
    console.log('');
    
    const params = {
      app: {
        appid: appId,
        token: "access_token",
        cluster: instanceId  // 使用实例ID作为 cluster
      },
      user: {
        uid: "uid"
      },
      audio: {
        voice_type: voiceType,
        encoding: "mp3",
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0
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
      "Authorization": `Bearer;${accessToken}`
    };
    
    console.log('发送请求...');
    const response = await axios.post(
      'https://openspeech.bytedance.com/tts_middle_layer/tts',
      params,
      { headers, timeout: 10000 }
    );
    
    console.log('\n响应:');
    console.log('  Code:', response.data.code);
    console.log('  Message:', response.data.message);
    
    if (response.data.code === 3000) {
      console.log('\n✓ 成功! 实例ID有效');
      console.log('  音频数据长度:', response.data.data ? response.data.data.length : 0);
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

testWithInstanceId();
