/**
 * 测试单词掌握状态API
 * 运行方式: node check-word-mastery-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// 模拟用户token（需要从实际登录获取）
const AUTH_TOKEN = 'your-auth-token-here';

const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testWordMasteryAPI() {
  console.log('开始测试单词掌握状态API...\n');

  const lessonId = 1;
  const wordId = 1;

  try {
    // 测试1：标记单词为已掌握
    console.log('测试1：标记单词为已掌握');
    const markResponse = await axios.post(
      `${BASE_URL}/word-mastery`,
      { lessonId, wordId },
      { headers }
    );
    console.log('✅ 标记成功:', markResponse.data);
    console.log();

    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 测试2：获取课程的掌握状态
    console.log('测试2：获取课程的掌握状态');
    const getResponse = await axios.get(
      `${BASE_URL}/word-mastery/lesson/${lessonId}`,
      { headers }
    );
    console.log('✅ 获取成功:', getResponse.data);
    console.log();

    // 测试3：获取掌握统计
    console.log('测试3：获取掌握统计');
    const statsResponse = await axios.get(
      `${BASE_URL}/word-mastery/stats`,
      { headers }
    );
    console.log('✅ 统计成功:', statsResponse.data);
    console.log();

    // 测试4：获取课程掌握率
    console.log('测试4：获取课程掌握率');
    const rateResponse = await axios.get(
      `${BASE_URL}/word-mastery/lesson/${lessonId}/rate`,
      { headers }
    );
    console.log('✅ 掌握率:', rateResponse.data);
    console.log();

    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 测试5：取消掌握状态
    console.log('测试5：取消掌握状态');
    const unmarkResponse = await axios.delete(
      `${BASE_URL}/word-mastery/${wordId}`,
      { headers }
    );
    console.log('✅ 取消成功:', unmarkResponse.data);
    console.log();

    // 测试6：批量同步
    console.log('测试6：批量同步');
    const syncResponse = await axios.post(
      `${BASE_URL}/word-mastery/sync`,
      {
        masteryData: [
          { lessonId, wordId: 1 },
          { lessonId, wordId: 2 }
        ]
      },
      { headers }
    );
    console.log('✅ 同步成功:', syncResponse.data);
    console.log();

    console.log('所有测试通过！✅');

  } catch (error) {
    console.error('❌ 测试失败:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else {
      console.error('错误:', error.message);
    }
    process.exit(1);
  }
}

testWordMasteryAPI();
