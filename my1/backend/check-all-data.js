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

async function checkAllData() {
  try {
    console.log('检查所有数据表...\n');
    
    // 检查用户
    const [users] = await sequelize.query('SELECT COUNT(*) as total FROM users');
    console.log(`用户数: ${users[0].total}`);
    
    // 检查分类
    const [categories] = await sequelize.query('SELECT COUNT(*) as total FROM categories');
    console.log(`分类数: ${categories[0].total}`);
    
    // 检查课程
    const [lessons] = await sequelize.query('SELECT COUNT(*) as total FROM lessons');
    console.log(`课程数: ${lessons[0].total}`);
    
    // 检查单词
    const [words] = await sequelize.query('SELECT COUNT(*) as total FROM words');
    console.log(`单词数: ${words[0].total}`);
    
    console.log('\n详细信息:');
    
    if (categories[0].total > 0) {
      const [catList] = await sequelize.query('SELECT id, name FROM categories');
      console.log('\n分类列表:');
      catList.forEach(cat => console.log(`  - ${cat.id}: ${cat.name}`));
    }
    
    if (lessons[0].total > 0) {
      const [lessonList] = await sequelize.query('SELECT id, category_id, lesson_number FROM lessons LIMIT 10');
      console.log('\n课程列表 (前10条):');
      lessonList.forEach(lesson => console.log(`  - ID: ${lesson.id}, 分类: ${lesson.category_id}, 课程号: ${lesson.lesson_number}`));
    } else {
      console.log('\n❌ 课程表是空的！');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

checkAllData();
