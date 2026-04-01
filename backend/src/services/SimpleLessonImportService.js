import Joi from 'joi';
import { Category, Lesson, Word, sequelize } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * 简化课程导入服务
 * 支持两种格式：
 * 1. 简化格式：[{lesson?, question, english, chinese, phonetic?}]
 * 2. 导出格式：[{category, lessons: [{lesson, words: [{en, cn, phonetic}]}]}]
 */
class SimpleLessonImportService {
  /**
   * 检测数据格式类型
   * @returns {'export'|'simple'} 格式类型
   */
  detectFormat(data) {
    // 如果是数组且第一个元素有 category 和 lessons 字段，则是导出格式
    if (Array.isArray(data) && data.length > 0 && data[0].category && data[0].lessons) {
      return 'export';
    }
    return 'simple';
  }

  /**
   * 导出格式的 Schema
   * 格式：[{category, lessons: [{lesson, words: [{en, cn, phonetic?}]}]}]
   */
  getExportFormatSchema() {
    return Joi.array().items(
      Joi.object({
        category: Joi.string().required(),
        lessons: Joi.array().items(
          Joi.object({
            lesson: Joi.number().integer().positive().required(),
            words: Joi.array().items(
              Joi.object({
                en: Joi.string().required(),
                cn: Joi.string().required(),
                phonetic: Joi.string().allow('').optional()
              })
            ).min(1).required()
          })
        ).min(1).required()
      })
    ).min(1);
  }

  /**
   * 简化格式的 Schema
   * 格式：[{lesson?, question, english, chinese, phonetic?}]
   */
  getImportSchema() {
    return Joi.array().items(
      Joi.object({
        lesson: Joi.number().integer().positive().optional(),
        question: Joi.number().integer().positive().required(),
        english: Joi.string().required(),
        chinese: Joi.string().required(),
        phonetic: Joi.string().allow('').optional()
      })
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
   * 支持两种格式：
   * 1. 简化格式：[{lesson?, question, english, chinese}]
   * 2. 导出格式：[{category, lessons: [{lesson, words: [{en, cn, phonetic}]}]}]
   * @param {Array} data - JSON 数组数据
   * @param {string} categoryName - 分类名称（简化格式时使用）
   * @returns {Promise<Object>} 导入结果
   */
  async importFromJSON(data, categoryName) {
    // 检测格式类型
    const formatType = this.detectFormat(data);

    if (formatType === 'export') {
      // 导出格式：逐个分类导入
      return await this.importExportFormat(data);
    } else {
      // 简化格式：按原逻辑处理
      return await this.importSimpleFormat(data, categoryName);
    }
  }

  /**
   * 导入导出格式的数据
   * @param {Array} data - 导出格式数据
   */
  async importExportFormat(data) {
    // 验证格式
    const schema = this.getExportFormatSchema();
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      throw new Error(`导出格式验证失败: ${error.details[0].message}`);
    }

    const results = [];
    let totalLessons = 0;
    let totalWords = 0;

    for (const categoryData of data) {
      const result = await this.importCategoryFromExportFormat(categoryData);
      results.push(result);
      totalLessons += result.lessonsCreated;
      totalWords += result.totalWords;
    }

    return {
      success: true,
      message: `成功导入 ${results.length} 个分类，${totalLessons} 个课程，${totalWords} 个单词`,
      results
    };
  }

  /**
   * 从导出格式导入单个分类
   */
  async importCategoryFromExportFormat(categoryData) {
    const { category: categoryName, lessons } = categoryData;
    const transaction = await sequelize.transaction();

    try {
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

      const createdLessons = [];
      let totalWords = 0;

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

        // 批量插入单词
        const wordRecords = words.map(word => ({
          lessonId: lesson.id,
          english: word.en,
          chinese: word.cn,
          phonetic: word.phonetic || null
        }));

        await Word.bulkCreate(wordRecords, {
          transaction,
          ignoreDuplicates: true
        });

        totalWords += words.length;
        createdLessons.push({
          lessonNumber,
          wordCount: words.length
        });
      }

      await transaction.commit();

      logger.info(`导入分类成功: ${categoryName}, ${createdLessons.length} 个课程, ${totalWords} 个单词`);

      return {
        category: categoryName,
        categoryId: category.id,
        lessonsCreated: createdLessons.length,
        totalWords,
        lessons: createdLessons
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * 导入简化格式的数据
   * @param {Array} data - 简化格式数据
   * @param {string} categoryName - 分类名称
   */
  async importSimpleFormat(data, categoryName) {
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
            chinese: item.chinese,
            phonetic: item.phonetic || null
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
          chinese: item.chinese,
          phonetic: item.phonetic || null
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
