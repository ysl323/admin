import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function fixAndRestore() {
  try {
    console.log('步骤1: 检查表结构...\n');
    
    const [indexes] = await sequelize.query(`PRAGMA index_list(lessons)`);
    console.log('Lessons 表索引:');
    indexes.forEach(idx => console.log(`  - ${idx.name} (unique: ${idx.unique})`));
    
    console.log('\n步骤2: 重建 lessons 表...\n');
    
    // 删除旧备份表
    await sequelize.query('DROP TABLE IF EXISTS lessons_backup');
    
    // 备份数据
    await sequelize.query('CREATE TABLE lessons_backup AS SELECT * FROM lessons');
    
    // 删除旧表
    await sequelize.query('DROP TABLE lessons');
    
    // 创建新表（没有唯一约束）
    await sequelize.query(`
      CREATE TABLE lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        lesson_number INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        UNIQUE(category_id, lesson_number)
      )
    `);
    
    console.log('✅ 表重建完成\n');
    
    console.log('步骤3: 导入数据...\n');
    
    const data = JSON.parse(fs.readFileSync('./sample-data.json', 'utf-8'));
    
    // 找到分类ID
    const [categories] = await sequelize.query(`SELECT id FROM categories WHERE name = ?`, {
      replacements: [data.category]
    });
    
    if (categories.length === 0) {
      throw new Error(`分类 "${data.category}" 不存在`);
    }
    
    const categoryId = categories[0].id;
    
    // 导入课程和单词
    for (const lesson of data.lessons) {
      // 插入课程
      await sequelize.query(`
        INSERT INTO lessons (category_id, lesson_number, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `, {
        replacements: [categoryId, lesson.lesson]
      });
      
      // 获取刚插入的课程ID
      const [lastId] = await sequelize.query('SELECT last_insert_rowid() as id');
      const lessonId = lastId[0].id;
      
      console.log(`  ✅ 创建课程 ${lesson.lesson} (ID: ${lessonId})`);
      
      // 插入单词
      for (const word of lesson.words) {
        await sequelize.query(`
          INSERT INTO words (lesson_id, english, chinese, created_at)
          VALUES (?, ?, ?, datetime('now'))
        `, {
          replacements: [lessonId, word.en, word.cn]
        });
      }
      
      console.log(`    添加了 ${lesson.words.length} 个单词`);
    }
    
    // 统计
    const [count] = await sequelize.query('SELECT COUNT(*) as total FROM lessons');
    const [wordCount] = await sequelize.query('SELECT COUNT(*) as total FROM words');
    
    console.log(`\n✅ 恢复完成！`);
    console.log(`   总课程数: ${count[0].total}`);
    console.log(`   总单词数: ${wordCount[0].total}`);
    
    // 删除备份表
    await sequelize.query('DROP TABLE IF EXISTS lessons_backup');
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixAndRestore();
