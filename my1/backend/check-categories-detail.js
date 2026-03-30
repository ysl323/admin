/**
 * 详细检查分类、课程、单词的关联
 */

import { Category, Lesson, Word } from './src/models/index.js';
import { sequelize } from './src/models/index.js';

async function checkCategoriesDetail() {
  try {
    console.log('=== 详细检查数据关联 ===\n');
    
    // 1. 检查所有分类
    console.log('1. 所有分类:');
    const categories = await Category.findAll();
    console.log(`找到 ${categories.length} 个分类:`);
    categories.forEach(cat => {
      console.log(`  - ID: ${cat.id}, 名称: ${cat.name}`);
    });
    console.log('');
    
    // 2. 检查所有课程（带分类ID）
    console.log('2. 所有课程:');
    const lessons = await Lesson.findAll({
      attributes: ['id', 'lessonNumber', 'categoryId']
    });
    console.log(`找到 ${lessons.length} 个课程:`);
    lessons.forEach(lesson => {
      const category = categories.find(c => c.id === lesson.categoryId);
      const catName = category ? category.name : `未找到(ID:${lesson.categoryId})`;
      console.log(`  - 课程 ID: ${lesson.id}, 编号: ${lesson.lessonNumber}, 分类ID: ${lesson.categoryId}, 分类名: ${catName}`);
    });
    console.log('');
    
    // 3. 测试 Sequelize 关联查询
    console.log('3. 测试 Sequelize 关联查询:');
    const lessonsWithCategory = await Lesson.findAll({
      include: [{
        model: Category,
        as: 'category',
        required: false
      }]
    });
    
    console.log('关联查询结果:');
    lessonsWithCategory.forEach(lesson => {
      console.log(`  - 课程 ID: ${lesson.id}, 分类对象: ${lesson.category ? `存在(${lesson.category.name})` : '不存在'}`);
    });
    console.log('');
    
    // 4. 测试单词关联查询
    console.log('4. 测试单词关联查询（前5个）:');
    const wordsWithRelations = await Word.findAll({
      limit: 5,
      include: [{
        model: Lesson,
        as: 'lesson',
        required: false,
        include: [{
          model: Category,
          as: 'category',
          required: false
        }]
      }]
    });
    
    wordsWithRelations.forEach(word => {
      console.log(`  - 单词 ID: ${word.id}, 英文: ${word.english}`);
      console.log(`    课程ID: ${word.lessonId}`);
      console.log(`    lesson对象: ${word.lesson ? '存在' : '不存在'}`);
      if (word.lesson) {
        console.log(`    lesson.categoryId: ${word.lesson.categoryId}`);
        console.log(`    lesson.category对象: ${word.lesson.category ? '存在' : '不存在'}`);
        if (word.lesson.category) {
          console.log(`    分类名称: ${word.lesson.category.name}`);
        }
      }
      console.log('');
    });
    
    console.log('=== 检查完成 ===');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ 检查失败:');
    console.error('错误:', error.message);
    console.error('堆栈:', error.stack);
    process.exit(1);
  }
}

checkCategoriesDetail();
