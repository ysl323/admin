import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import bcrypt from 'bcryptjs';
import { User } from './src/models/index.js';

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 重置admin密码
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [updatedCount] = await User.update(
      { passwordHash: hashedPassword },
      { where: { username: 'admin' } }
    );

    if (updatedCount > 0) {
      console.log('✅ admin密码重置成功');
      console.log(`   用户名: admin`);
      console.log(`   新密码: ${newPassword}`);
    } else {
      console.log('❌ 未找到admin用户');
    }

    // 验证密码
    console.log('\n🔍 验证密码...');
    const user = await User.findOne({ where: { username: 'admin' } });

    if (user) {
      const isValid = await bcrypt.compare(newPassword, user.passwordHash);
      console.log(`   密码验证: ${isValid ? '✅ 成功' : '❌ 失败'}`);
    }

    await sequelize.close();
    console.log('\n✅ 完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
