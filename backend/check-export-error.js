/**
 * 直接测试导出功能,查看详细错误
 */

import('../models/index.js').then(async ({ AudioCache }) => {
  try {
    console.log('测试导出功能...\n');
    
    console.log('1. 查询数据库...');
    const caches = await AudioCache.findAll({
      attributes: ['text', 'provider', 'voiceType', 'cacheKey', 'filePath', 'fileSize'],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`✓ 查询成功,找到 ${caches.length} 条记录\n`);
    
    if (caches.length > 0) {
      console.log('前 3 条记录:');
      caches.slice(0, 3).forEach((cache, index) => {
        console.log(`${index + 1}. ${cache.text.substring(0, 30)}...`);
      });
    }
    
    console.log('\n2. 测试 JSON 序列化...');
    const jsonData = JSON.stringify(caches, null, 2);
    console.log(`✓ 序列化成功,大小: ${jsonData.length} 字节\n`);
    
    console.log('✓ 导出功能测试通过!');
    process.exit(0);
    
  } catch (error) {
    console.error('✗ 测试失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}).catch(error => {
  console.error('✗ 导入模型失败:');
  console.error('错误信息:', error.message);
  console.error('错误堆栈:', error.stack);
  process.exit(1);
});
