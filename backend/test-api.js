import fetch from 'node-fetch';

async function testAPI() {
  try {
    // 测试分类接口
    console.log('测试 /api/learning/categories...');
    const categoriesRes = await fetch('http://localhost:3000/api/learning/categories');
    const categories = await categoriesRes.json();
    console.log('响应:', JSON.stringify(categories, null, 2));

    // 测试课程接口
    console.log('\n测试 /api/learning/categories/10/lessons...');
    const lessonsRes = await fetch('http://localhost:3000/api/learning/categories/10/lessons');
    const lessons = await lessonsRes.json();
    console.log('响应:', JSON.stringify(lessons, null, 2));

  } catch (error) {
    console.error('错误:', error.message);
  }
}

testAPI();
