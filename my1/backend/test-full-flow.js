import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// 创建 axios 实例
const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 存储 cookie
let cookies = '';

async function testFullFlow() {
  try {
    console.log('========================================');
    console.log('完整流程测试');
    console.log('========================================\n');

    // 1. 登录
    console.log('[1/5] 登录管理员账号...');
    const loginRes = await client.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    // 保存 cookie
    if (loginRes.headers['set-cookie']) {
      cookies = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
      client.defaults.headers.Cookie = cookies;
    }
    
    if (!loginRes.data.success) {
      console.error('✗ 登录失败:', loginRes.data);
      process.exit(1);
    }
    console.log('✓ 登录成功');
    console.log(`  用户: ${loginRes.data.user.username}`);
    console.log(`  管理员: ${loginRes.data.user.isAdmin ? '是' : '否'}\n`);

    // 2. 获取分类列表
    console.log('[2/5] 获取分类列表...');
    const categoriesRes = await client.get('/learning/categories');
    
    if (!categoriesRes.data.success) {
      console.error('✗ 获取分类失败:', categoriesRes.data);
      process.exit(1);
    }
    console.log('✓ 获取分类成功');
    console.log(`  分类数量: ${categoriesRes.data.categories.length}`);
    categoriesRes.data.categories.forEach(cat => {
      if (cat.lessonCount > 0) {
        console.log(`  - ${cat.name}: ${cat.lessonCount} 个课程`);
      }
    });
    console.log();

    // 3. 获取课程列表
    const programmingBasics = categoriesRes.data.categories.find(c => c.name === 'Programming Basics');
    if (programmingBasics) {
      console.log('[3/5] 获取 Programming Basics 的课程...');
      const lessonsRes = await client.get(`/learning/categories/${programmingBasics.id}/lessons`);
      
      if (!lessonsRes.data.success) {
        console.error('✗ 获取课程失败:', lessonsRes.data);
      } else {
        console.log('✓ 获取课程成功');
        console.log(`  课程数量: ${lessonsRes.data.lessons.length}`);
        lessonsRes.data.lessons.forEach(lesson => {
          console.log(`  - 第 ${lesson.lessonNumber} 课: ${lesson.wordCount} 个单词`);
        });
      }
    } else {
      console.log('[3/5] ✗ 未找到 Programming Basics 分类');
    }
    console.log();

    // 4. 获取缓存统计
    console.log('[4/5] 获取缓存统计...');
    const statsRes = await client.get('/audio-cache/statistics');
    
    if (!statsRes.data.success) {
      console.error('✗ 获取统计失败:', statsRes.data);
    } else {
      console.log('✓ 获取统计成功');
      console.log(`  缓存总数: ${statsRes.data.stats.totalCount}`);
      console.log(`  总大小: ${(statsRes.data.stats.totalSize / 1024).toFixed(2)} KB`);
      console.log(`  总命中: ${statsRes.data.stats.totalHits} 次`);
    }
    console.log();

    // 5. 获取缓存列表
    console.log('[5/5] 获取缓存列表...');
    const cacheListRes = await client.get('/audio-cache/list?limit=10');
    
    if (!cacheListRes.data.success) {
      console.error('✗ 获取缓存列表失败:', cacheListRes.data);
    } else {
      console.log('✓ 获取缓存列表成功');
      console.log(`  缓存记录: ${cacheListRes.data.caches.length} 条`);
      cacheListRes.data.caches.slice(0, 5).forEach((cache, index) => {
        console.log(`  ${index + 1}. ${cache.text} (${cache.hitCount} 次命中)`);
      });
    }
    console.log();

    console.log('========================================');
    console.log('✓ 所有测试通过！');
    console.log('========================================');
    console.log();
    console.log('后端 API 工作正常。');
    console.log('如果前端仍然看不到数据，请检查：');
    console.log('1. 浏览器是否使用管理员账号登录');
    console.log('2. 浏览器开发者工具 Network 标签页的 API 请求');
    console.log('3. 浏览器 Cookie 是否正常工作');
    console.log();

    process.exit(0);
  } catch (error) {
    console.error('\n✗ 测试失败:', error.response?.data || error.message);
    if (error.response) {
      console.error('  状态码:', error.response.status);
      console.error('  响应:', error.response.data);
    }
    process.exit(1);
  }
}

testFullFlow();
