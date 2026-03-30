import axios from 'axios';
import { AudioCache } from './src/models/index.js';

async function testExportWithAuth() {
  try {
    console.log('========================================');
    console.log('完整导出功能测试');
    console.log('========================================\n');

    // 测试1: 数据库查询
    console.log('测试1: 数据库查询');
    console.log('----------------------------------------');
    const caches = await AudioCache.findAll({
      attributes: ['text', 'provider', 'voiceType', 'cacheKey', 'filePath', 'fileSize'],
      order: [['createdAt', 'DESC']]
    });
    console.log(`✓ 数据库查询成功: ${caches.length} 条记录\n`);

    // 测试2: 直接HTTP请求（不带认证）
    console.log('测试2: 直接HTTP请求（不带认证）');
    console.log('----------------------------------------');
    try {
      const response = await axios.get('http://localhost:3000/api/audio-cache/export', {
        timeout: 5000
      });
      console.log('✓ 请求成功（不需要认证？）');
      console.log(`  返回数据: ${response.data.count} 条记录\n`);
    } catch (error) {
      if (error.response) {
        console.log(`✗ 请求失败: ${error.response.status} ${error.response.statusText}`);
        console.log(`  错误信息: ${JSON.stringify(error.response.data)}`);
        if (error.response.status === 401) {
          console.log('  → 这是正常的，导出需要管理员权限\n');
        } else if (error.response.status === 500) {
          console.log('  → 这是问题所在！后端返回500错误');
          console.log('  → 请检查后端控制台的错误日志\n');
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log('✗ 无法连接到后端服务器');
        console.log('  → 请确认后端服务正在运行在端口3000\n');
      } else {
        console.log(`✗ 请求失败: ${error.message}\n`);
      }
    }

    // 测试3: 检查路由注册
    console.log('测试3: 检查路由注册');
    console.log('----------------------------------------');
    try {
      const healthCheck = await axios.get('http://localhost:3000/health', {
        timeout: 5000
      });
      console.log('✓ 后端服务正常运行');
      console.log(`  时间戳: ${healthCheck.data.timestamp}\n`);
    } catch (error) {
      console.log('✗ 后端服务未运行或无法访问\n');
    }

    console.log('========================================');
    console.log('诊断建议:');
    console.log('========================================');
    console.log('1. 如果看到"无法连接到后端服务器":');
    console.log('   → 启动后端: cd my1\\backend && npm start');
    console.log('');
    console.log('2. 如果看到"500错误":');
    console.log('   → 后端代码有问题，需要查看后端控制台的错误日志');
    console.log('   → 确保已经重启后端服务');
    console.log('');
    console.log('3. 如果看到"401错误":');
    console.log('   → 这是正常的，说明路由工作正常');
    console.log('   → 问题可能在前端的认证状态');
    console.log('');
    console.log('4. 如果数据库查询成功但HTTP请求失败:');
    console.log('   → 检查路由是否正确注册在 src/index.js');
    console.log('   → 检查中间件是否有问题');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
    console.error('错误堆栈:', error.stack);
  }

  process.exit(0);
}

testExportWithAuth();
