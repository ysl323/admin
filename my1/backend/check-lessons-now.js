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

async function checkLessons() {
  try {
    console.log('检查课程数据...\n');
    
    // 先检查表结构
    const [columns] = await sequelize.query(`
      PRAGMA table_info(lessons)
    `);
    
    console.log('Lessons 表结构:');
    columns.forEach(col => {
      console.log(`  ${col.name} (${col.type})`);
    });
    console.log('');
    
    const [lessons] = await sequelize.query(`
      SELECT * FROM lessons 
      ORDER BY category_id, lesson_number
      LIMIT 20
    `);
    
    console.log(`找到 ${lessons.length} 条课程记录:\n`);
    
    if (lessons.length === 0) {
      console.log('❌ 数据库中没有课程数据！');
    } else {
      lessons.forEach(lesson => {
        console.log(`ID: ${lesson.id}, 分类: ${lesson.category_id}, 课程号: ${lesson.lesson_number}`);
      });
    }
    
    const [count] = await sequelize.query('SELECT COUNT(*) as total FROM lessons');
    console.log(`\n总课程数: ${count[0].total}`);
    
    await sequelize.close();
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

checkLessons();
