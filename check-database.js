import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function checkDatabase() {
  try {
    console.log('='.repeat(80));
    console.log('数据库诊断工具');
    console.log('='.repeat(80));
    console.log('');
    
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    console.log('');
    
    // 检查表是否存在
    console.log('📊 检查数据表...');
    console.log('-'.repeat(80));
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log(`数据库包含 ${tables.length} 个表: ${tables.join(', ')}`);
    console.log('');
    
    // 检查用户
    const [users] = await sequelize.query('SELECT COUNT(*) as total FROM users');
    console.log(`👤 用户数: ${users[0].total}`);
    
    // 检查分类
    const [categories] = await sequelize.query('SELECT COUNT(*) as total FROM categories');
    console.log(`📁 分类数: ${categories[0].total}`);
    
    // 检查课程
    const [lessons] = await sequelize.query('SELECT COUNT(*) as total FROM lessons');
    console.log(`📚 课程数: ${lessons[0].total}`);
    
    // 检查单词
    const [words] = await sequelize.query('SELECT COUNT(*) as total FROM words');
    console.log(`📖 单词数: ${words[0].total}`);
    console.log('');
    
    // 详细信息
    if (categories[0].total > 0) {
      const [catList] = await sequelize.query('SELECT id, name FROM categories ORDER BY id');
      console.log('📁 分类详情:');
      for (const cat of catList) {
        const [lessonCount] = await sequelize.query(
          'SELECT COUNT(*) as total FROM lessons WHERE category_id = ?',
          { replacements: [cat.id] }
        );
        console.log(`  - ${cat.id}: ${cat.name} (${lessonCount[0].total} 个课程)`);
        
        // 获取该分类下的课程
        const [lessonList] = await sequelize.query(
          'SELECT id, lesson_number FROM lessons WHERE category_id = ? ORDER BY lesson_number',
          { replacements: [cat.id] }
        );
        
        for (const lesson of lessonList) {
          const [wordCount] = await sequelize.query(
            'SELECT COUNT(*) as total FROM words WHERE lesson_id = ?',
            { replacements: [lesson.id] }
          );
          console.log(`    课程 ${lesson.lesson_number}: ${wordCount[0].total} 个单词`);
        }
      }
      console.log('');
    }
    
    // 诊断结论
    console.log('='.repeat(80));
    console.log('📋 诊断结论');
    console.log('='.repeat(80));
    
    if (categories[0].total === 0 && lessons[0].total === 0) {
      console.log('');
      console.log('❌ 问题确认：数据库中没有课程数据！');
      console.log('');
      console.log('可能的原因：');
      console.log('1. 数据库文件被替换或清空');
      console.log('2. 数据库同步使用了 alter: true 或 force: true');
      console.log('3. 数据导入失败');
      console.log('');
      console.log('建议的解决方案：');
      console.log('1. 检查是否有备份文件');
      console.log('2. 使用管理后台重新导入课程数据');
      console.log('3. 运行恢复脚本: node restore-lessons.js');
      console.log('');
    } else {
      console.log('');
      console.log('✅ 数据库包含课程数据！');
      console.log('');
      console.log('如果仍然看不到课程，可能的原因：');
      console.log('1. 前端缓存问题 - 请刷新浏览器 (Ctrl+F5)');
      console.log('2. 前端API调用失败 - 请检查浏览器控制台错误');
      console.log('3. 权限问题 - 请确认已登录');
      console.log('4. 后端服务未启动 - 请检查后端是否在运行');
      console.log('');
    }
    
    console.log('='.repeat(80));
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ 数据库诊断失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDatabase();
