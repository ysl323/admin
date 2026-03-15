/**
 * 测试API修复
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// 测试用的token（需要先登录获取真实token）
const TEST_TOKEN = 'test-token';

async function testCategoryCount() {
  console.log('\n========================================');
  console.log('1. 测试课程数量显示');
  console.log('========================================');
  
  try {
    const response = await axios.get(`${BASE_URL}/learning/categories`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('✅ API调用成功');
    console.log('分类列表:', JSON.stringify(response.data, null, 2));
    
    if (response.data.categories && response.data.categories.length > 0) {
      const hasLessonCount = response.data.categories.every(cat => 
        cat.hasOwnProperty('lessonCount')
      );
      
      if (hasLessonCount) {
        console.log('✅ 所有分类都包含 lessonCount 字段');
      } else {
        console.log('❌ 部分分类缺少 lessonCount 字段');
      }
    }
  } catch (error) {
    console.log('❌ API调用失败:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
  }
}

async function testTTSSpeak() {
  console.log('\n========================================');
  console.log('2. 测试TTS播放');
  console.log('========================================');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/tts/speak`,
      { text: 'Hello' },
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        responseType: 'arraybuffer'
      }
    );
    
    console.log('✅ TTS API调用成功');
    console.log('响应类型:', response.headers['content-type']);
    console.log('音频大小:', response.data.length, 'bytes');
    
    if (response.data.length > 0) {
      console.log('✅ 成功获取音频数据');
    } else {
      console.log('❌ 音频数据为空');
    }
  } catch (error) {
    console.log('❌ TTS API调用失败:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
  }
}

async function testAdminAPIs() {
  console.log('\n========================================');
  console.log('3. 测试后台管理API');
  console.log('========================================');
  
  try {
    // 测试获取分类
    const categoriesResponse = await axios.get(`${BASE_URL}/admin/categories`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('✅ 获取分类API成功');
    console.log('分类数量:', categoriesResponse.data.categories?.length || 0);
    
    // 测试获取课程
    const lessonsResponse = await axios.get(`${BASE_URL}/admin/lessons`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('✅ 获取课程API成功');
    console.log('课程数量:', lessonsResponse.data.lessons?.length || 0);
    
    // 测试获取单词
    const wordsResponse = await axios.get(`${BASE_URL}/admin/words`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    console.log('✅ 获取单词API成功');
    console.log('单词数量:', wordsResponse.data.words?.length || 0);
    
  } catch (error) {
    console.log('❌ 后台管理API调用失败:', error.message);
    if (error.response) {
      console.log('响应状态:', error.response.status);
      console.log('响应数据:', error.response.data);
    }
  }
}

async function runTests() {
  console.log('开始测试API修复...\n');
  
  await testCategoryCount();
  await testTTSSpeak();
  await testAdminAPIs();
  
  console.log('\n========================================');
  console.log('测试完成！');
  console.log('========================================\n');
}

runTests().catch(console.error);
