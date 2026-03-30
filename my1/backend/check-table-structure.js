import { sequelize } from './src/config/database.js';

async function checkTableStructure() {
  try {
    // 查询 lessons 表的索引
    const [indexes] = await sequelize.query(`
      SELECT * FROM sqlite_master 
      WHERE type='index' AND tbl_name='lessons';
    `);
    
    console.log('Lessons 表的索引:');
    console.log(JSON.stringify(indexes, null, 2));
    
    // 查询表结构
    const [tableInfo] = await sequelize.query(`PRAGMA table_info(lessons);`);
    console.log('\nLessons 表结构:');
    console.log(JSON.stringify(tableInfo, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

checkTableStructure();
