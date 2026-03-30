import { Category, Lesson, Word } from './src/models/index.js';

async function diagnose() {
  try {
    console.log('='.repeat(80));
    console.log('数据库诊断');
    console.log('='.repeat(80));
    console.log('');
    
    const catCount = await Category.count();
    const lessonCount = await Lesson.count();
    const wordCount = await Word.count();
    
    console.log(`分类数: ${catCount}`);
    console.log(`课程数: ${lessonCount}`);
    console.log(`单词数: ${wordCount}`);
    console.log('');
    
    if (catCount > 0) {
      console.log('分类详情:');
      const cats = await Category.findAll({ order: [['id', 'ASC']] });
      for (const cat of cats) {
        const lessons = await Lesson.findAll({ where: { categoryId: cat.id } });
        console.log(`  ${cat.name}: ${lessons.length} 个课程`);
        
        for (const lesson of lessons) {
          const wc = await Word.count({ where: { lessonId: lesson.id } });
          console.log(`    第${lesson.lessonNumber}课: ${wc} 个单词`);
        }
      }
    }
    
    console.log('='.repeat(80));
    process.exit(0);
  } catch (e) {
    console.error('错误:', e);
    process.exit(1);
  }
}

diagnose();
