import { sequelize } from './src/models/index.js';
import User from './src/models/User.js';
import bcryptjs from 'bcryptjs';

async function createAdmin() {
  try {
    await sequelize.sync();
    
    // 检查是否已存在管理员
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('✅ 管理员账号已存在');
      console.log('用户名: admin');
      return;
    }
    
    // 创建管理员账号
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      passwordHash: hashedPassword,
      email: 'admin@example.com',
      isAdmin: true
    });
    
    console.log('✅ 管理员账号创建成功！');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('用户ID:', admin.id);
  } catch (error) {
    console.error('❌ 创建管理员失败:', error);
  } finally {
    process.exit();
  }
}

createAdmin();
