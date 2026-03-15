import { Word, Lesson, Category } from '../src/models/index.js';
import logger from '../src/utils/logger.js';

async function addTestWords() {
  try {
    // 查找 ESP32 Programming 分类的第1课
    const category = await Category.findOne({ where: { name: 'ESP32 Programming' } });
    if (!category) {
      console.log('❌ 未找到 ESP32 Programming 分类');
      process.exit(1);
    }

    const lesson = await Lesson.findOne({
      where: {
        categoryId: category.id,
        lessonNumber: 1
      }
    });

    if (!lesson) {
      console.log('❌ 未找到课程');
      process.exit(1);
    }

    // 添加测试单词
    const words = [
      { english: 'gpio', chinese: '通用输入输出' },
      { english: 'uart', chinese: '串口通信' },
      { english: 'i2c', chinese: 'I2C总线' },
      { english: 'spi', chinese: 'SPI总线' },
      { english: 'wifi', chinese: '无线网络' }
    ];

    for (const wordData of words) {
      await Word.create({
        lessonId: lesson.id,
        english: wordData.english,
        chinese: wordData.chinese
      });
      console.log(`✅ 添加单词: ${wordData.english} - ${wordData.chinese}`);
    }

    console.log(`\n✅ 成功添加 ${words.length} 个单词到课程 ${lesson.lessonNumber}`);
    process.exit(0);
  } catch (error) {
    logger.error('添加测试单词失败:', error);
    console.error('❌ 添加测试单词失败:', error.message);
    process.exit(1);
  }
}

addTestWords();
