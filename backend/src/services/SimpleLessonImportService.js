import Joi from 'joi';
import { Category, Lesson, Word, sequelize } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * 简化课程导入服务
 * 支持新概念英语格式的 JSON 导入
 */
class SimpleLessonImportService {
  /**
   * JSON Schema 验证
   * 格式：[{lesson?, question, english, chinese}]
   */
  getImportSchema() {
    return Joi.array().items(
      Joi.object({
        lesson: Joi.number().integer().positive().optional(),
        question: Joi.number().integer().positive().required(),
        english: Joi.string().required(),
        chinese: Joi.string().required()
      }).unknown(false) // 不允许额外字段
    ).min(1);
  }

  /**
   * 验证 JSON 格式
   */
  validateJSON(data) {
    const schema = this.getImportSchema();
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.slice(0, 10).map(detail => {
        const index = detail.path[0];
        const field = detail.path[1] || 'unknown';
        return {
          index: index,
          item: data[index],
          field: field,
          message: detail.message
        };
      });
      
      const errorMsg = errors.map(e => 
        `第${e.index + 1}条数据 [${e.field}]: ${e.message}`
      ).join('; ');
      
      return {
        valid: false,
        errors,
        errorMsg: `发现 ${error.details.length} 个错误: ${errorMsg}${error.details.length > 10 ? '...(显示前10个)' : ''}`
      };
    }
    
    return {
      valid: true,
      data: value
    };
  }

  /**
   * 检查数据是否包含 lesson 字段
   */
  hasLessonField(data) {
    return data.some(item => item.lesson !== undefined && item.lesson !== null);
  }

  /**
   * 按 lesson 分组数据
   */
  groupByLesson(data) {
    const groups = {};
    
    data.forEach(item => {
      const lessonNum = item.lesson || 1; // 如果没有 lesson，默认为 1
      if (!groups[lessonNum]) {
        groups[lessonNum] = [];
      }
      groups[lessonNum].push(item);
    });
    
    // 按 question 排序
    Object.keys(groups).forEach(lessonNum => {
      groups[lessonNum].sort((a, b) => a.question - b.question);
    });
    
    return groups;
  }

  /**
   * 从 JSON 导入数据
   * @param {Array} data - JSON 数组数据
   * @param {string} categoryName - 分类名称
   * @returns {Promise<Object>} 导入结果
   */
  async importFromJSON(data, categoryName) {
    const transaction = await sequelize.transaction();
    
    try {
      // 验证 JSON 格式
      const validation = this.validateJSON(data);
      if (!validation.valid) {
        throw new Error(validation.errorMsg);
      }

      const validData = validation.data;
      
      // 检查是否有 lesson 字段
      const hasLesson = this.hasLessonField(validData);
      
      // 查找或创建分类
      let category = await Category.findOne({
        where: { name: categoryName },
        transaction
      });
      
      if (!category) {
        category = await Category.create(
          { name: categoryName },
          { transaction }
        );
        logger.info(`创建新分类: ${categoryName}`);
      }

      let totalWords = 0;
      const createdLessons = [];

      if (hasLesson) {
        // 有 lesson 字段：按课时分组
        const lessonGroups = this.groupByLesson(validData);
        
        for (const [lessonNum, items] of Object.entries(lessonGroups)) {
          const lessonNumber = parseInt(lessonNum);
          
          // 查找或创建课程
          let lesson = await Lesson.findOne({
            where: {
              categoryId: category.id,
              lessonNumber
            },
            transaction
          });
          
          if (!lesson) {
            lesson = await Lesson.create(
              {
                categoryId: category.id,
                lessonNumber
              },
              { transaction }
            );
            logger.info(`创建新课程: ${categoryName} - 第${lessonNumber}课`);
          }

          // 批量插入单词
          const wordRecords = items.map(item => ({
            lessonId: lesson.id,
            english: item.english,
            chinese: item.chinese
          }));

          await Word.bulkCreate(wordRecords, {
            transaction,
            ignoreDuplicates: false
          });

          totalWords += items.length;
          createdLessons.push({
            lessonNumber,
            wordCount: items.length
          });
        }
      } else {
        // 没有 lesson 字段：创建单个课程
        const lessonNumber = 1;
        
        let lesson = await Lesson.findOne({
          where: {
            categoryId: category.id,
            lessonNumber
          },
          transaction
        });
        
        if (!lesson) {
          lesson = await Lesson.create(
            {
              categoryId: category.id,
              lessonNumber
            },
            { transaction }
          );
          logger.info(`创建新课程: ${categoryName} - 第${lessonNumber}课`);
        }

        // 按 question 排序
        const sortedData = [...validData].sort((a, b) => a.question - b.question);

        // 批量插入单词
        const wordRecords = sortedData.map(item => ({
          lessonId: lesson.id,
          english: item.english,
          chinese: item.chinese
        }));

        await Word.bulkCreate(wordRecords, {
          transaction,
          ignoreDuplicates: false
        });

        totalWords = sortedData.length;
        createdLessons.push({
          lessonNumber,
          wordCount: sortedData.length
        });
      }

      await transaction.commit();

      const result = {
        category: categoryName,
        categoryId: category.id,
        hasLessonField: hasLesson,
        lessonsCreated: createdLessons.length,
        totalWords,
        lessons: createdLessons
      };

      logger.info(`简化导入成功: ${categoryName}, ${createdLessons.length} 个课程, ${totalWords} 个单词`);
      return result;
    } catch (error) {
      await transaction.rollback();
      logger.error('简化导入失败:', error);
      throw error;
    }
  }

  /**
   * 从文件导入数据
   */
  async importFromFile(filePath, categoryName) {
    try {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return await this.importFromJSON(data, categoryName);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('JSON 文件格式错误');
      }
      throw error;
    }
  }
}

export default new SimpleLessonImportService();
