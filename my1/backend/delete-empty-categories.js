import { sequelize } from './src/models/index.js';
import Category from './src/models/Category.js';
import Lesson from './src/models/Lesson.js';

async function deleteEmptyCategories() {
  try {
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');

    // 获取所有分类及其课程数量
    const categories = await Category.findAll({
      include: [{
        model: Lesson,
        as: 'lessons',
        attributes: ['id']
      }]
    });

    console.log('========================================');
    console.log('检查空分类');
    console.log('========================================\n');

    const emptyCategories = [];
    const categoriesWithLessons = [];

    categories.forEach(category => {
      const lessonCount = category.lessons ? category.lessons.length : 0;
      if (lessonCount === 0) {
        emptyCategories.push(category);
        console.log(`✗ 空分类: ${category.name} (ID: ${category.id})`);
      } else {
        categoriesWithLessons.push(category);
        console.log(`✓ 保留: ${category.name} (ID: ${category.id}, ${lessonCount} 个课程)`);
      }
    });

    console.log('');
    console.log('========================================');
    console.log('统计');
    console.log('========================================');
    console.log(`总分类数: ${categories.length}`);
    console.log(`有课程的分类: ${categoriesWithLessons.length}`);
    console.log(`空分类: ${emptyCategories.length}`);
    console.log('');

    if (emptyCategories.length === 0) {
      console.log('✓ 没有空分类需要删除');
      await sequelize.close();
      return;
    }

    console.log('========================================');
    console.log('删除空分类');
    console.log('========================================\n');

    for (const category of emptyCategories) {
      await category.destroy();
      console.log(`✓ 已删除: ${category.name} (ID: ${category.id})`);
    }

    console.log('');
    console.log('========================================');
    console.log('完成');
    console.log('========================================');
    console.log(`✓ 成功删除 ${emptyCategories.length} 个空分类`);
    console.log(`✓ 保留 ${categoriesWithLessons.length} 个有课程的分类`);
    console.log('');
    console.log('剩余分类:');
    categoriesWithLessons.forEach(cat => {
      const lessonCount = cat.lessons ? cat.lessons.length : 0;
      console.log(`  - ${cat.name}: ${lessonCount} 个课程`);
    });
    console.log('');

    await sequelize.close();
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

deleteEmptyCategories();
