import fetch from 'node-fetch';

/**
 * 测试音频缓存 API
 */

const BASE_URL = 'http://localhost:3000/api';

// 测试用的管理员 token（需要先登录获取）
let authToken = '';

async function login() {
  console.log('1. 登录管理员账号...');
  
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    authToken = data.token;
    console.log('✅ 登录成功');
    console.log(`Token: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    console.log('❌ 登录失败:', data.message);
    return false;
  }
}

async function getStatistics() {
  console.log('\n2. 获取缓存统计信息...');
  
  const response = await fetch(`${BASE_URL}/audio-cache/statistics`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('✅ 统计信息获取成功:');
    console.log(`   - 缓存总数: ${data.stats.totalCount}`);
    console.log(`   - 总大小: ${data.stats.totalSize} 字节`);
    console.log(`   - 总命中次数: ${data.stats.totalHits}`);
    console.log(`   - 平均大小: ${data.stats.averageSize} 字节`);
    console.log(`   - 命中率: ${data.stats.hitRate}`);
    return true;
  } else {
    console.log('❌ 获取统计信息失败:', data.message);
    return false;
  }
}

async function listCaches() {
  console.log('\n3. 获取缓存列表...');
  
  const response = await fetch(`${BASE_URL}/audio-cache/list?limit=5`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('✅ 缓存列表获取成功:');
    console.log(`   - 总数: ${data.total}`);
    console.log(`   - 当前显示: ${data.caches.length} 条`);
    
    if (data.caches.length > 0) {
      console.log('\n   前 5 条缓存:');
      data.caches.forEach((cache, index) => {
        console.log(`   ${index + 1}. ${cache.text.substring(0, 30)}...`);
        console.log(`      - ID: ${cache.id}`);
        console.log(`      - 提供商: ${cache.provider}`);
        console.log(`      - 大小: ${cache.fileSize} 字节`);
        console.log(`      - 命中次数: ${cache.hitCount}`);
        console.log(`      - 创建时间: ${cache.createdAt}`);
      });
    } else {
      console.log('   （暂无缓存）');
    }
    
    return true;
  } else {
    console.log('❌ 获取缓存列表失败:', data.message);
    return false;
  }
}

async function testTTS() {
  console.log('\n4. 测试 TTS 音频生成（会自动缓存）...');
  
  const testText = 'Hello, this is a test.';
  
  console.log(`   测试文本: "${testText}"`);
  
  // 第一次调用（应该缓存未命中）
  console.log('\n   第一次调用（应该调用 API）...');
  const start1 = Date.now();
  
  const response1 = await fetch(`${BASE_URL}/tts/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      text: testText
    })
  });

  const time1 = Date.now() - start1;
  
  if (response1.ok) {
    const audioBuffer = await response1.arrayBuffer();
    console.log(`   ✅ 音频生成成功 (${audioBuffer.byteLength} 字节, 耗时 ${time1}ms)`);
  } else {
    console.log(`   ❌ 音频生成失败: ${response1.status}`);
    return false;
  }

  // 第二次调用（应该缓存命中）
  console.log('\n   第二次调用（应该使用缓存）...');
  const start2 = Date.now();
  
  const response2 = await fetch(`${BASE_URL}/tts/synthesize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      text: testText
    })
  });

  const time2 = Date.now() - start2;
  
  if (response2.ok) {
    const audioBuffer = await response2.arrayBuffer();
    console.log(`   ✅ 音频获取成功 (${audioBuffer.byteLength} 字节, 耗时 ${time2}ms)`);
    
    // 比较性能
    console.log(`\n   性能对比:`);
    console.log(`   - 首次调用: ${time1}ms`);
    console.log(`   - 缓存命中: ${time2}ms`);
    console.log(`   - 速度提升: ${(time1 / time2).toFixed(1)}x`);
    
    return true;
  } else {
    console.log(`   ❌ 音频获取失败: ${response2.status}`);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('音频缓存 API 测试');
  console.log('========================================\n');

  try {
    // 1. 登录
    const loginSuccess = await login();
    if (!loginSuccess) {
      console.log('\n❌ 测试失败：无法登录');
      return;
    }

    // 2. 获取统计信息
    await getStatistics();

    // 3. 获取缓存列表
    await listCaches();

    // 4. 测试 TTS（会自动缓存）
    await testTTS();

    // 5. 再次获取统计信息（应该有变化）
    console.log('\n5. 再次获取统计信息（应该有新缓存）...');
    await getStatistics();

    console.log('\n========================================');
    console.log('✅ 所有测试完成！');
    console.log('========================================');
    
  } catch (error) {
    console.error('\n❌ 测试过程中出错:', error.message);
  }
}

main();
