import { Sequelize, DataTypes } from 'sequelize';
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

// 定义模型
const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'categories', underscored: true });

const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  lesson_number: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'lessons', underscored: true });

const Word = sequelize.define('Word', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lesson_id: { type: DataTypes.INTEGER, allowNull: false },
  english: { type: DataTypes.STRING, allowNull: false },
  chinese: { type: DataTypes.STRING, allowNull: false },
  phonetic: DataTypes.STRING,
  example_sentence: DataTypes.TEXT,
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'words', underscored: true });

async function restoreLessons() {
  try {
    console.log('开始恢复课程数据...\n');
    
    // 读取数据文件
    const dataPath = path.join(__dirname, 'new-concept-lesson1-3.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    console.log(`读取到 ${data.lessons.length} 个课程\n`);
    
    // 查找或创建分类
    let category = await Category.findOne({ where: { name: data.category } });
    if (!category) {
      category = await Category.create({
        name: data.category,
        description: data.description || '',
        order: 1
      });
      console.log(`✅ 创建分类: ${category.name}`);
    } else {
      console.log(`✅ 找到分类: ${category.name}`);
    }
    
    // 导入课程和单词
    for (const lessonData of data.lessons) {
      // 创建课程
      const lesson = await Lesson.create({
        category_id: category.id,
        lesson_number: lessonData.lesson_number
      });
      
      console.log(`  ✅ 创建课程 ${lessonData.lesson_number}`);
      
      // 创建单词
      for (const wordData of lessonData.words) {
        await Word.create({
          lesson_id: lesson.id,
          english: wordData.english,
          chinese: wordData.chinese,
          phonetic: wordData.phonetic || '',
          example_sentence: wordData.example_sentence || '',
          order: wordData.order || 0
        });
      }
      
      console.log(`    添加了 ${lessonData.words.length} 个单词`);
    }
    
    // 统计
    const [count] = await sequelize.query('SELECT COUNT(*) as total FROM lessons');
    const [wordCount] = await sequelize.query('SELECT COUNT(*) as total FROM words');
    
    console.log(`\n✅ 恢复完成!`);
    console.log(`   总课程数: ${count[0].total}`);
    console.log(`   总单词数: ${wordCount[0].total}`);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  }
}

restoreLessons();
