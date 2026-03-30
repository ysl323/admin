/**
 * 登录功能测试脚本
 * 测试登录流程并创建admin用户
 */

import { sequelize, User } from './src/models/index.js';
import PasswordService from './src/services/PasswordService.js';
import AuthService from './src/services/AuthService.js';
import logger from './src/utils/logger.js';

async function testLogin() {
  try {
    console.log('='.repeat(60));
    console.log('🔐 登录功能测试');
    console.log('='.repeat(60));

    // 1. 测试数据库连接
    console.log('\n1. 测试数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 2. 检查admin用户是否存在
    console.log('\n2. 检查admin用户...');
    let adminUser = await User.findOne({ where: { username: 'admin' } });
    
    if (adminUser) {
      console.log('✅ admin用户已存在');
      console.log(`   - 用户ID: ${adminUser.id}`);
      console.log(`   - 用户名: ${adminUser.username}`);
      console.log(`   - 是否管理员: ${adminUser.isAdmin}`);
      console.log(`   - 是否激活: ${adminUser.isActive}`);
      console.log(`   - 访问天数: ${adminUser.accessDays}`);
      console.log(`   - 密码哈希: ${adminUser.passwordHash.substring(0, 20)}...`);
    } else {
      console.log('❌ admin用户不存在，需要创建');
      
      // 3. 创建admin用户
      console.log('\n3. 创建admin用户...');
      const passwordHash = await PasswordService.hash('admin123');
      
      adminUser = await User.create({
        username: 'admin',
        passwordHash: passwordHash,
        accessDays: 365, // 管理员全年访问
        isActive: true,
        isAdmin: true,
        registerIp: '127.0.0.1',
        lastLoginIp: '127.0.0.1'
      });
      
      console.log('✅ admin用户创建成功');
      console.log(`   - 用户ID: ${adminUser.id}`);
      console.log(`   - 用户名: ${adminUser.username}`);
    }

    // 4. 测试密码验证
    console.log('\n4. 测试密码验证...');
    const isPasswordValid = await PasswordService.verify('admin123', adminUser.passwordHash);
    console.log(`   密码 'admin123' 验证结果: ${isPasswordValid ? '✅ 成功' : '❌ 失败'}`);

    // 5. 测试登录流程
    console.log('\n5. 测试登录流程...');
    try {
      const loginResult = await AuthService.login('admin', 'admin123', '127.0.0.1');
      console.log('✅ 登录成功');
      console.log(`   - 用户ID: ${loginResult.user.id}`);
      console.log(`   - 用户名: ${loginResult.user.username}`);
      console.log(`   - 是否管理员: ${loginResult.user.isAdmin}`);
    } catch (error) {
      console.log(`❌ 登录失败: ${error.message}`);
    }

    // 6. 测试错误密码
    console.log('\n6. 测试错误密码...');
    try {
      await AuthService.login('admin', 'wrongpassword', '127.0.0.1');
      console.log('❌ 应该抛出错误但没有');
    } catch (error) {
      console.log(`✅ 错误密码验证成功: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('测试完成');
    console.log('='.repeat(60));
    console.log('\n📝 登录信息:');
    console.log('   用户名: admin');
    console.log('   密码: admin123');
    console.log('');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testLogin();