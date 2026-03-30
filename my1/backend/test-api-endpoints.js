/**
 * 测试API端点
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 测试配置
const tests = [
  {
    name: '测试 GET /learning/categories',
    method: 'GET',
    url: `${BASE_URL}/learning/categories`,
    needsAuth: false
  },
  {
    name: '测试 GET /learning/categories/:id/lessons',
    method: 'GET',
    url: `${BASE_URL}/learning/categories/1/lessons`,
    needsAuth: false
  },
  {
    name: '测试 GET /learning/lessons/:id/words',
    method: 'GET',
    url: `${BASE_URL}/learning/lessons/1/words`,
    needsAuth: false
  },
  {
    name: '测试 GET /tts/speak',
    method: 'GET',
    url: `${BASE_URL}/tts/speak?text=hello`,
    needsAuth: true
  },
  {
    name: '测试 POST /tts/speak',
    method: 'POST',
    url: `${BASE_URL}/tts/speak`,
    data: { text: 'hello' },
    needsAuth: true
  }
];

async function runTests() {
  console.log('========================================');
  console.log('开始测试API端点');
  console.log('========================================\n');

  for (const test of tests) {
    try {
      console.log(`\n${test.name}`);
      console.log(`${test.method} ${test.url}`);
      
      const config = {
        method: test.method,
        url: test.url,
        validateStatus: () => true // 接受所有状态码
      };

      if (test.data) {
        config.data = test.data;
      }

      if (test.needsAuth) {
        console.log('⚠️  需要认证 - 跳过测试');
        continue;
      }

      const response = await axios(config);
      
      console.log(`状态码: ${response.status}`);
      
      if (response.status === 200) {
        console.log('✅ 成功');
        if (response.data) {
          console.log('返回数据结构:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
        }
      } else {
        console.log('❌ 失败');
        console.log('错误信息:', response.data);
      }
    } catch (error) {
      console.log('❌ 请求失败');
      console.log('错误:', error.message);
    }
  }

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================');
}

runTests();
