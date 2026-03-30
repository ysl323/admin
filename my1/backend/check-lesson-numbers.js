/**
 * 检查课程编号
 */

const { Sequelize } = require('sequelize');
const path = require('path');

// 初始化数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function checkLessonNumbers() {
  try {
    console.log('========================================');
    console.log('检查课程编号');
    console.log('========================================\n');

    // 查询所有课程
    const [lessons] = await sequelize.query(`
      SELECT 
        l.id,
        l.title,
        l.lessonNumber,
        l.categoryId,
        c.name as categoryName,
        COUNT(w.id) as wordCount
      FROM lessons l
      LEFT JOIN categories c ON l.categoryId = c.id
      LEFT JOIN words w ON l.id = w.lessonId
      GROUP BY l.id
      ORDER BY c.name, l.lessonNumber
    `);

    console.log(`找到 ${lessons.length} 个课程:\n`);

    let hasZeroOrNull = false;

    lessons.forEach(lesson => {
      const status = lesson.lessonNumber === null || lesson.lessonNumber === 0 ? '❌' : '✅';
      console.log(`${status} ID: ${lesson.id}`);
      console.log(`   分类: ${lesson.categoryName}`);
      console.log(`   标题: ${lesson.title || '(无标题)'}`);
      console.log(`   课程编号: ${lesson.lessonNumber === null ? 'NULL' : lesson.lessonNumber}`);
      console.log(`   单词数: ${lesson.wordCount}`);
      console.log('');

      if (lesson.lessonNumber === null || lesson.lessonNumber === 0) {
        hasZeroOrNull = true;
      }
    });

    if (hasZeroOrNull) {
      console.log('========================================');
      console.log('⚠️  发现问题：有课程的lessonNumber为0或NULL');
      console.log('========================================\n');
      console.log('建议修复方案：');
      console.log('1. 手动更新数据库');
      console.log('2. 运行修复脚本');
      console.log('\n运行修复脚本：');
      console.log('  node fix-lesson-numbers.js');
    } else {
      console.log('========================================');
      console.log('✅ 所有课程编号正常');
      console.log('========================================');
    }

  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkLessonNumbers();
