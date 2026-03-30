/**
 * 测试单词 API
 * 检查 /api/admin/words 接口是否正常工作
 */

import AdminService from './src/services/AdminService.js';
import { sequelize } from './src/models/index.js';

async function testWordsAPI() {
  try {
    console.log('=== 测试单词 API ===\n');
    
    // 测试数据库连接
    console.log('1. 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');
    
    // 测试获取所有单词
    console.log('2. 测试获取所有单词...');
    const words = await AdminService.getAllWords();
    console.log(`✓ 成功获取 ${words.length} 个单词\n`);
    
    // 显示前 5 个单词
    console.log('3. 前 5 个单词示例:');
    words.slice(0, 5).forEach(word => {
      console.log(`  - ID: ${word.id}`);
      console.log(`    英文: ${word.english}`);
      console.log(`    中文: ${word.chinese}`);
      console.log(`    课程ID: ${word.lessonId}`);
      console.log(`    课程信息: ${word.lessonInfo}`);
      console.log(`    分类: ${word.categoryName}`);
      console.log(`    课程编号: ${word.lessonNumber}`);
      console.log('');
    });
    
    // 检查是否有孤立的单词（没有关联课程的）
    console.log('4. 检查孤立单词...');
    const orphanWords = words.filter(w => !w.lessonId || w.lessonInfo === '未知课程');
    if (orphanWords.length > 0) {
      console.log(`⚠ 发现 ${orphanWords.length} 个孤立单词（没有关联课程）:`);
      orphanWords.forEach(word => {
        console.log(`  - ID: ${word.id}, 英文: ${word.english}, 课程ID: ${word.lessonId}`);
      });
    } else {
      console.log('✓ 没有孤立单词');
    }
    
    console.log('\n=== 测试完成 ===');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ 测试失败:');
    console.error('错误信息:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  }
}

testWordsAPI();
