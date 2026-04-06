import { Category, Lesson, Word } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * 学习内容服务类
 * 提供分类、课程、单词的查询功能
 */
class LearningService {
  /**
   * 获取所有分类
   * @returns {Promise<Array>} 分类列表
   */
  async getAllCategories() {
    try {
      const categories = await Category.findAll({
        attributes: ['id', 'name', 'createdAt'],
        order: [['createdAt', 'ASC']],
        include: [{
          model: Lesson,
          as: 'lessons',
          attributes: ['id']
        }]
      });

      // 添加课程数量
      const categoriesWithCount = categories.map(category => {
        const categoryData = category.toJSON();
        categoryData.lessonCount = categoryData.lessons ? categoryData.lessons.length : 0;
        delete categoryData.lessons; // 删除lessons数组，只保留数量
        return categoryData;
      });

      logger.info(`查询所有分类: ${categoriesWithCount.length} 个`);
      return categoriesWithCount;
    } catch (error) {
      logger.error('获取分类列表失败:', error);
      throw new Error('获取分类列表失败');
    }
  }

  /**
   * 根据分类ID获取课程列表
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Array>} 课程列表
   */
  async getLessonsByCategory(categoryId) {
    try {
      // 验证分类是否存在
      const category = await Category.findByPk(categoryId);
      if (!category) {
        throw new Error('分类不存在');
      }

      const lessons = await Lesson.findAll({
        where: { categoryId },
        attributes: ['id', 'lessonNumber', 'categoryId', 'createdAt'],
        order: [['lessonNumber', 'ASC']],
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['name']
          },
          {
            model: Word,
            as: 'words',
            attributes: ['id']
          }
        ]
      });

      // 添加单词数量
      const lessonsWithCount = lessons.map(lesson => {
        const lessonData = lesson.toJSON();
        lessonData.wordCount = lessonData.words ? lessonData.words.length : 0;
        delete lessonData.words; // 删除words数组，只保留数量
        return lessonData;
      });

      logger.info(`查询分类 ${categoryId} 的课程: ${lessonsWithCount.length} 个`);
      return lessonsWithCount;
    } catch (error) {
      logger.error(`获取分类 ${categoryId} 的课程列表失败:`, error);
      throw error;
    }
  }

  /**
   * 根据课程ID获取单词列表
   * @param {number} lessonId - 课程ID
   * @returns {Promise<Array>} 单词列表
   */
  async getWordsByLesson(lessonId) {
    try {
      // 验证课程是否存在
      const lesson = await Lesson.findByPk(lessonId, {
        include: [{
          model: Category,
          as: 'category',
          attributes: ['name']
        }]
      });

      if (!lesson) {
        throw new Error('课程不存在');
      }

      const words = await Word.findAll({
        where: { lessonId },
        attributes: ['id', 'english', 'chinese', 'phonetic', 'audioCacheUrl', 'createdAt'],
        order: [['id', 'ASC']]
      });

      logger.info(`查询课程 ${lessonId} 的单词: ${words.length} 个`);
      
      return {
        lesson: {
          id: lesson.id,
          lessonNumber: lesson.lessonNumber,
          categoryName: lesson.category.name,
          categoryId: lesson.categoryId
        },
        words
      };
    } catch (error) {
      logger.error(`获取课程 ${lessonId} 的单词列表失败:`, error);
      throw error;
    }
  }

  /**
   * 智能标点符号校对
   * @param {string} userInput - 用户输入
   * @param {string} correctAnswer - 正确答案
   * @returns {boolean} 是否正确
   */
  checkWithSmartPunctuation(userInput, correctAnswer) {
    // 去除首尾空格
    const input = userInput.trim();
    const answer = correctAnswer.trim();

    // 获取用户输入的最后一个字符
    const inputLastChar = input.slice(-1);
    const answerLastChar = answer.slice(-1);

    // 常见标点符号集合
    const punctuation = /[.!?。，！？,;:;:"'""'']|!|！|\?|？|\.|。|,|，|;|；|:|：|"|"|'|'|'/;

    const inputHasPunctuation = punctuation.test(inputLastChar);
    const answerHasPunctuation = punctuation.test(answerLastChar);

    // 情况1: 用户输入带标点，正确答案也带标点
    if (inputHasPunctuation && answerHasPunctuation) {
      // 比较带标点的完整答案（忽略大小写）
      return input.toLowerCase() === answer.toLowerCase();
    }

    // 情况2: 用户输入不带标点，正确答案带标点
    // 情况3: 用户输入带标点，正确答案不带标点
    // 情况4: 两者都不带标点
    // 以上三种情况都只比较不含标点的核心内容

    const inputWithoutPunct = input.replace(punctuation, '').trim();
    const answerWithoutPunct = answer.replace(punctuation, '').trim();

    return inputWithoutPunct.toLowerCase() === answerWithoutPunct.toLowerCase();
  }

  /**
   * 计算最长公共前缀（LCP）
   * @param {string} userInput - 用户输入
   * @param {string} correctAnswer - 正确答案
   * @returns {string} 最长公共前缀
   */
  calculateLongestCommonPrefix(userInput, correctAnswer) {
    // 转换为小写进行比较（忽略大小写）
    const input = userInput.toLowerCase().trim();
    const answer = correctAnswer.toLowerCase().trim();

    let prefix = '';
    const minLength = Math.min(input.length, answer.length);

    for (let i = 0; i < minLength; i++) {
      if (input[i] === answer[i]) {
        prefix += userInput[i]; // 保留用户输入的原始大小写
      } else {
        break;
      }
    }

    logger.debug(`LCP计算: "${userInput}" vs "${correctAnswer}" = "${prefix}"`);
    return prefix;
  }

  /**
   * 检查答案是否正确（支持智能标点符号校对）
   * @param {number} wordId - 单词ID
   * @param {string} userAnswer - 用户答案
   * @returns {Promise<Object>} 检查结果
   */
  async checkAnswer(wordId, userAnswer) {
    try {
      // 查询单词
      const word = await Word.findByPk(wordId, {
        attributes: ['id', 'english', 'chinese']
      });

      if (!word) {
        throw new Error('单词不存在');
      }

      // 使用智能标点符号校对
      const correctAnswer = word.english.trim();
      const isCorrect = this.checkWithSmartPunctuation(userAnswer, correctAnswer);

      // 如果错误，计算最长公共前缀
      let longestCommonPrefix = '';
      if (!isCorrect) {
        longestCommonPrefix = this.calculateLongestCommonPrefix(userAnswer, correctAnswer);
      }

      const result = {
        correct: isCorrect,  // 前端期望的字段名
        correctAnswer: word.english,
        chinese: word.chinese,
        longestCommonPrefix: isCorrect ? '' : longestCommonPrefix
      };

      logger.info(`答案检查: 单词 ${wordId}, 用户答案 "${userAnswer.trim()}", 结果: ${isCorrect ? '正确' : '错误'}`);
      return result;
    } catch (error) {
      logger.error(`检查答案失败: 单词 ${wordId}`, error);
      throw error;
    }
  }
}


export default new LearningService();
