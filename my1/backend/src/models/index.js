import { sequelize } from '../config/database.js';
import User from './User.js';
import Category from './Category.js';
import Lesson from './Lesson.js';
import Word from './Word.js';
import Config from './Config.js';
import AudioCache from './AudioCache.js';
import WordMastery from './WordMastery.js';

// 定义模型关系

// Category -> Lessons (一对多)
Category.hasMany(Lesson, {
  foreignKey: 'categoryId',
  as: 'lessons',
  onDelete: 'CASCADE'
});
Lesson.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});

// Lesson -> Words (一对多)
Lesson.hasMany(Word, {
  foreignKey: 'lessonId',
  as: 'words',
  onDelete: 'CASCADE'
});
Word.belongsTo(Lesson, {
  foreignKey: 'lessonId',
  as: 'lesson'
});

// User -> WordMastery (一对多)
User.hasMany(WordMastery, {
  foreignKey: 'userId',
  as: 'masteredWords',
  onDelete: 'CASCADE'
});
WordMastery.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Lesson -> WordMastery (一对多)
Lesson.hasMany(WordMastery, {
  foreignKey: 'lessonId',
  as: 'masteryRecords',
  onDelete: 'CASCADE'
});
WordMastery.belongsTo(Lesson, {
  foreignKey: 'lessonId',
  as: 'lesson'
});

// Word -> WordMastery (一对多)
Word.hasMany(WordMastery, {
  foreignKey: 'wordId',
  as: 'masteryRecords',
  onDelete: 'CASCADE'
});
WordMastery.belongsTo(Word, {
  foreignKey: 'wordId',
  as: 'word'
});

// 导出所有模型和 sequelize 实例
export { sequelize, User, Category, Lesson, Word, Config, AudioCache, WordMastery };
