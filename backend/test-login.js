import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import { User } from './src/models/index.js';
import bcrypt from 'bcryptjs';

async function testLogin() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 测试用户名和密码
    const testCredentials = [
      { username: 'admin', password: 'admin123' },
      { username: 'testuser', password: 'testuser123' }
    ];

    for (const creds of testCredentials) {
      console.log(`🔍 测试登录: ${creds.username}`);
      
      // 查找用户
      const user = await User.findOne({
        where: { username: creds.username }
      });

      if (!user) {
        console.log(`  ❌ 用户不存在\n`);
        continue;
      }

      console.log(`  ✅ 用户存在`);
      console.log(`     ID: ${user.id}`);
      console.log(`     管理员: ${user.isAdmin ? '是' : '否'}`);

      // 验证密码
      const isValid = await bcrypt.compare(creds.password, user.password);
      
      if (isValid) {
        console.log(`  ✅ 密码验证成功！\n`);
      } else {
        console.log(`  ❌ 密码验证失败！`);
        console.log(`     提示: 可以使用密码重置功能重置密码\n`);
      }
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

testLogin();
