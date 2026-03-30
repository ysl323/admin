/**
 * 火山引擎 TTS 独立测试脚本
 * 可以直接发给别人运行检查
 */

import axios from 'axios';
import crypto from 'crypto';

// 使用最新的凭据（刚重新生成的）
const CONFIG = {
  appId: '2322585992',
  accessToken: 'xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys',
  secretKey: 'MkJ8GxK_4PZcsuxBXSAZw1CkUa1JJh_F',
  endpoint: 'https://openspeech.bytedance.com/tts_middle_layer/tts',
  cluster: 'volcano_tts',
  voiceType: 'BV001_streaming'
};

function generateSignature(secret, body) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  return hmac.digest('hex');
}

async function testTTS() {
  console.log('='.repeat(70));
  console.log('火山引擎 TTS 测试 - 请帮忙检查代码是否有问题');
  console.log('='.repeat(70));
  
  const text = 'Hello, this is a test.';
  const timestamp = Math.floor(Date.now() / 1000);

  const requestBody = {
    app: {
      appid: CONFIG.appId,
      token: 'access_token',  // 按照官方文档，这里是固定值
      cluster: CONFIG.cluster
    },
    user: {
      uid: `test_user_${timestamp}`
    },
    audio: {
      voice_type: CONFIG.voiceType,
      encoding: 'mp3',
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0
    },
    request: {
      reqid: `test_${timestamp}`,
      text: text,
      text_type: 'plain',
      operation: 'query'
    }
  };

  console.log('\n配置信息:');
  console.log('  AppID:', CONFIG.appId);
  console.log('  Access Token:', CONFIG.accessToken);
  console.log('  Secret Key:', CONFIG.secretKey);
  console.log('  Endpoint:', CONFIG.endpoint);
  console.log('  Cluster:', CONFIG.cluster);
  console.log('  Voice Type:', CONFIG.voiceType);
  
  console.log('\n请求体:');
  console.log(JSON.stringify(requestBody, null, 2));

  // 测试1: 仅使用 Token 认证
  console.log('\n' + '='.repeat(70));
  console.log('[测试 1] Token 认证（不使用签名）');
  console.log('='.repeat(70));
  try {
    const headers1 = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer;${CONFIG.accessToken}`
    };
    
    console.log('请求头:', headers1);
    
    const response1 = await axios.post(CONFIG.endpoint, requestBody, {
      headers: headers1,
      timeout: 10000
    });

    console.log('\n响应:');
    console.log(JSON.stringify(response1.data, null, 2));
    
    if (response1.data.code === 3000) {
      console.log('\n✓ 测试1成功! 代码没有问题!');
      return true;
    } else {
      console.log(`\n✗ 测试1失败: code=${response1.data.code}, message=${response1.data.message}`);
    }
  } catch (error) {
    console.log('\n✗ 测试1异常:');
    if (error.response) {
      console.log('  状态码:', error.response.status);
      console.log('  响应:', error.response.data);
    } else {
      console.log('  错误:', error.message);
    }
  }

  // 测试2: 使用 Token + 签名认证
  console.log('\n' + '='.repeat(70));
  console.log('[测试 2] Token + 签名认证');
  console.log('='.repeat(70));
  try {
    const bodyStr = JSON.stringify(requestBody);
    const signature = generateSignature(CONFIG.secretKey, bodyStr);

    const headers2 = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer;${CONFIG.accessToken}`,
      'X-Signature': signature
    };
    
    console.log('请求头:', headers2);
    
    const response2 = await axios.post(CONFIG.endpoint, requestBody, {
      headers: headers2,
      timeout: 10000
    });

    console.log('\n响应:');
    console.log(JSON.stringify(response2.data, null, 2));
    
    if (response2.data.code === 3000) {
      console.log('\n✓ 测试2成功! 代码没有问题!');
      return true;
    } else {
      console.log(`\n✗ 测试2失败: code=${response2.data.code}, message=${response2.data.message}`);
    }
  } catch (error) {
    console.log('\n✗ 测试2异常:');
    if (error.response) {
      console.log('  状态码:', error.response.status);
      console.log('  响应:', error.response.data);
    } else {
      console.log('  错误:', error.message);
    }
  }

  // 测试3: 尝试不同的 cluster 值
  console.log('\n' + '='.repeat(70));
  console.log('[测试 3] 尝试不同的 cluster 值');
  console.log('='.repeat(70));
  
  const clusters = ['volcano_tts', 'volc_tts', 'BigTTS20000006481455355586'];
  
  for (const cluster of clusters) {
    console.log(`\n尝试 cluster: ${cluster}`);
    const testBody = { ...requestBody };
    testBody.app.cluster = cluster;
    
    try {
      const response3 = await axios.post(CONFIG.endpoint, testBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer;${CONFIG.accessToken}`
        },
        timeout: 10000
      });

      console.log('响应:', response3.data);
      
      if (response3.data.code === 3000) {
        console.log(`\n✓ 测试3成功! 正确的 cluster 是: ${cluster}`);
        return true;
      }
    } catch (error) {
      console.log('失败:', error.response?.data || error.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('所有测试完成');
  console.log('='.repeat(70));
  console.log('\n结论: 所有测试都返回 3001 错误 (access denied)');
  console.log('\n可能的原因:');
  console.log('1. 代码有问题（请帮忙检查）');
  console.log('2. AppID 和 Access Token 不匹配');
  console.log('3. 该应用没有开通标准 TTS 服务权限');
  console.log('4. 需要使用不同的 API 端点或调用方式');
  
  return false;
}

// 运行测试
testTTS()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n发生错误:', error);
    process.exit(1);
  });
