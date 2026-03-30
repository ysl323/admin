import { Category, Lesson, Word, Config } from '../models/index.js';
import { sequelize } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * 管理员服务类
 * 提供内容管理功能（分类、课程、单词的增删改）
 */
class AdminService {
  // ==================== 分类管理 ====================

  /**
   * 创建分类
   * @param {string} name - 分类名称
   * @returns {Promise<Object>} 创建的分类
   */
  async createCategory(name) {
    try {
      // 检查分类名称是否已存在
      const existing = await Category.findOne({ where: { name } });
      if (existing) {
        throw new Error('分类名称已存在');
      }

      const category = await Category.create({ name });
      logger.info(`创建分类: ${name}`, { categoryId: category.id });
      return category;
    } catch (error) {
      logger.error('创建分类失败:', error);
      throw error;
    }
  }

  /**
   * 更新分类
   * @param {number} id - 分类ID
   * @param {string} name - 新的分类名称
   * @returns {Promise<Object>} 更新后的分类
   */
  async updateCategory(id, name) {
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 检查新名称是否与其他分类重复
      const existing = await Category.findOne({
        where: { name },
        attributes: ['id']
      });
      if (existing && existing.id !== id) {
        throw new Error('分类名称已存在');
      }

      category.name = name;
      await category.save();

      logger.info(`更新分类 ${id}: ${name}`);
      return category;
    } catch (error) {
      logger.error(`更新分类 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 删除分类（级联删除所有课程和单词）
   * @param {number} id - 分类ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteCategory(id) {
    const transaction = await sequelize.transaction();
    
    try {
      const category = await Category.findByPk(id, { transaction });
      if (!category) {
        await transaction.rollback();
        throw new Error('分类不存在');
      }

      // 统计将被删除的课程和单词数量
      const lessons = await Lesson.findAll({
        where: { categoryId: id },
        attributes: ['id'],
        transaction
      });
      const lessonIds = lessons.map(l => l.id);
      
      let wordCount = 0;
      if (lessonIds.length > 0) {
        wordCount = await Word.count({
          where: { lessonId: lessonIds },
          transaction
        });
      }

      // 删除分类（级联删除会自动处理课程和单词）
      await category.destroy({ transaction });
      await transaction.commit();

      logger.info(`删除分类 ${id}: ${category.name}`, {
        deletedLessons: lessons.length,
        deletedWords: wordCount
      });

      return {
        categoryName: category.name,
        deletedLessons: lessons.length,
        deletedWords: wordCount
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`删除分类 ${id} 失败:`, error);
      throw error;
    }
  }

  // ==================== 课程管理 ====================

  /**
   * 创建课程
   * @param {number} categoryId - 分类ID
   * @param {number} lessonNumber - 课程编号
   * @returns {Promise<Object>} 创建的课程
   */
  async createLesson(categoryId, lessonNumber) {
    try {
      // 验证分类是否存在
      const category = await Category.findByPk(categoryId);
      if (!category) {
        throw new Error('分类不存在');
      }

      // 检查课程编号是否已存在
      const existing = await Lesson.findOne({
        where: { categoryId, lessonNumber }
      });
      if (existing) {
        throw new Error('该分类下的课程编号已存在');
      }

      const lesson = await Lesson.create({ categoryId, lessonNumber });
      logger.info(`创建课程: 分类 ${categoryId}, 课程 ${lessonNumber}`, {
        lessonId: lesson.id
      });
      return lesson;
    } catch (error) {
      logger.error('创建课程失败:', error);
      throw error;
    }
  }

  /**
   * 更新课程
   * @param {number} id - 课程ID
   * @param {number} lessonNumber - 新的课程编号
   * @returns {Promise<Object>} 更新后的课程
   */
  async updateLesson(id, lessonNumber) {
    try {
      const lesson = await Lesson.findByPk(id);
      if (!lesson) {
        throw new Error('课程不存在');
      }

      // 检查新编号是否与同分类下的其他课程重复
      const existing = await Lesson.findOne({
        where: {
          categoryId: lesson.categoryId,
          lessonNumber
        }
      });
      if (existing && existing.id !== id) {
        throw new Error('该分类下的课程编号已存在');
      }

      lesson.lessonNumber = lessonNumber;
      await lesson.save();

      logger.info(`更新课程 ${id}: 编号 ${lessonNumber}`);
      return lesson;
    } catch (error) {
      logger.error(`更新课程 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 删除课程（级联删除所有单词）
   * @param {number} id - 课程ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteLesson(id) {
    const transaction = await sequelize.transaction();
    
    try {
      const lesson = await Lesson.findByPk(id, { transaction });
      if (!lesson) {
        await transaction.rollback();
        throw new Error('课程不存在');
      }

      // 统计将被删除的单词数量
      const wordCount = await Word.count({
        where: { lessonId: id },
        transaction
      });

      // 删除课程（级联删除会自动处理单词）
      await lesson.destroy({ transaction });
      await transaction.commit();

      logger.info(`删除课程 ${id}`, {
        lessonNumber: lesson.lessonNumber,
        deletedWords: wordCount
      });

      return {
        lessonNumber: lesson.lessonNumber,
        deletedWords: wordCount
      };
    } catch (error) {
      await transaction.rollback();
      logger.error(`删除课程 ${id} 失败:`, error);
      throw error;
    }
  }

  // ==================== 单词管理 ====================

  /**
   * 获取所有单词（带课程和分类信息）
   * @returns {Promise<Array>} 单词列表
   */
  async getAllWords() {
    try {
      const words = await Word.findAll({
        include: [
          {
            model: Lesson,
            as: 'lesson',
            required: false,
            attributes: ['id', 'lessonNumber', 'categoryId'],
            include: [
              {
                model: Category,
                as: 'category',
                required: false,
                attributes: ['id', 'name']
              }
            ]
          }
        ],
        order: [['id', 'ASC']]
      });

      return words.map(word => {
        const lesson = word.lesson;
        const category = lesson?.category;
        
        return {
          id: word.id,
          english: word.english,
          chinese: word.chinese,
          lessonId: word.lessonId,
          lessonInfo: (lesson && category)
            ? `${category.name} - 第${lesson.lessonNumber}课`
            : '未知课程',
          categoryId: lesson?.categoryId || null,
          categoryName: category?.name || '未知分类',
          lessonNumber: lesson?.lessonNumber || null
        };
      });
    } catch (error) {
      logger.error('获取单词列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建单词
   * @param {Object} data - 单词数据 { lessonId, english, chinese }
   * @returns {Promise<Object>} 创建的单词
   */
  async createWord(data) {
    try {
      const { lessonId, english, chinese } = data;

      // 验证课程是否存在
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        throw new Error('课程不存在');
      }

      const word = await Word.create({ lessonId, english, chinese });
      logger.info(`创建单词: ${english} (${chinese})`, { wordId: word.id });
      return word;
    } catch (error) {
      logger.error('创建单词失败:', error);
      throw error;
    }
  }

  /**
   * 更新单词
   * @param {number} id - 单词ID
   * @param {Object} data - 单词数据 { lessonId, english, chinese }
   * @returns {Promise<Object>} 更新后的单词
   */
  async updateWord(id, data) {
    try {
      const word = await Word.findByPk(id);
      if (!word) {
        throw new Error('单词不存在');
      }

      const { lessonId, english, chinese } = data;

      // 如果更新了课程ID，验证课程是否存在
      if (lessonId && lessonId !== word.lessonId) {
        const lesson = await Lesson.findByPk(lessonId);
        if (!lesson) {
          throw new Error('课程不存在');
        }
        word.lessonId = lessonId;
      }

      if (english) word.english = english;
      if (chinese) word.chinese = chinese;

      await word.save();
      logger.info(`更新单词 ${id}: ${english} (${chinese})`);
      return word;
    } catch (error) {
      logger.error(`更新单词 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 删除单词
   * @param {number} id - 单词ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteWord(id) {
    try {
      const word = await Word.findByPk(id);
      if (!word) {
        throw new Error('单词不存在');
      }

      const wordInfo = { english: word.english, chinese: word.chinese };
      await word.destroy();

      logger.info(`删除单词 ${id}: ${wordInfo.english} (${wordInfo.chinese})`);
      return wordInfo;
    } catch (error) {
      logger.error(`删除单词 ${id} 失败:`, error);
      throw error;
    }
  }

  /**
   * 获取所有分类（带课程数量）
   * @returns {Promise<Array>} 分类列表
   */
  async getAllCategories() {
    try {
      const categories = await Category.findAll({
        include: [
          {
            model: Lesson,
            as: 'lessons',
            attributes: ['id']
          }
        ],
        order: [['id', 'ASC']]
      });

      return categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        lessonCount: cat.lessons ? cat.lessons.length : 0
      }));
    } catch (error) {
      logger.error('获取分类列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有课程（带分类名称和单词数量）
   * @returns {Promise<Array>} 课程列表
   */
  async getAllLessons() {
    try {
      const lessons = await Lesson.findAll({
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: Word,
            as: 'words',
            attributes: ['id']
          }
        ],
        order: [['categoryId', 'ASC'], ['lessonNumber', 'ASC']]
      });

      return lessons.map(lesson => ({
        id: lesson.id,
        categoryId: lesson.categoryId,
        categoryName: lesson.category ? lesson.category.name : '未知分类',
        lessonNumber: lesson.lessonNumber,
        wordCount: lesson.words ? lesson.words.length : 0
      }));
    } catch (error) {
      logger.error('获取课程列表失败:', error);
      throw error;
    }
  }

  // ==================== TTS 配置管理 ====================

  /**
   * 获取TTS配置
   * @returns {Promise<Object>} TTS配置
   */
  async getTTSConfig() {
    try {
      const configs = await Config.findAll({
        where: {
          key: [
            'tts_provider',
            'volcengine_app_id',
            'volcengine_api_key',
            'volcengine_api_secret',
            'volcengine_endpoint',
            'volcengine_voice_type',
            'volcengine_language',
            'volcengine_cluster',
            'volcengine_mode',
            'google_api_key',
            'google_language_code',
            'google_voice_name',
            'google_speaking_rate'
          ]
        }
      });

      const configMap = {};
      configs.forEach(config => {
        configMap[config.key] = config.value;
      });

      // 尝试解密敏感信息（如果加密了的话）
      // 注意：Access Token 通常不需要加密，因为它是临时的
      const encryptionUtil = (await import('../utils/encryption.js')).default;
      
      // 辅助函数：尝试解密，如果失败则返回原值
      const tryDecrypt = (value) => {
        if (!value) return '';
        // 检查是否是加密格式（包含冒号分隔的 iv:data）
        if (value.includes(':') && value.split(':').length === 2) {
          try {
            return encryptionUtil.decrypt(value);
          } catch (error) {
            logger.warn('解密失败，使用原始值:', error.message);
            return value;
          }
        }
        // 不是加密格式，直接返回
        return value;
      };
      
      return {
        provider: configMap.tts_provider || 'volcengine',
        volcengine: {
          appId: configMap.volcengine_app_id || '',
          apiKey: tryDecrypt(configMap.volcengine_api_key),
          apiSecret: tryDecrypt(configMap.volcengine_api_secret),
          endpoint: configMap.volcengine_endpoint || 'https://openspeech.bytedance.com/api/v1/tts',
          voiceType: configMap.volcengine_voice_type || 'BV001_streaming',
          language: configMap.volcengine_language || 'zh-CN',
          cluster: configMap.volcengine_cluster || 'volcano_tts',
          mode: configMap.volcengine_mode || 'simple'
        },
        google: {
          apiKey: tryDecrypt(configMap.google_api_key),
          languageCode: configMap.google_language_code || 'en-US',
          voiceName: configMap.google_voice_name || 'en-US-Wavenet-D',
          speakingRate: parseFloat(configMap.google_speaking_rate || '1.0')
        }
      };
    } catch (error) {
      logger.error('获取TTS配置失败:', error);
      throw new Error('获取TTS配置失败');
    }
  }

  /**
   * 保存TTS配置
   * @param {string} provider - TTS提供商 (volcengine/google)
   * @param {Object} config - TTS配置
   * @returns {Promise<void>}
   */
  async saveTTSConfig(provider, config) {
    const transaction = await sequelize.transaction();
    
    try {
      let configData = [];

      if (provider === 'volcengine') {
        // 注意：Access Token 是临时的，不需要加密
        // 只有长期的 API Secret 才需要加密
        configData = [
          { key: 'tts_provider', value: 'volcengine' },
          { key: 'volcengine_app_id', value: config.appId || '' },
          { key: 'volcengine_api_key', value: config.apiKey || '' },  // 不加密
          { key: 'volcengine_api_secret', value: config.apiSecret || '' },  // 不加密（如果需要的话）
          { key: 'volcengine_endpoint', value: config.endpoint || 'https://openspeech.bytedance.com/api/v1/tts' },
          { key: 'volcengine_voice_type', value: config.voiceType || 'BV001_streaming' },
          { key: 'volcengine_language', value: config.language || 'zh-CN' },
          { key: 'volcengine_cluster', value: config.cluster || 'volcano_tts' },
          { key: 'volcengine_mode', value: config.mode || 'simple' }
        ];
      } else if (provider === 'google') {
        configData = [
          { key: 'google_api_key', value: config.apiKey || '' },  // 不加密
          { key: 'google_language_code', value: config.languageCode || 'en-US' },
          { key: 'google_voice_name', value: config.voiceName || 'en-US-Wavenet-D' },
          { key: 'google_speaking_rate', value: String(config.speakingRate || 1.0) }
        ];
      }

      for (const item of configData) {
        await Config.upsert(item, { transaction });
      }

      await transaction.commit();
      logger.info(`TTS配置保存成功: ${provider}`);
    } catch (error) {
      await transaction.rollback();
      logger.error('保存TTS配置失败:', error);
      throw new Error('保存TTS配置失败');
    }
  }
}

export default new AdminService();
