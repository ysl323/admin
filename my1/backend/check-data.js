import { Category, Lesson, Word } from './src/models/index.js';

async function checkData() {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Lesson,
        as: 'lessons',
        include: [{
          model: Word,
          as: 'words'
        }]
      }]
    });

    console.log('数据库统计:');
    console.log('分类数量:', categories.length);
    
    categories.forEach(cat => {
      console.log(`\n分类: ${cat.name}`);
      console.log(`  课程数量: ${cat.lessons.length}`);
      cat.lessons.forEach(lesson => {
        console.log(`    课程 ${lesson.lessonNumber}: ${lesson.words.length} 个单词`);
      });
    });

    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

checkData();
