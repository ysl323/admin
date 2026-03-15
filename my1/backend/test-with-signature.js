/**
 * 测试使用签名认证
 */

import axios from 'axios';
import crypto from 'crypto';

async function testWithSignature() {
  try {
    console.log('=== 测试签名认证 ===\n');
    
    const appId = '2322585992';
    const accessToken = 'xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys';
    const secretKey = 'MkJ8GxK_4PZcsuxBXSAZw1CkUa1JJh_F';
    const cluster = 'volcano_tts';
    const voiceType = 'BV001_streaming';
    
    console.log('凭据:');
    console.log('  AppID:', appId);
    console.log('  Access Token:', accessToken);
    console.log('  Secret Key:', secretKey);
    console.log('');
    
    const params = {
      app: {
        appid: appId,
        token: "access_token",
        cluster: cluster
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
    
    const bodyStr = JSON.stringify(params);
    
    // 生成签名
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(bodyStr);
    const signature = hmac.digest('hex');
    
    console.log('签名信息:');
    console.log('  Body:', bodyStr.substring(0, 100) + '...');
    console.log('  Signature:', signature);
    console.log('');
    
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer;${accessToken}`,
      "X-Signature": signature
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
      console.log('\n✓ 成功! 签名认证有效');
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

testWithSignature();
