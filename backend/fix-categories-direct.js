import { sequelize } from './src/config/database.js';
import './src/models/index.js';

async function fixCategoriesDirectly() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 直接使用SQL更新（使用snake_case列名）
    console.log('\n修复课程1-3的分类ID...');
    const [results] = await sequelize.query(
      "UPDATE lessons SET category_id = 10 WHERE category_id = 5"
    );
    console.log(`✅ 更新了 ${results} 条记录`);

    // 显示修复后的结果
    console.log('\n修复后的课程列表:');
    const lessons = await sequelize.models.Lesson.findAll({
      include: [{
        model: sequelize.models.Category,
        as: 'category',
        attributes: ['name']
      }]
    });

    lessons.forEach(lesson => {
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

fixCategoriesDirectly();
