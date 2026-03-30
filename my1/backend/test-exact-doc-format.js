/**
 * 完全按照火山引擎官方文档的格式测试
 */

import axios from 'axios';
import AdminService from './src/services/AdminService.js';

async function testExactFormat() {
  try {
    console.log('=== 完全按照官方文档格式测试 ===\n');
    
    const config = await AdminService.getTTSConfig();
    const volcConfig = config.volcengine;
    
    console.log('配置信息:');
    console.log('  AppID:', volcConfig.appId);
    console.log('  Access Token:', volcConfig.apiKey);
    console.log('  Cluster:', volcConfig.cluster);
    console.log('  Voice Type:', volcConfig.voiceType);
    console.log('');
    
    // 完全按照官方文档的格式
    const params = {
      app: {
        appid: volcConfig.appId,
        token: "access_token",  // 官方文档中的固定值
        cluster: volcConfig.cluster
      },
      user: {
        uid: "uid"  // 官方文档中使用简单的 "uid"
      },
      audio: {
        voice_type: volcConfig.voiceType,
        encoding: "mp3",
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0
      },
      request: {
        reqid: "test_" + Date.now(),
        text: "Hello, this is a test.",
        text_type: "plain",
        operation: "query"
      }
    };
    
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer;${volcConfig.apiKey}`
    };
    
    console.log('请求参数:');
    console.log(JSON.stringify(params, null, 2));
    console.log('');
    
    console.log('请求头:');
    console.log('  Authorization:', `Bearer;${volcConfig.apiKey.substring(0, 10)}...`);
    console.log('');
    
    console.log('发送请求到:', volcConfig.endpoint);
    console.log('');
    
    const response = await axios.post(
      volcConfig.endpoint,
      params,
      { headers, timeout: 10000 }
    );
    
    console.log('响应:');
    console.log('  Code:', response.data.code);
    console.log('  Message:', response.data.message);
    console.log('  ReqID:', response.data.reqid);
    console.log('  Has Data:', !!response.data.data);
    console.log('');
    
    // 根据官方文档,成功的 code 是 3000
    if (response.data.code === 3000) {
      console.log('✓ 测试成功! 响应码 3000 表示成功');
      console.log('  音频数据长度:', response.data.data ? response.data.data.length : 0);
    } else {
      console.log('✗ 测试失败');
      console.log('  完整响应:', JSON.stringify(response.data, null, 2));
    }
    
    process.exit(response.data.code === 3000 ? 0 : 1);
  } catch (error) {
    console.error('\n测试异常:', error.message);
    if (error.response) {
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testExactFormat();
