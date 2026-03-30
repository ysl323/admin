import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';
import SimpleLessonImportService from './src/services/SimpleLessonImportService.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

async function cleanAndRestore() {
  try {
    console.log('步骤1: 清理现有数据...\n');
    
    await sequelize.query('DELETE FROM words');
    await sequelize.query('DELETE FROM lessons');
    
    console.log('✅ 清理完成\n');
    
    console.log('步骤2: 恢复数据...\n');
    
    const data = JSON.parse(fs.readFileSync('./sample-data.json', 'utf-8'));
    
    const result = await SimpleLessonImportService.importFromJSON(data.lessons.flatMap(lesson => 
      lesson.words.map((word, index) => ({
        lesson: lesson.lesson,
        question: index + 1,
        english: word.en,
        chinese: word.cn
      }))
    ), data.category);
    
    console.log('\n✅ 恢复成功！');
    console.log(`   分类: ${result.category}`);
    console.log(`   课程数: ${result.lessonsImported}`);
    console.log(`   单词数: ${result.wordsImported}`);
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ 失败:', error.message);
    process.exit(1);
  }
}

cleanAndRestore();
