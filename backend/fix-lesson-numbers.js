/**
 * 修复课程编号
 * 为每个分类下的课程自动分配递增的课程编号
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// 初始化数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function fixLessonNumbers() {
  try {
    console.log('========================================');
    console.log('修复课程编号');
    console.log('========================================\n');

    // 查询所有分类
    const [categories] = await sequelize.query(`
      SELECT id, name FROM categories ORDER BY id
    `);

    console.log(`找到 ${categories.length} 个分类\n`);

    let totalFixed = 0;

    for (const category of categories) {
      console.log(`处理分类: ${category.name} (ID: ${category.id})`);

      // 查询该分类下的所有课程
      const [lessons] = await sequelize.query(`
        SELECT id, title, lessonNumber
        FROM lessons
        WHERE categoryId = ?
        ORDER BY id
      `, {
        replacements: [category.id]
      });

      if (lessons.length === 0) {
        console.log('  没有课程\n');
        continue;
      }

      console.log(`  找到 ${lessons.length} 个课程`);

      // 为每个课程分配编号
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const newNumber = i + 1;

        if (lesson.lessonNumber !== newNumber) {
          await sequelize.query(`
            UPDATE lessons
            SET lessonNumber = ?
            WHERE id = ?
          `, {
            replacements: [newNumber, lesson.id]
          });

          console.log(`  ✅ 课程 ${lesson.id}: ${lesson.lessonNumber || 'NULL'} → ${newNumber}`);
          totalFixed++;
        } else {
          console.log(`  ⏭️  课程 ${lesson.id}: ${lesson.lessonNumber} (无需修改)`);
        }
      }

      console.log('');
    }

    console.log('========================================');
    console.log(`修复完成: 共修复 ${totalFixed} 个课程`);
    console.log('========================================');

  } catch (error) {
    console.error('修复失败:', error);
  } finally {
    await sequelize.close();
  }
}

fixLessonNumbers();
