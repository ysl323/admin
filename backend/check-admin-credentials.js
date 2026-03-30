/**
 * 检查admin用户密码哈希
 */

import { sequelize, User } from './src/models/index.js';
import { QueryTypes } from 'sequelize';

async function checkAdminPassword() {
  try {
    console.log('='.repeat(60));
    console.log('🔐 检查admin用户密码哈希');
    console.log('='.repeat(60));

    // 1. 测试数据库连接
    console.log('\n1. 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 2. 直接查询数据库
    console.log('\n2. 直接查询数据库...');
    const users = await sequelize.query(
      'SELECT id, username, password_hash, is_admin, is_active, access_days FROM users WHERE username = ?',
      {
        replacements: ['admin'],
        type: QueryTypes.SELECT
      }
    );
    
    console.log(`   找到 ${users.length} 个用户`);
    for (const user of users) {
      console.log(`   - ID: ${user.id}`);
      console.log(`   - 用户名: ${user.username}`);
      console.log(`   - 密码哈希: ${user.password_hash ? user.password_hash.substring(0, 30) + '...' : '❌ NULL'}`);
      console.log(`   - 管理员: ${user.is_admin}`);
      console.log(`   - 激活: ${user.is_active}`);
      console.log(`   - 天数: ${user.access_days}`);
    }

    if (users.length > 0 && !users[0].password_hash) {
      console.log('\n⚠️  发现问题: admin用户的密码哈希为NULL');
      console.log('   需要重置密码...');
      
      // 使用原始SQL重置密码
      const bcrypt = await import('bcryptjs');
      const saltRounds = 10;
      const newHash = await bcrypt.hash('admin123', saltRounds);
      
      await sequelize.query(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        {
          replacements: [newHash, 'admin'],
          type: QueryTypes.UPDATE
        }
      );
      
      console.log('✅ 密码已重置');
      
      // 验证
      const updatedUsers = await sequelize.query(
        'SELECT id, username, password_hash FROM users WHERE username = ?',
        {
          replacements: ['admin'],
          type: QueryTypes.SELECT
        }
      );
      
      console.log('\n   验证结果:');
      console.log(`   - 密码哈希: ${updatedUsers[0].password_hash ? updatedUsers[0].password_hash.substring(0, 30) + '...' : '❌ 仍为NULL'}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 检查完成');
    console.log('='.repeat(60));
    console.log('\n📝 登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('');

  } catch (error) {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkAdminPassword();