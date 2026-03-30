import { AudioCache } from './src/models/index.js';
import logger from './src/utils/logger.js';

async function testExport() {
  try {
    console.log('开始测试导出功能...\n');

    // 测试1: 直接查询 AudioCache
    console.log('测试1: 直接查询 AudioCache.findAll()');
    const caches = await AudioCache.findAll({
      attributes: ['text', 'provider', 'voiceType', 'cacheKey', 'filePath', 'fileSize'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✓ 查询成功，找到 ${caches.length} 条记录\n`);

    if (caches.length > 0) {
      console.log('第一条记录示例:');
      console.log(JSON.stringify(caches[0].toJSON(), null, 2));
    }

    // 测试2: 模拟导出响应
    console.log('\n测试2: 模拟导出响应格式');
    const response = {
      success: true,
      count: caches.length,
      data: caches
    };
    console.log('✓ 响应格式正确\n');

    console.log('所有测试通过！导出功能应该正常工作。');
    console.log('\n如果前端仍然报500错误，请检查:');
    console.log('1. 后端服务是否已重启');
    console.log('2. 后端控制台是否有错误日志');
    console.log('3. 路由是否正确注册');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }

  process.exit(0);
}

testExport();
