import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function testCacheAPI() {
  try {
    console.log('1. 登录管理员账号...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (!loginRes.data.success) {
      console.error('登录失败:', loginRes.data);
      process.exit(1);
    }
    
    const token = loginRes.data.token;
    console.log('✓ 登录成功\n');
    
    console.log('2. 获取缓存列表...');
    const listRes = await axios.get(`${BASE_URL}/audio-cache/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('响应状态:', listRes.status);
    console.log('响应数据:', JSON.stringify(listRes.data, null, 2));
    
    if (listRes.data.success) {
      console.log(`\n✓ 成功获取 ${listRes.data.caches.length} 条缓存记录`);
    } else {
      console.log('\n✗ 获取缓存列表失败');
    }
    
    console.log('\n3. 获取缓存统计...');
    const statsRes = await axios.get(`${BASE_URL}/audio-cache/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('统计数据:', JSON.stringify(statsRes.data, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
    process.exit(1);
  }
}

testCacheAPI();
