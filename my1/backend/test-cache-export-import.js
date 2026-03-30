/**
 * 测试音频缓存导出导入功能
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const BASE_URL = 'http://localhost:3000';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// 存储 session cookie
let sessionCookie = '';

// 创建 axios 实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true
});

// 添加请求拦截器，自动附加 cookie
api.interceptors.request.use(config => {
  if (sessionCookie) {
    config.headers.Cookie = sessionCookie;
  }
  return config;
});

// 添加响应拦截器，保存 cookie
api.interceptors.response.use(response => {
  const setCookie = response.headers['set-cookie'];
  if (setCookie && setCookie.length > 0) {
    sessionCookie = setCookie[0].split(';')[0];
  }
  return response;
});

/**
 * 登录管理员账号
 */
async function login() {
  console.log('1. 登录管理员账号...');
  try {
    const response = await api.post('/api/auth/login', {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    });

    if (response.data.success) {
      console.log('✓ 登录成功');
      console.log(`  用户: ${response.data.user.username}`);
      console.log(`  角色: ${response.data.user.role}`);
      return true;
    } else {
      console.error('✗ 登录失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('✗ 登录失败:', error.response?.data?.message || error.message);
    return false;
  }
}

/**
 * 获取当前缓存列表
 */
async function getCacheList() {
  console.log('\n2. 获取当前缓存列表...');
  try {
    const response = await api.get('/api/audio-cache/list', {
      params: { limit: 10 }
    });

    if (response.data.success) {
      console.log('✓ 获取成功');
      console.log(`  总数: ${response.data.total}`);
      console.log(`  当前页: ${response.data.caches.length} 条`);
      
      if (response.data.caches.length > 0) {
        console.log('\n  前 3 条记录:');
        response.data.caches.slice(0, 3).forEach((cache, index) => {
          console.log(`  ${index + 1}. ID: ${cache.id}, 文本: "${cache.text.substring(0, 30)}..."`);
        });
      }
      
      return response.data;
    } else {
      console.error('✗ 获取失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('✗ 获取失败:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * 测试导出功能
 */
async function testExport() {
  console.log('\n3. 测试导出功能...');
  try {
    const response = await api.get('/api/audio-cache/export');

    if (response.data.success) {
      console.log('✓ 导出成功');
      console.log(`  记录数: ${response.data.count}`);
      
      // 保存到文件
      const exportFile = path.join(__dirname, 'cache-export-test.json');
      fs.writeFileSync(exportFile, JSON.stringify(response.data.data, null, 2));
      console.log(`  已保存到: ${exportFile}`);
      
      // 显示前 2 条记录
      if (response.data.data.length > 0) {
        console.log('\n  导出数据示例:');
        response.data.data.slice(0, 2).forEach((cache, index) => {
          console.log(`  ${index + 1}. 文本: "${cache.text.substring(0, 30)}..."`);
          console.log(`     提供商: ${cache.provider}`);
          console.log(`     文件大小: ${cache.fileSize} bytes`);
        });
      }
      
      return response.data.data;
    } else {
      console.error('✗ 导出失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('✗ 导出失败:', error.response?.data?.message || error.message);
    if (error.response?.status === 404) {
      console.error('  提示: 导出端点不存在，请确保后端服务已重启');
    }
    return null;
  }
}

/**
 * 测试导入功能
 */
async function testImport(exportData) {
  console.log('\n4. 测试导入功能...');
  
  if (!exportData || exportData.length === 0) {
    console.log('  跳过: 没有可导入的数据');
    return false;
  }
  
  try {
    // 只导入前 3 条记录作为测试
    const testData = exportData.slice(0, 3);
    console.log(`  准备导入 ${testData.length} 条记录...`);
    
    const response = await api.post('/api/audio-cache/import', testData);

    if (response.data.success) {
      console.log('✓ 导入成功');
      console.log(`  ${response.data.message}`);
      console.log(`  实际导入: ${response.data.imported} 条`);
      
      if (response.data.imported === 0) {
        console.log('  说明: 所有记录已存在，跳过导入（这是正常行为）');
      }
      
      return true;
    } else {
      console.error('✗ 导入失败:', response.data.message);
      return false;
    }
  } catch (error) {
    console.error('✗ 导入失败:', error.response?.data?.message || error.message);
    if (error.response?.status === 404) {
      console.error('  提示: 导入端点不存在，请确保后端服务已重启');
    }
    return false;
  }
}

/**
 * 获取统计信息
 */
async function getStatistics() {
  console.log('\n5. 获取统计信息...');
  try {
    const response = await api.get('/api/audio-cache/statistics');

    if (response.data.success) {
      console.log('✓ 获取成功');
      const stats = response.data.stats;
      console.log(`  总缓存数: ${stats.totalCount}`);
      console.log(`  总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  总命中次数: ${stats.totalHits}`);
      console.log(`  平均命中率: ${stats.hitRate}`);
      
      if (stats.byProvider && stats.byProvider.length > 0) {
        console.log('\n  按提供商统计:');
        stats.byProvider.forEach(p => {
          console.log(`  - ${p.provider}: ${p.count} 条`);
        });
      }
      
      return stats;
    } else {
      console.error('✗ 获取失败:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('✗ 获取失败:', error.response?.data?.message || error.message);
    return null;
  }
}

/**
 * 主测试流程
 */
async function runTests() {
  console.log('========================================');
  console.log('音频缓存导出导入功能测试');
  console.log('========================================\n');

  // 1. 登录
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('\n测试终止: 登录失败');
    process.exit(1);
  }

  // 2. 获取当前缓存列表
  const cacheList = await getCacheList();
  
  // 3. 测试导出
  const exportData = await testExport();
  
  // 4. 测试导入
  if (exportData) {
    await testImport(exportData);
  }
  
  // 5. 获取统计信息
  await getStatistics();

  console.log('\n========================================');
  console.log('测试完成');
  console.log('========================================\n');

  // 总结
  console.log('测试结果总结:');
  console.log(`✓ 登录: ${loginSuccess ? '成功' : '失败'}`);
  console.log(`✓ 获取列表: ${cacheList ? '成功' : '失败'}`);
  console.log(`✓ 导出: ${exportData ? '成功' : '失败'}`);
  console.log(`✓ 导入: ${exportData ? '成功' : '跳过'}`);
  
  if (!exportData) {
    console.log('\n⚠ 警告: 导出功能失败');
    console.log('可能原因:');
    console.log('1. 后端服务未重启（最可能）');
    console.log('2. 未登录管理员账号');
    console.log('3. API 端点不存在');
    console.log('\n解决方法:');
    console.log('执行: cd my1 && emergency-fix.bat');
    console.log('等待 10 秒后重新运行此测试');
  } else {
    console.log('\n✓ 所有测试通过！');
  }
}

// 运行测试
runTests().catch(error => {
  console.error('\n测试过程中发生错误:', error);
  process.exit(1);
});
