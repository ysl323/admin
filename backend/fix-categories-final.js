import { sequelize } from './src/config/database.js';
import './src/models/index.js';

async function fixCategoriesFinal() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 获取"新概念3"分类下的所有课程
    const existingLessons = await sequelize.models.Lesson.findAll({
      where: { categoryId: 10 },
      order: [['lessonNumber', 'ASC']]
    });

    console.log('\n新概念3分类现有课程:');
    existingLessons.forEach(l => {
      console.log(`   - 第${l.lessonNumber}课 (ID: ${l.id})`);
    });

    // 获取需要修复的课程
    const lessonsToFix = await sequelize.models.Lesson.findAll({
      where: { categoryId: 5 },
      order: [['lessonNumber', 'ASC']]
    });

    console.log(`\n需要修复的课程 (${lessonsToFix.length}个):`);
    
    // 为课程1-3分配新的课程号（5, 6, 7），避免与现有课程号冲突
    let newLessonNumber = 5;
    for (const lesson of lessonsToFix) {
      console.log(`   - 课程 ${lesson.id} (第${lesson.lessonNumber}课) -> 将改为第${newLessonNumber}课，分类ID 10`);

      try {
        await sequelize.query(
          "UPDATE lessons SET category_id = 10, lesson_number = ? WHERE id = ?",
          { replacements: [newLessonNumber, lesson.id] }
        );
        console.log(`      ✅ 修复成功`);
        newLessonNumber++;
      } catch (error) {
        console.error(`      ❌ 修复失败: ${error.message}`);
        newLessonNumber++; // 继续尝试下一个课程号
      }
    }

    // 显示最终结果
    console.log('\n修复后的课程列表:');
    const allLessons = await sequelize.models.Lesson.findAll({
      include: [{
        model: sequelize.models.Category,
        as: 'category',
        attributes: ['name']
      }],
      order: [['categoryId', 'ASC'], ['lessonNumber', 'ASC']]
    });

    allLessons.forEach(lesson => {
      const catName = lesson.category ? lesson.category.name : '无';
      console.log(`   - 课程 ${lesson.id} (第${lesson.lessonNumber}课) -> ${catName} (分类ID: ${lesson.categoryId})`);
    });

    console.log('\n✅ 修复完成!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixCategoriesFinal();
