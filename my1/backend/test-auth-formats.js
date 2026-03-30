/**
 * 测试不同的 Authorization 格式
 */

import axios from 'axios';
import AdminService from './src/services/AdminService.js';

async function testAuthFormats() {
  try {
    console.log('=== 测试不同的 Authorization 格式 ===\n');
    
    const config = await AdminService.getTTSConfig();
    const volcConfig = config.volcengine;
    
    const timestamp = Math.floor(Date.now() / 1000);
    const requestBody = {
      app: {
        appid: volcConfig.appId,
        token: 'access_token',
        cluster: volcConfig.cluster
      },
      user: {
        uid: 'test_user_' + timestamp
      },
      audio: {
        voice_type: volcConfig.voiceType,
        encoding: 'mp3',
        speed_ratio: 1.0,
        volume_ratio: 1.0,
        pitch_ratio: 1.0
      },
      request: {
        reqid: `test_${timestamp}`,
        text: 'Hello',
        text_type: 'plain',
        operation: 'query'
      }
    };
    
    // 测试不同的格式
    const formats = [
      { name: 'Bearer;token', value: `Bearer;${volcConfig.apiKey}` },
      { name: 'Bearer token', value: `Bearer ${volcConfig.apiKey}` },
      { name: 'token only', value: volcConfig.apiKey }
    ];
    
    for (const format of formats) {
      console.log(`\n测试格式: ${format.name}`);
      console.log(`  Authorization: ${format.value.substring(0, 20)}...`);
      
      try {
        const response = await axios.post(
          volcConfig.endpoint,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': format.value
            },
            timeout: 10000
          }
        );
        
        console.log(`  响应码: ${response.data.code}`);
        console.log(`  消息: ${response.data.message}`);
        
        if (response.data.code === 0) {
          console.log(`  ✓ 成功!`);
          break;
        } else {
          console.log(`  ✗ 失败`);
        }
      } catch (error) {
        console.log(`  ✗ 异常: ${error.message}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('\n测试失败:', error);
    process.exit(1);
  }
}

testAuthFormats();
