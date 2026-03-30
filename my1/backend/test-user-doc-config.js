/**
 * 测试用户文档中提供的火山引擎 TTS 配置
 * 
 * 根据用户文档:
 * - AppID: 2128862431
 * - Access Token: eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq
 * - Voice Type: BV001_streaming
 * - Cluster: volcano_tts
 * 
 * 用户反馈: "人家测试正常,有返回数据"
 * 
 * 这个脚本将完全按照用户文档的格式进行测试
 */

import axios from 'axios';

const config = {
  appId: '2128862431',
  accessToken: 'eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq',
  voiceType: 'BV001_streaming',
  cluster: 'volcano_tts',
  endpoint: 'https://openspeech.bytedance.com/api/v1/tts'
};

async function testTTS() {
  console.log('='.repeat(60));
  console.log('测试火山引擎 TTS - 用户文档配置');
  console.log('='.repeat(60));
  console.log('配置信息:');
  console.log(`  AppID: ${config.appId}`);
  console.log(`  Access Token: ${config.accessToken}`);
  console.log(`  Voice Type: ${config.voiceType}`);
  console.log(`  Cluster: ${config.cluster}`);
  console.log(`  Endpoint: ${config.endpoint}`);
  console.log('='.repeat(60));

  const text = 'Hello, this is a test.';
  const timestamp = Math.floor(Date.now() / 1000);

  // 方式1: 尝试 GET 请求 (类似用户文档中的前端调用)
  console.log('\n[测试 1] GET 请求方式:');
  try {
    const getUrl = `${config.endpoint}?appid=${config.appId}&token=${config.accessToken}&voice_type=${config.voiceType}&text=${encodeURIComponent(text)}`;
    console.log(`URL: ${getUrl}`);
    
    const getResponse = await axios.get(getUrl, {
      timeout: 10000,
      responseType: 'arraybuffer'
    });

    console.log(`✓ GET 请求成功!`);
    console.log(`  状态码: ${getResponse.status}`);
    console.log(`  Content-Type: ${getResponse.headers['content-type']}`);
    console.log(`  数据大小: ${getResponse.data.length} bytes`);
    
    if (getResponse.headers['content-type']?.includes('audio')) {
      console.log(`  ✓ 返回了音频数据!`);
      return true;
    }
  } catch (error) {
    console.log(`✗ GET 请求失败:`);
    if (error.response) {
      console.log(`  状态码: ${error.response.status}`);
      console.log(`  响应: ${error.response.data.toString()}`);
    } else {
      console.log(`  错误: ${error.message}`);
    }
  }

  // 方式2: 尝试 POST 请求 (标准 JSON 格式)
  console.log('\n[测试 2] POST 请求 - JSON 格式:');
  try {
    const requestBody = {
      app: {
        appid: config.appId,
        token: 'access_token',
        cluster: config.cluster
      },
      user: {
        uid: `test_user_${timestamp}`
      },
      audio: {
        voice_type: config.voiceType,
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

    console.log('请求体:', JSON.stringify(requestBody, null, 2));

    const postResponse = await axios.post(
      'https://openspeech.bytedance.com/tts_middle_layer/tts',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer;${config.accessToken}`
        },
        timeout: 10000
      }
    );

    console.log(`✓ POST 请求成功!`);
    console.log(`  响应码: ${postResponse.data.code}`);
    console.log(`  消息: ${postResponse.data.message}`);
    
    if (postResponse.data.code === 3000) {
      console.log(`  ✓ 成功! (code=3000)`);
      if (postResponse.data.data) {
        console.log(`  ✓ 返回了音频数据!`);
      }
      return true;
    } else {
      console.log(`  ✗ 失败: code=${postResponse.data.code}`);
    }
  } catch (error) {
    console.log(`✗ POST 请求失败:`);
    if (error.response) {
      console.log(`  状态码: ${error.response.status}`);
      console.log(`  响应:`, error.response.data);
    } else {
      console.log(`  错误: ${error.message}`);
    }
  }

  // 方式3: 尝试简化的 POST 请求
  console.log('\n[测试 3] POST 请求 - 简化格式:');
  try {
    const simpleBody = {
      appid: config.appId,
      token: config.accessToken,
      voice_type: config.voiceType,
      text: text,
      encoding: 'mp3'
    };

    console.log('请求体:', JSON.stringify(simpleBody, null, 2));

    const simpleResponse = await axios.post(
      config.endpoint,
      simpleBody,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        responseType: 'arraybuffer'
      }
    );

    console.log(`✓ 简化 POST 请求成功!`);
    console.log(`  状态码: ${simpleResponse.status}`);
    console.log(`  Content-Type: ${simpleResponse.headers['content-type']}`);
    console.log(`  数据大小: ${simpleResponse.data.length} bytes`);
    
    if (simpleResponse.headers['content-type']?.includes('audio')) {
      console.log(`  ✓ 返回了音频数据!`);
      return true;
    }
  } catch (error) {
    console.log(`✗ 简化 POST 请求失败:`);
    if (error.response) {
      console.log(`  状态码: ${error.response.status}`);
      console.log(`  响应: ${error.response.data.toString()}`);
    } else {
      console.log(`  错误: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('所有测试完成');
  console.log('='.repeat(60));
  
  return false;
}

// 运行测试
testTTS()
  .then(success => {
    if (success) {
      console.log('\n✓ 测试成功! 找到了正确的调用方式。');
      process.exit(0);
    } else {
      console.log('\n✗ 所有测试都失败了。');
      console.log('\n可能的原因:');
      console.log('1. Access Token 已过期 (文档日期: 2025-02-16, 当前: 2026-03-07)');
      console.log('2. AppID 与 Access Token 不匹配');
      console.log('3. API 端点已更改');
      console.log('4. 需要使用不同的认证方式');
      console.log('\n建议: 请登录火山引擎控制台重新获取 Access Token');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n✗ 测试过程中发生错误:', error.message);
    process.exit(1);
  });
