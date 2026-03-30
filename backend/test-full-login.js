import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import bcrypt from 'bcryptjs';
import { User } from './src/models/index.js';

async function testFullLogin() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    const username = 'admin';
    const password = 'admin123';

    console.log(`🔍 测试登录流程`);
    console.log(`   用户名: ${username}`);
    console.log(`   密码: ${password}\n`);

    // 1. 查找用户
    const user = await User.findOne({
      where: { username, isActive: true }
    });

    if (!user) {
      console.log('❌ 用户不存在或已被禁用');
      return;
    }

    console.log('✅ 用户存在');
    console.log(`   ID: ${user.id}`);
    console.log(`   管理员: ${user.isAdmin ? '是' : '否'}`);
    console.log(`   超级管理员: ${user.isSuperAdmin ? '是' : '否'}`);
    console.log(`   状态: ${user.isActive ? '正常' : '禁用'}`);
    console.log(`   到期时间: ${user.expireDate ? user.expireDate.toLocaleDateString() : '永久'}`);

    // 2. 检查是否过期
    if (user.expireDate && new Date() > user.expireDate) {
      console.log('❌ 账户已过期');
      return;
    }

    console.log('✅ 账户有效');

    // 3. 验证密码
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (isValid) {
      console.log('\n🎉 登录成功！');
      console.log(`   Session数据:`);
      console.log(`     userId: ${user.id}`);
      console.log(`     isAdmin: ${user.isAdmin}`);
      console.log(`     isSuperAdmin: ${user.isSuperAdmin}`);
    } else {
      console.log('\n❌ 密码错误');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

testFullLogin();
