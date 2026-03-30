import { sequelize, Category, Lesson, Word } from './src/models/index.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function diagnoseDatabase() {
  try {
    console.log('='.repeat(80));
    console.log('数据库诊断工具');
    console.log('='.repeat(80));
    console.log('');
    
    // 1. 检查数据库连接
    console.log('📊 第一步：检查数据库连接');
    console.log('-'.repeat(80));
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    console.log('');
    
    // 2. 检查数据库文件
    console.log('📁 第二步：检查数据库文件');
    console.log('-'.repeat(80));
    const dbPath = process.env.DB_STORAGE || './database.sqlite';
    const fullPath = `${process.cwd()}/${dbPath}`;
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      console.log(`✅ 数据库文件存在: ${fullPath}`);
      console.log(`📊 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`🕐 修改时间: ${stats.mtime}`);
    } else {
      console.log(`❌ 数据库文件不存在: ${fullPath}`);
    }
    console.log('');
    
    // 3. 检查数据统计
    console.log('📊 第三步：检查数据统计');
    console.log('-'.repeat(80));
    
    const categoryCount = await Category.count();
    const lessonCount = await Lesson.count();
    const wordCount = await Word.count();
    
    console.log(`📁 分类数量: ${categoryCount}`);
    console.log(`📚 课程数量: ${lessonCount}`);
    console.log(`📖 单词数量: ${wordCount}`);
    console.log('');
    
    if (categoryCount === 0 && lessonCount === 0 && wordCount === 0) {
      console.log('⚠️  警告：数据库是空的！所有数据都已丢失。');
      console.log('');
    }
    
    // 4. 检查分类详情
    if (categoryCount > 0) {
      console.log('📁 第四步：分类详情');
      console.log('-'.repeat(80));
      const categories = await Category.findAll({
        order: [['id', 'ASC']]
      });
      
      for (const cat of categories) {
        const lessons = await Lesson.findAll({
          where: { categoryId: cat.id },
          attributes: ['id', 'lessonNumber']
        });
        
        console.log(`分类 ${cat.id}: ${cat.name}`);
        console.log(`  课程数量: ${lessons.length}`);
        
        for (const lesson of lessons) {
          const wordCount = await Word.count({
            where: { lessonId: lesson.id }
          });
          console.log(`    课程 ${lesson.lessonNumber}: ${wordCount} 个单词`);
        }
      }
      console.log('');
    }
    
    // 5. 检查课程详情（如果数量不多）
    if (lessonCount > 0 && lessonCount <= 10) {
      console.log('📚 第五步：课程详情');
      console.log('-'.repeat(80));
      const lessons = await Lesson.findAll({
        include: [{
          model: Category,
          as: 'category',
          attributes: ['name']
        }],
        order: [['categoryId', 'ASC'], ['lessonNumber', 'ASC']]
      });
      
      for (const lesson of lessons) {
        const wordCount = await Word.count({
          where: { lessonId: lesson.id }
        });
        console.log(`课程 ${lesson.id}: ${lesson.category?.name || '未知'} - 第${lesson.lessonNumber}课 (${wordCount}个单词)`);
      }
      console.log('');
    }
    
    // 6. 检查单词详情（如果数量不多）
    if (wordCount > 0 && wordCount <= 20) {
      console.log('📖 第六步：单词详情（前20个）');
      console.log('-'.repeat(80));
      const words = await Word.findAll({
        include: [{
          model: Lesson,
          as: 'lesson',
          required: false,
          attributes: ['lessonNumber', 'categoryId'],
          include: [{
            model: Category,
            as: 'category',
            required: false,
            attributes: ['name']
          }]
        }],
        order: [['id', 'ASC']],
        limit: 20
      });
      
      for (const word of words) {
        const categoryName = word.lesson?.category?.name || '未知';
        const lessonNumber = word.lesson?.lessonNumber || '未知';
        console.log(`  ${word.id}: ${categoryName} - 第${lessonNumber}课 - ${word.english} (${word.chinese})`);
      }
      console.log('');
    }
    
    // 7. 检查环境配置
    console.log('⚙️  第七步：环境配置');
    console.log('-'.repeat(80));
    console.log(`NODE_ENV: ${process.env.NODE_ENV || '未设置'}`);
    console.log(`DB_DIALECT: ${process.env.DB_DIALECT || 'sqlite'}`);
    console.log(`DB_STORAGE: ${process.env.DB_STORAGE || './database.sqlite'}`);
    console.log(`PORT: ${process.env.PORT || '3000'}`);
    console.log('');
    
    // 8. 诊断结论
    console.log('='.repeat(80));
    console.log('📋 诊断结论');
    console.log('='.repeat(80));
    
    if (categoryCount === 0 && lessonCount === 0) {
      console.log('');
      console.log('❌ 问题确认：数据库中没有课程数据！');
      console.log('');
      console.log('可能的原因：');
      console.log('1. 数据库文件被替换或清空');
      console.log('2. 数据库同步使用了 alter: true 或 force: true');
      console.log('3. 数据导入失败');
      console.log('');
      console.log('建议的解决方案：');
      console.log('1. 检查是否有备份文件');
      console.log('2. 使用管理后台重新导入课程数据');
      console.log('3. 检查 .env 配置，确保使用正确的数据库文件');
      console.log('');
    } else if (lessonCount > 0 && wordCount === 0) {
      console.log('');
      console.log('⚠️  警告：有课程但没有单词数据！');
      console.log('');
      console.log('建议的解决方案：');
      console.log('1. 检查 words 表是否存在数据');
      console.log('2. 重新导入单词数据');
      console.log('');
    } else {
      console.log('');
      console.log('✅ 数据库状态正常！');
      console.log('');
      console.log('如果仍然看不到课程，可能的原因：');
      console.log('1. 前端缓存问题 - 请刷新浏览器');
      console.log('2. 前端API调用失败 - 请检查浏览器控制台错误');
      console.log('3. 权限问题 - 请确认已登录');
      console.log('');
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ 数据库诊断失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

diagnoseDatabase();
