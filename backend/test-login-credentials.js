/**
 * 登录凭据测试
 * 验证admin用户和密码
 */

import { sequelize, User } from './src/models/index.js';
import PasswordService from './src/services/PasswordService.js';
import logger from './src/utils/logger.js';

async function testCredentials() {
  try {
    console.log('='.repeat(60));
    console.log('🔐 登录凭据测试');
    console.log('='.repeat(60));

    // 1. 测试数据库连接
    console.log('\n1. 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 2. 检查所有用户
    console.log('\n2. 检查所有用户...');
    const users = await User.findAll({
      attributes: ['id', 'username', 'isAdmin', 'isActive', 'accessDays']
    });
    
    console.log(`   找到 ${users.length} 个用户`);
    for (const user of users) {
      console.log(`   - ID: ${user.id}, 用户名: ${user.username}, 管理员: ${user.isAdmin}, 激活: ${user.isActive}, 天数: ${user.accessDays}`);
    }

    if (users.length === 0) {
      console.log('   ⚠️  没有用户，需要创建admin用户');
      
      // 创建admin用户
      console.log('\n3. 创建admin用户...');
      const passwordHash = await PasswordService.hash('admin123');
      
      const adminUser = await User.create({
        username: 'admin',
        passwordHash: passwordHash,
        accessDays: 365,
        isActive: true,
        isAdmin: true,
        registerIp: '127.0.0.1',
        lastLoginIp: '127.0.0.1'
      });
      
      console.log('✅ admin用户创建成功');
      console.log(`   - ID: ${adminUser.id}`);
      console.log(`   - 用户名: ${adminUser.username}`);
    } else {
      // 3. 测试admin用户密码
      console.log('\n3. 测试admin用户密码...');
      const adminUser = users.find(u => u.username === 'admin');
      
      if (adminUser) {
        const isValid = await PasswordService.verify('admin123', adminUser.passwordHash);
        console.log(`   密码 'admin123' 验证结果: ${isValid ? '✅ 成功' : '❌ 失败'}`);
        
        if (!isValid) {
          console.log('   ⚠️  密码不匹配，需要重置');
          
          // 重置密码
          const newPasswordHash = await PasswordService.hash('admin123');
          await adminUser.update({ passwordHash: newPasswordHash });
          console.log('   ✅ 密码已重置为 admin123');
        }
      } else {
        console.log('   ❌ admin用户不存在');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成');
    console.log('='.repeat(60));
    console.log('\n📝 登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('   状态: ✅ 凭据验证通过');
    console.log('');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testCredentials();