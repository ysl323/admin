import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// 创建一个 axios 实例，启用 cookie 支持
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 重要：启用 cookie
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testCacheAPI() {
  try {
    console.log('1. 登录管理员账号...');
    const loginRes = await api.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (!loginRes.data.success) {
      console.error('登录失败:', loginRes.data);
      process.exit(1);
    }
    
    console.log('✓ 登录成功\n');
    
    console.log('2. 获取缓存列表...');
    const listRes = await api.get('/audio-cache/list');
    
    console.log('响应状态:', listRes.status);
    console.log('响应数据:', JSON.stringify(listRes.data, null, 2));
    
    if (listRes.data.success) {
      console.log(`\n✓ 成功获取 ${listRes.data.caches.length} 条缓存记录`);
      
      if (listRes.data.caches.length > 0) {
        console.log('\n缓存记录详情:');
        listRes.data.caches.forEach((cache, index) => {
          console.log(`\n${index + 1}. ID: ${cache.id}`);
          console.log(`   文本: ${cache.text}`);
          console.log(`   文件: ${cache.filePath}`);
          console.log(`   大小: ${cache.fileSize} 字节`);
          console.log(`   命中: ${cache.hitCount} 次`);
        });
      }
    } else {
      console.log('\n✗ 获取缓存列表失败');
    }
    
    console.log('\n3. 获取缓存统计...');
    const statsRes = await api.get('/audio-cache/statistics');
    
    console.log('统计数据:', JSON.stringify(statsRes.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCacheAPI();
