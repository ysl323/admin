import dotenv from 'dotenv';
import { syncDatabase } from './src/utils/dbSync.js';
import logger from './src/utils/logger.js';

// 加载环境变量
dotenv.config();

/**
 * 同步数据库脚本
 * 用于创建或更新数据库表结构
 */
async function main() {
  try {
    logger.info('开始同步数据库表结构...');
    
    // 使用 alter: true 来更新现有表结构，不会删除数据
    await syncDatabase({ alter: true });
    
    logger.info('✅ 数据库同步成功！');
    logger.info('所有表已创建/更新，包括 audio_caches 表');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ 数据库同步失败:', error);
    process.exit(1);
  }
}

main();
