import { sequelize } from './src/config/database.js';

async function checkAutoIndex() {
  try {
    // 获取创建表的 SQL
    const [result] = await sequelize.query(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='lessons';
    `);
    
    console.log('Lessons 表的创建 SQL:');
    console.log(result[0].sql);
    
    // 检查现有数据
    const [lessons] = await sequelize.query(`SELECT * FROM lessons;`);
    console.log('\n现有课程数据:');
    console.log(JSON.stringify(lessons, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

checkAutoIndex();
