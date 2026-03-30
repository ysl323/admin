import { User } from '../src/models/index.js';
import PasswordService from '../src/services/PasswordService.js';
import logger from '../src/utils/logger.js';

async function createAdmin() {
  try {
    // 检查管理员是否已存在
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    
    if (existingAdmin) {
      logger.info('管理员账号已存在');
      console.log('管理员账号已存在');
      process.exit(0);
    }

    // 创建管理员账号
    const hashedPassword = await PasswordService.hash('admin123');
    const admin = await User.create({
      username: 'admin',
      passwordHash: hashedPassword,
      accessDays: 999,
      isActive: true,
      isAdmin: true
    });

    logger.info('管理员账号创建成功', { username: admin.username });
    console.log('✅ 管理员账号创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('访问天数: 999');
    
    process.exit(0);
  } catch (error) {
    logger.error('创建管理员失败:', error);
    console.error('❌ 创建管理员失败:', error.message);
    process.exit(1);
  }
}

createAdmin();
