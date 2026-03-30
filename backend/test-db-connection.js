import { sequelize } from './src/config/database.js';
import './src/models/index.js';

sequelize.authenticate()
  .then(() => {
    console.log('✅ 数据库连接成功');
    return sequelize.models.Category.findAll();
  })
  .then(categories => {
    console.log(`✅ 找到 ${categories.length} 个分类`);
    categories.forEach(c => console.log(`   - ${c.id}: ${c.name}`));
    return sequelize.models.Lesson.findAll();
  })
  .then(lessons => {
    console.log(`✅ 找到 ${lessons.length} 个课程`);
    lessons.forEach(l => console.log(`   - ${l.id}: ${l.title || '无标题'} (分类: ${l.categoryId})`));
    return sequelize.models.Word.findAll();
  })
  .then(words => {
    console.log(`✅ 找到 ${words.length} 个单词`);
    words.slice(0, 5).forEach(w => console.log(`   - ${w.english}: ${w.chinese}`));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
