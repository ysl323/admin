import { sequelize, User, Category, Lesson, Word, Config, AudioCache } from '../models/index.js';
import logger from './logger.js';

/**
 * 同步数据库表结构
 * @param {Object} options - Sequelize sync 选项
 */
export async function syncDatabase(options = {}) {
  try {
    logger.info('开始同步数据库...');

    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    // 同步所有模型
    await sequelize.sync(options);

    logger.info('数据库同步完成');
    logger.info('已创建/更新的表:');
    logger.info('- users (用户表)');
    logger.info('- categories (分类表)');
    logger.info('- lessons (课程表)');
    logger.info('- words (单词表)');
    logger.info('- config (配置表)');
    logger.info('- audio_caches (音频缓存表)');

    return true;
  } catch (error) {
    logger.error('数据库同步失败:', error);
    throw error;
  }
}

/**
 * 获取数据库表结构信息
 */
export async function getDatabaseSchema() {
  try {
    const schema = {
      users: await sequelize.getQueryInterface().describeTable('users'),
      categories: await sequelize.getQueryInterface().describeTable('categories'),
      lessons: await sequelize.getQueryInterface().describeTable('lessons'),
      words: await sequelize.getQueryInterface().describeTable('words'),
      config: await sequelize.getQueryInterface().describeTable('config'),
      audio_caches: await sequelize.getQueryInterface().describeTable('audio_caches')
    };

    return schema;
  } catch (error) {
    logger.error('获取数据库结构失败:', error);
    throw error;
  }
}

/**
 * 验证数据库表结构
 */
export async function validateDatabaseSchema() {
  try {
    logger.info('验证数据库表结构...');

    const schema = await getDatabaseSchema();

    // 验证 users 表
    const requiredUserFields = [
      'id',
      'username',
      'password_hash',
      'access_days',
      'is_active',
      'is_admin',
      'created_at',
      'updated_at'
    ];

    for (const field of requiredUserFields) {
      if (!schema.users[field]) {
        throw new Error(`users 表缺少字段: ${field}`);
      }
    }

    // 验证 categories 表
    const requiredCategoryFields = ['id', 'name', 'created_at', 'updated_at'];
    for (const field of requiredCategoryFields) {
      if (!schema.categories[field]) {
        throw new Error(`categories 表缺少字段: ${field}`);
      }
    }

    // 验证 lessons 表
    const requiredLessonFields = [
      'id',
      'category_id',
      'lesson_number',
      'created_at',
      'updated_at'
    ];
    for (const field of requiredLessonFields) {
      if (!schema.lessons[field]) {
        throw new Error(`lessons 表缺少字段: ${field}`);
      }
    }

    // 验证 words 表
    const requiredWordFields = [
      'id',
      'lesson_id',
      'english',
      'chinese',
      'audio_cache_url',
      'created_at'
    ];
    for (const field of requiredWordFields) {
      if (!schema.words[field]) {
        throw new Error(`words 表缺少字段: ${field}`);
      }
    }

    // 验证 config 表
    const requiredConfigFields = ['id', 'key', 'value', 'created_at', 'updated_at'];
    for (const field of requiredConfigFields) {
      if (!schema.config[field]) {
        throw new Error(`config 表缺少字段: ${field}`);
      }
    }

    logger.info('✅ 数据库表结构验证通过');
    return true;
  } catch (error) {
    logger.error('❌ 数据库表结构验证失败:', error);
    throw error;
  }
}

/**
 * 生成数据库 schema 报告
 */
export function generateSchemaReport(schema) {
  const report = [];

  report.push('='.repeat(80));
  report.push('数据库表结构报告');
  report.push('='.repeat(80));
  report.push('');

  for (const [tableName, fields] of Object.entries(schema)) {
    report.push(`表名: ${tableName}`);
    report.push('-'.repeat(80));

    for (const [fieldName, fieldInfo] of Object.entries(fields)) {
      const nullable = fieldInfo.allowNull ? 'NULL' : 'NOT NULL';
      const defaultValue = fieldInfo.defaultValue ? `DEFAULT ${fieldInfo.defaultValue}` : '';
      report.push(
        `  ${fieldName.padEnd(20)} ${fieldInfo.type.padEnd(20)} ${nullable.padEnd(10)} ${defaultValue}`
      );
    }

    report.push('');
  }

  report.push('='.repeat(80));

  return report.join('\n');
}
