/**
 * 测试所有记录的火山TTS ID，找到可用的
 */

import axios from 'axios';

// 所有记录的TTS配置
const TTS_CONFIGS = [
  {
    name: '配置1 - VOLCENGINE-TTS-CONFIG.md',
    appId: '8594935941',
    accessToken: 'sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL',
    secretKey: 'hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR',
    endpoint: 'https://openspeech.bytedance.com/api/v1/tts'
  },
  {
    name: '配置2 - update-tts-credentials.js',
    appId: '2128862431',
    accessToken: 'eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq',
    endpoint: 'https://openspeech.bytedance.com/tts_middle_layer/tts'
  },
  {
    name: '配置3 - test-tts-standalone.js',
    appId: '2322585992',
    accessToken: 'xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys',
    secretKey: 'MkJ8GxK_4PZcsuxBXSAZw1CkUa1JJh_F',
    endpoint: 'https://openspeech.bytedance.com/tts_middle_layer/tts'
  },
  {
    name: '配置4 - test-tts-session.ps1 (新发现)',
    appId: '3554335541',
    accessToken: 'aMVjJULQqyM47yryVgj4411cQXWAPLi',
    secretKey: 'HLNEgAWDWNgc-NHgZw4ePZwkbU_cRLcffR',
    endpoint: 'https://openspeech.bytedance.com/api/v1/tts'
  }
];

async function testTTSConfig(config) {
  console.log(`\n========================================`);
  console.log(`测试: ${config.name}`);
  console.log(`========================================`);
  console.log(`AppID: ${config.appId}`);
  console.log(`Access Token: ${config.accessToken.substring(0, 8)}...`);
  if (config.secretKey) {
    console.log(`Secret Key: ${config.secretKey.substring(0, 8)}...`);
  }
  console.log(`Endpoint: ${config.endpoint}`);
  
  const timestamp = Math.floor(Date.now() / 1000);
  const text = 'Hello, test.';

  // 测试1: Token认证
  const requestBody = {
    app: {
      appid: config.appId,
      token: config.accessToken,
      cluster: 'volcano_tts'
    },
    user: {
      uid: `test_user_${timestamp}`
    },
    audio: {
      voice_type: 'BV001_streaming',
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

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer;${config.accessToken}`
    };

    console.log('\n[测试1] Token认证...');
    const response = await axios.post(config.endpoint, requestBody, {
      headers,
      timeout: 10000
    });

    console.log(`响应码: ${response.data.code}`);
    console.log(`响应消息: ${response.data.message || '无'}`);

    if (response.data.code === 3000) {
      console.log(`✅ 成功！配置可用`);
      return { success: true, config, method: 'token' };
    }

    // 测试2: 如果有secretKey，测试签名认证
    if (config.secretKey) {
      console.log('\n[测试2] 签名认证...');
      const crypto = await import('crypto');
      const hmac = crypto.createHmac('sha256', config.secretKey);
      hmac.update(JSON.stringify(requestBody));
      const signature = hmac.digest('hex');

      const headers2 = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer;${config.accessToken}`,
        'X-Signature': signature
      };

      const response2 = await axios.post(config.endpoint, requestBody, {
        headers: headers2,
        timeout: 10000
      });

      console.log(`响应码: ${response2.data.code}`);
      console.log(`响应消息: ${response2.data.message || '无'}`);

      if (response2.data.code === 3000) {
        console.log(`✅ 成功！配置可用（签名认证）`);
        return { success: true, config, method: 'signature' };
      }
    }

    console.log(`❌ 失败`);
    return { success: false, config, error: `Code ${response.data.code}: ${response.data.message}` };

  } catch (error) {
    console.log(`❌ 异常: ${error.message}`);
    if (error.response) {
      console.log(`状态码: ${error.response.status}`);
      console.log(`响应: ${JSON.stringify(error.response.data)}`);
    }
    return { success: false, config, error: error.message };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('测试所有记录的火山TTS配置');
  console.log('='.repeat(70));

  const results = [];
  for (const config of TTS_CONFIGS) {
    const result = await testTTSConfig(config);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 间隔1秒
  }

  console.log('\n' + '='.repeat(70));
  console.log('测试结果总结');
  console.log('='.repeat(70));

  const successConfigs = results.filter(r => r.success);
  const failedConfigs = results.filter(r => !r.success);

  if (successConfigs.length > 0) {
    console.log(`\n✅ 找到 ${successConfigs.length} 个可用配置:`);
    successConfigs.forEach((r, i) => {
      console.log(`\n配置 ${i + 1}: ${r.config.name}`);
      console.log(`  AppID: ${r.config.appId}`);
      console.log(`  Access Token: ${r.config.accessToken}`);
      console.log(`  Endpoint: ${r.config.endpoint}`);
      console.log(`  认证方式: ${r.method}`);
      if (r.config.secretKey) {
        console.log(`  Secret Key: ${r.config.secretKey}`);
      }
    });

    // 输出可用的配置代码
    console.log(`\n=== 可用的配置代码 ===`);
    const workingConfig = successConfigs[0].config;
    console.log(`{
  appId: '${workingConfig.appId}',
  accessToken: '${workingConfig.accessToken}',
  ${workingConfig.secretKey ? `secretKey: '${workingConfig.secretKey}',` : ''}
  endpoint: '${workingConfig.endpoint}',
  voiceType: 'BV001_streaming',
  cluster: 'volcano_tts'
}`);
  } else {
    console.log('\n❌ 没有找到可用的配置');
    console.log('\n失败的配置:');
    failedConfigs.forEach((r, i) => {
      console.log(`\n${i + 1}. ${r.config.name}`);
      console.log(`   错误: ${r.error}`);
    });
  }

  process.exit(successConfigs.length > 0 ? 0 : 1);
}

main();
