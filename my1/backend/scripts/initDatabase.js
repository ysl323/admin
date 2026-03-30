import dotenv from 'dotenv';
import {
  syncDatabase,
  validateDatabaseSchema,
  getDatabaseSchema,
  generateSchemaReport
} from '../src/utils/dbSync.js';
import logger from '../src/utils/logger.js';

// 加载环境变量
dotenv.config();

async function initDatabase() {
  try {
    console.log('================================');
    console.log('数据库初始化脚本');
    console.log('================================\n');

    // 1. 同步数据库
    console.log('步骤 1: 同步数据库表结构...');
    await syncDatabase({ alter: true });
    console.log('✅ 数据库同步完成\n');

    // 2. 验证表结构
    console.log('步骤 2: 验证数据库表结构...');
    await validateDatabaseSchema();
    console.log('✅ 表结构验证通过\n');

    // 3. 生成 schema 报告
    console.log('步骤 3: 生成数据库结构报告...');
    const schema = await getDatabaseSchema();
    const report = generateSchemaReport(schema);
    console.log(report);

    console.log('\n================================');
    console.log('✅ 数据库初始化成功！');
    console.log('================================\n');

    process.exit(0);
  } catch (error) {
    console.error('\n================================');
    console.error('❌ 数据库初始化失败！');
    console.error('================================\n');
    console.error('错误信息:', error.message);
    logger.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

initDatabase();
