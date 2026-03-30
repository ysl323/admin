import { sequelize } from './src/config/database.js';
import './src/models/index.js';

async function fixCategories() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 获取所有分类
    const categories = await sequelize.models.Category.findAll();
    console.log(`\n数据库中的分类:`);
    categories.forEach(cat => {
      console.log(`   - ID ${cat.id}: ${cat.name}`);
    });

    // 获取所有课程
    const lessons = await sequelize.models.Lesson.findAll();
    console.log(`\n找到 ${lessons.length} 个课程:`);
    
    // 按分类ID分组课程
    const lessonsByCategory = {};
    lessons.forEach(lesson => {
      if (!lessonsByCategory[lesson.categoryId]) {
        lessonsByCategory[lesson.categoryId] = [];
      }
      lessonsByCategory[lesson.categoryId].push(lesson);
    });

    // 检查每个分类ID
    const validCategoryIds = categories.map(c => c.id);
    const invalidCategoryIds = Object.keys(lessonsByCategory).filter(
      catId => !validCategoryIds.includes(parseInt(catId))
    );

    if (invalidCategoryIds.length > 0) {
      console.log(`\n⚠️  发现 ${invalidCategoryIds.length} 个无效的分类ID: ${invalidCategoryIds.join(', ')}`);
      
      // 使用第一个有效分类作为默认分类
      const defaultCategoryId = categories[0].id;
      console.log(`\n将所有无效分类的课程迁移到: ${categories[0].name} (ID: ${defaultCategoryId})`);
      
      for (const invalidCatId of invalidCategoryIds) {
        const lessonsToFix = lessonsByCategory[invalidCatId];
        console.log(`\n分类ID ${invalidCatId} 的课程:`);
        
        for (const lesson of lessonsToFix) {
          console.log(`   - 课程 ${lesson.id} (第${lesson.lessonNumber}课)`);
          console.log(`      修复: categoryId ${lesson.categoryId} -> ${defaultCategoryId}`);
          
          try {
            await lesson.update({ categoryId: defaultCategoryId });
            console.log(`      ✅ 修复成功`);
          } catch (error) {
            console.error(`      ❌ 修复失败: ${error.message}`);
          }
        }
      }
    } else {
      console.log('\n✅ 所有课程的分类ID都有效!');
    }

    // 显示修复后的结果
    console.log('\n修复后的课程列表:');
    const updatedLessons = await sequelize.models.Lesson.findAll({
      include: [{
        model: sequelize.models.Category,
        as: 'category',
        attributes: ['name']
      }]
    });

    updatedLessons.forEach(lesson => {
      const catName = lesson.category ? lesson.category.name : '无';
      console.log(`   - 课程 ${lesson.id} (第${lesson.lessonNumber}课) -> ${catName}`);
    });

    console.log('\n✅ 修复完成!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixCategories();
