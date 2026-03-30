import { sequelize } from './src/models/index.js';
import User from './src/models/User.js';
import bcryptjs from 'bcryptjs';

async function testAdminPassword() {
  try {
    await sequelize.sync();
    
    // 查找管理员用户
    const admin = await User.findOne({ where: { username: 'admin' } });
    if (!admin) {
      console.log('❌ 未找到管理员用户');
      return;
    }
    
    console.log('✅ 找到管理员用户');
    console.log('用户ID:', admin.id);
    console.log('用户名:', admin.username);
    console.log('是否管理员:', admin.isAdmin);
    console.log('是否激活:', admin.isActive);
    console.log('访问天数:', admin.accessDays);
    
    // 测试密码验证
    const testPassword = 'admin123';
    console.log('\n测试密码验证...');
    console.log('测试密码:', testPassword);
    console.log('存储的哈希:', admin.passwordHash);
    
    const isValid = await bcryptjs.compare(testPassword, admin.passwordHash);
    console.log('密码验证结果:', isValid ? '✅ 正确' : '❌ 错误');
    
    if (!isValid) {
      console.log('\n重新设置管理员密码...');
      const newHash = await bcryptjs.hash('admin123', 10);
      await admin.update({ passwordHash: newHash });
      console.log('✅ 密码已重置');
      
      // 再次验证
      const isValidAfterReset = await bcryptjs.compare('admin123', newHash);
      console.log('重置后验证结果:', isValidAfterReset ? '✅ 正确' : '❌ 错误');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    process.exit();
  }
}

testAdminPassword();