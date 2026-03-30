import { sequelize } from './src/config/database.js';
import { Category, Lesson, Word } from './src/models/index.js';

async function fixLessonsTable() {
  try {
    console.log('开始修复 lessons 表结构...\n');
    
    // 1. 备份现有数据
    console.log('1. 备份现有数据...');
    const [categories] = await sequelize.query('SELECT * FROM categories;');
    const [lessons] = await sequelize.query('SELECT * FROM lessons;');
    const [words] = await sequelize.query('SELECT * FROM words;');
    
    console.log(`   - 分类: ${categories.length} 条`);
    console.log(`   - 课程: ${lessons.length} 条`);
    console.log(`   - 单词: ${words.length} 条\n`);
    
    // 2. 删除旧表
    console.log('2. 删除旧的 lessons 表...');
    await sequelize.query('DROP TABLE IF EXISTS lessons;');
    console.log('   ✓ 已删除\n');
    
    // 3. 删除 words 表（因为它依赖 lessons）
    console.log('3. 删除 words 表...');
    await sequelize.query('DROP TABLE IF EXISTS words;');
    console.log('   ✓ 已删除\n');
    
    // 4. 重新创建表（使用正确的结构）
    console.log('4. 重新创建表...');
    await Lesson.sync({ force: true });
    await Word.sync({ force: true });
    console.log('   ✓ 表已重新创建\n');
    
    // 5. 验证新表结构
    console.log('5. 验证新表结构...');
    const [newTableInfo] = await sequelize.query('SELECT sql FROM sqlite_master WHERE type="table" AND name="lessons";');
    console.log('   新的 lessons 表结构:');
    console.log('   ' + newTableInfo[0].sql);
    console.log();
    
    // 6. 恢复数据（如果有）
    if (lessons.length > 0) {
      console.log('6. 恢复课程数据...');
      for (const lesson of lessons) {
        await sequelize.query(
          'INSERT INTO lessons (id, category_id, lesson_number, created_at, updated_at) VALUES (?, ?, ?, ?, ?);',
          {
            replacements: [
              lesson.id,
              lesson.category_id,
              lesson.lesson_number,
              lesson.created_at,
              lesson.updated_at
            ]
          }
        );
      }
      console.log(`   ✓ 已恢复 ${lessons.length} 条课程数据\n`);
    }
    
    if (words.length > 0) {
      console.log('7. 恢复单词数据...');
      for (const word of words) {
        await sequelize.query(
          'INSERT INTO words (id, lesson_id, english, chinese, audio_cache_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?);',
          {
            replacements: [
              word.id,
              word.lesson_id,
              word.english,
              word.chinese,
              word.audio_cache_url,
              word.created_at,
              word.updated_at
            ]
          }
        );
      }
      console.log(`   ✓ 已恢复 ${words.length} 条单词数据\n`);
    }
    
    console.log('✅ 修复完成！\n');
    console.log('现在可以正常导入数据了。');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

fixLessonsTable();
