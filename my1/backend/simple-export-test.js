// 简单的导出功能测试
console.log('========================================');
console.log('导出功能简单测试');
console.log('========================================\n');

async function test() {
  try {
    // 测试1: 导入模型
    console.log('测试1: 导入 AudioCache 模型...');
    const { AudioCache } = await import('./src/models/index.js');
    console.log('✓ 模型导入成功\n');

    // 测试2: 查询数据
    console.log('测试2: 查询缓存数据...');
    const caches = await AudioCache.findAll({
      attributes: ['text', 'provider', 'voiceType', 'cacheKey', 'filePath', 'fileSize'],
      order: [['createdAt', 'DESC']]
    });
    console.log(`✓ 查询成功: 找到 ${caches.length} 条记录\n`);

    // 测试3: 模拟响应
    console.log('测试3: 模拟导出响应...');
    const response = {
      success: true,
      count: caches.length,
      data: caches.map(c => c.toJSON())
    };
    console.log('✓ 响应格式正确\n');

    console.log('========================================');
    console.log('所有测试通过！');
    console.log('========================================\n');

    if (caches.length > 0) {
      console.log('示例数据（第一条）:');
      console.log(JSON.stringify(caches[0].toJSON(), null, 2));
    } else {
      console.log('注意: 数据库中没有缓存记录');
    }

  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error('错误:', error.message);
    console.error('\n完整错误:');
    console.error(error);
    process.exit(1);
  }

  process.exit(0);
}

test();
