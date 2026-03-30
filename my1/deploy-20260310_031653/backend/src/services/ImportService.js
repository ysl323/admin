import Joi from 'joi';
import { Category, Lesson, Word, sequelize } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * 导入服务类
 * 处理 JSON 批量导入功能
 */
class ImportService {
  /**
   * JSON Schema 验证
   */
  getImportSchema() {
    return Joi.object({
      category: Joi.string().required().messages({
        'string.empty': '分类名称不能为空',
        'any.required': '分类名称是必需的'
      }),
      lessons: Joi.array().items(
        Joi.object({
          lesson: Joi.number().integer().positive().required().messages({
            'number.base': '课程编号必须是数字',
            'number.positive': '课程编号必须是正数',
            'any.required': '课程编号是必需的'
          }),
          words: Joi.array().items(
            Joi.object({
              en: Joi.string().required().messages({
                'string.empty': '英文单词不能为空',
                'any.required': '英文单词是必需的'
              }),
              cn: Joi.string().required().messages({
                'string.empty': '中文翻译不能为空',
                'any.required': '中文翻译是必需的'
              })
            })
          ).min(1).required().messages({
            'array.min': '每个课程至少需要一个单词',
            'any.required': '单词列表是必需的'
          })
        })
      ).min(1).required().messages({
        'array.min': '至少需要一个课程',
        'any.required': '课程列表是必需的'
      })
    });
  }

  /**
   * 验证 JSON 格式
   * @param {Object} data - 要验证的数据
   * @returns {Object} 验证结果
   */
  validateJSON(data) {
    const schema = this.getImportSchema();
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return {
        valid: false,
        errors
      };
    }
    
    return {
      valid: true,
      data: value
    };
  }

  /**
   * 从 JSON 导入数据
   * @param {Object} data - JSON 数据
   * @returns {Promise<Object>} 导入结果
   */
  async importFromJSON(data) {
    const transaction = await sequelize.transaction();
    
    try {
      // 验证 JSON 格式
      const validation = this.validateJSON(data);
      if (!validation.valid) {
        throw new Error(`JSON 格式验证失败: ${JSON.stringify(validation.errors)}`);
      }

      const { category: categoryName, lessons } = validation.data;
      
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

      // 处理每个课程
      for (const lessonData of lessons) {
        const { lesson: lessonNumber, words } = lessonData;
        
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

        createdLessons.push({
          lessonNumber,
          wordCount: words.length
        });

        // 批量插入单词
        const wordRecords = words.map(word => ({
          lessonId: lesson.id,
          english: word.en,
          chinese: word.cn
        }));

        await Word.bulkCreate(wordRecords, {
          transaction,
          ignoreDuplicates: true // 忽略重复的单词
        });

        totalWords += words.length;
      }

      await transaction.commit();

      const result = {
        category: categoryName,
        categoryId: category.id,
        lessonsCreated: createdLessons.length,
        totalWords,
        lessons: createdLessons
      };

      logger.info(`JSON 导入成功: ${categoryName}, ${createdLessons.length} 个课程, ${totalWords} 个单词`);
      return result;
    } catch (error) {
      await transaction.rollback();
      logger.error('JSON 导入失败:', error);
      throw error;
    }
  }

  /**
   * 从文件导入数据
   * @param {string} filePath - JSON 文件路径
   * @returns {Promise<Object>} 导入结果
   */
  async importFromFile(filePath) {
    try {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return await this.importFromJSON(data);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('JSON 文件格式错误');
      }
      throw error;
    }
  }
}

export default new ImportService();
