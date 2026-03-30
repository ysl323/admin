/**
 * 检查课程和单词的关联关系
 */

import { Lesson, Word, Category } from './src/models/index.js';
import { sequelize } from './src/models/index.js';

async function checkLessonsAndWords() {
  try {
    console.log('=== 检查课程和单词关联 ===\n');
    
    // 1. 检查所有课程
    console.log('1. 检查所有课程:');
    const lessons = await Lesson.findAll({
      include: [{
        model: Category,
        as: 'category'
      }]
    });
    console.log(`找到 ${lessons.length} 个课程:`);
    lessons.forEach(lesson => {
      console.log(`  - 课程 ID: ${lesson.id}, 编号: ${lesson.lessonNumber}, 分类: ${lesson.category?.name || '未知'}`);
    });
    console.log('');
    
    // 2. 检查所有单词
    console.log('2. 检查所有单词:');
    const words = await Word.findAll({
      attributes: ['id', 'english', 'lessonId']
    });
    console.log(`找到 ${words.length} 个单词\n`);
    
    // 3. 统计单词按课程ID分组
    console.log('3. 单词按课程ID分组:');
    const wordsByLesson = {};
    words.forEach(word => {
      if (!wordsByLesson[word.lessonId]) {
        wordsByLesson[word.lessonId] = [];
      }
      wordsByLesson[word.lessonId].push(word);
    });
    
    Object.keys(wordsByLesson).sort((a, b) => parseInt(a) - parseInt(b)).forEach(lessonId => {
      const count = wordsByLesson[lessonId].length;
      const lessonExists = lessons.find(l => l.id === parseInt(lessonId));
      const status = lessonExists ? '✓ 课程存在' : '✗ 课程不存在';
      console.log(`  课程 ID ${lessonId}: ${count} 个单词 ${status}`);
    });
    console.log('');
    
    // 4. 找出孤立的单词（课程不存在）
    console.log('4. 孤立单词（课程不存在）:');
    const lessonIds = lessons.map(l => l.id);
    const orphanWords = words.filter(w => !lessonIds.includes(w.lessonId));
    
    if (orphanWords.length > 0) {
      console.log(`⚠ 发现 ${orphanWords.length} 个孤立单词:`);
      const orphanByLesson = {};
      orphanWords.forEach(word => {
        if (!orphanByLesson[word.lessonId]) {
          orphanByLesson[word.lessonId] = [];
        }
        orphanByLesson[word.lessonId].push(word);
      });
      
      Object.keys(orphanByLesson).forEach(lessonId => {
        console.log(`  课程 ID ${lessonId} (不存在): ${orphanByLesson[lessonId].length} 个单词`);
        orphanByLesson[lessonId].slice(0, 3).forEach(word => {
          console.log(`    - ID: ${word.id}, 英文: ${word.english}`);
        });
        if (orphanByLesson[lessonId].length > 3) {
          console.log(`    ... 还有 ${orphanByLesson[lessonId].length - 3} 个`);
        }
      });
    } else {
      console.log('✓ 没有孤立单词');
    }
    
    console.log('\n=== 检查完成 ===');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ 检查失败:');
    console.error(error);
    process.exit(1);
  }
}

checkLessonsAndWords();
