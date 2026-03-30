/**
 * 创建 word_mastery 表的迁移脚本
 * 运行方式: node src/migrations/createWordMasteryTable.js
 */

const { sequelize } = require('../models');

async function createWordMasteryTable() {
  try {
    console.log('开始创建 word_mastery 表...');

    // 使用 Sequelize 的 sync 方法创建表
    const { WordMastery } = require('../models');

    await WordMastery.sync({ alter: true });

    console.log('word_mastery 表创建成功！');

    // 验证表结构
    const tableInfo = await WordMastery.describe();
    console.log('\n表结构:', JSON.stringify(tableInfo, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('创建 word_mastery 表失败:', error);
    process.exit(1);
  }
}

createWordMasteryTable();
