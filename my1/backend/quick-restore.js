import SimpleLessonImportService from './src/services/SimpleLessonImportService.js';
import fs from 'fs';

async function restore() {
  try {
    console.log('开始恢复数据...\n');
    
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
    
  } catch (error) {
    console.error('❌ 恢复失败:', error.message);
    console.error(error);
    process.exit(1);
  }
}

restore();
