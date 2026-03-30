import { sequelize } from './src/models/index.js';
import Category from './src/models/Category.js';
import Lesson from './src/models/Lesson.js';

async function checkAllCategories() {
  try {
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');

    // 获取所有分类及其课程数量
    const categories = await Category.findAll({
      include: [{
        model: Lesson,
        as: 'lessons',
        attributes: ['id', 'lesson_number']
      }],
      order: [['id', 'ASC']]
    });

    console.log('========================================');
    console.log('所有分类及课程统计');
    console.log('========================================\n');

    let totalCategories = 0;
    let categoriesWithLessons = 0;
    let categoriesWithoutLessons = 0;
    let totalLessons = 0;

    categories.forEach(category => {
      const lessonCount = category.lessons ? category.lessons.length : 0;
      totalCategories++;
      totalLessons += lessonCount;

      if (lessonCount > 0) {
        categoriesWithLessons++;
        console.log(`✓ ${category.name}`);
        console.log(`  ID: ${category.id}`);
        console.log(`  课程数: ${lessonCount}`);
        console.log(`  课程编号: ${category.lessons.map(l => l.lesson_number).join(', ')}`);
      } else {
        categoriesWithoutLessons++;
        console.log(`✗ ${category.name}`);
        console.log(`  ID: ${category.id}`);
        console.log(`  课程数: 0 (空分类)`);
      }
      console.log('');
    });

    console.log('========================================');
    console.log('统计汇总');
    console.log('========================================');
    console.log(`总分类数: ${totalCategories}`);
    console.log(`有课程的分类: ${categoriesWithLessons}`);
    console.log(`空分类: ${categoriesWithoutLessons}`);
    console.log(`总课程数: ${totalLessons}`);
    console.log('');

    if (categoriesWithoutLessons > 0) {
      console.log('========================================');
      console.log('建议');
      console.log('========================================');
      console.log('发现空分类！这些分类没有任何课程数据。');
      console.log('');
      console.log('选项 1: 删除空分类');
      console.log('  运行: node backend/delete-empty-categories.js');
      console.log('');
      console.log('选项 2: 为空分类导入课程数据');
      console.log('  需要准备对应的 JSON 数据文件');
      console.log('');
    }

    await sequelize.close();
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

checkAllCategories();
