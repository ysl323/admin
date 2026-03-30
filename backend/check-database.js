import { sequelize, Category, Lesson, Word } from './src/models/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('='.repeat(60));
    console.log('检查数据库状态');
    console.log('='.repeat(60));
    
    // 测试连接
    await sequelize.authenticate();
    console.log('\n✅ 数据库连接成功');
    
    // 检查分类
    const categories = await Category.findAll();
    console.log(`\n📁 分类数量: ${categories.length}`);
    if (categories.length > 0) {
      console.log('分类列表:');
      categories.forEach(cat => {
        console.log(`  - ID: ${cat.id}, 名称: ${cat.name}`);
      });
    }
    
    // 检查课程
    const lessons = await Lesson.findAll();
    console.log(`\n📚 课程数量: ${lessons.length}`);
    if (lessons.length > 0) {
      console.log('课程列表:');
      lessons.forEach(lesson => {
        console.log(`  - ID: ${lesson.id}, 分类ID: ${lesson.categoryId}, 课程号: ${lesson.lessonNumber}`);
      });
    }
    
    // 检查单词
    const words = await Word.findAll();
    console.log(`\n📖 单词数量: ${words.length}`);
    if (words.length > 0 && words.length <= 5) {
      console.log('单词列表:');
      words.forEach(word => {
        console.log(`  - ID: ${word.id}, 课程ID: ${word.lessonId}, ${word.english} - ${word.chinese}`);
      });
    } else if (words.length > 5) {
      console.log(`(只显示前5个单词)`);
      words.slice(0, 5).forEach(word => {
        console.log(`  - ID: ${word.id}, 课程ID: ${word.lessonId}, ${word.english} - ${word.chinese}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('❌ 数据库检查失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
