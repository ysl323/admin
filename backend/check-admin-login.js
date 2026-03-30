/**
 * 验证admin用户可以登录
 */

import { sequelize, User } from './src/models/index.js';
import { QueryTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

async function verifyAdminLogin() {
  try {
    console.log('='.repeat(60));
    console.log('🔐 验证admin用户登录');
    console.log('='.repeat(60));

    // 1. 测试数据库连接
    console.log('\n1. 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 2. 获取admin用户密码哈希
    console.log('\n2. 获取admin用户密码哈希...');
    const users = await sequelize.query(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      {
        replacements: ['admin'],
        type: QueryTypes.SELECT
      }
    );
    
    if (users.length === 0) {
      console.log('❌ admin用户不存在');
      process.exit(1);
    }

    const adminUser = users[0];
    console.log(`   - ID: ${adminUser.id}`);
    console.log(`   - 用户名: ${adminUser.username}`);
    console.log(`   - 密码哈希: ${adminUser.password_hash.substring(0, 30)}...`);

    // 3. 验证密码
    console.log('\n3. 验证密码...');
    const isValid = await bcrypt.compare('admin123', adminUser.password_hash);
    console.log(`   密码 'admin123' 验证结果: ${isValid ? '✅ 成功' : '❌ 失败'}`);

    if (!isValid) {
      console.log('   ⚠️  密码不匹配，尝试重置...');
      const newHash = await bcrypt.hash('admin123', 10);
      await sequelize.query(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        {
          replacements: [newHash, 'admin'],
          type: QueryTypes.UPDATE
        }
      );
      console.log('   ✅ 密码已重置');
    }

    // 4. 再次验证
    console.log('\n4. 再次验证密码...');
    const updatedUsers = await sequelize.query(
      'SELECT password_hash FROM users WHERE username = ?',
      {
        replacements: ['admin'],
        type: QueryTypes.SELECT
      }
    );
    
    const isValidAgain = await bcrypt.compare('admin123', updatedUsers[0].password_hash);
    console.log(`   密码 'admin123' 验证结果: ${isValidAgain ? '✅ 成功' : '❌ 失败'}`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 验证完成');
    console.log('='.repeat(60));
    console.log('\n📝 登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log(`   状态: ${isValidAgain ? '✅ 可以登录' : '❌ 无法登录'}`);
    console.log('');

  } catch (error) {
    console.error('❌ 验证失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

verifyAdminLogin();