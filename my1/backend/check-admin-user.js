import { sequelize } from './src/models/index.js';
import User from './src/models/User.js';

async function checkAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功\n');

    // 查找 admin 用户
    const adminUser = await User.findOne({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      console.log('❌ 未找到 admin 用户！');
      console.log('\n请运行以下命令创建管理员账号:');
      console.log('  cd backend');
      console.log('  node create-admin.js');
      await sequelize.close();
      return;
    }

    console.log('========================================');
    console.log('管理员账号信息');
    console.log('========================================\n');
    console.log(`用户名: ${adminUser.username}`);
    console.log(`是否管理员: ${adminUser.isAdmin ? '✓ 是' : '✗ 否'}`);
    console.log(`账号状态: ${adminUser.isActive ? '✓ 激活' : '✗ 禁用'}`);
    console.log(`访问天数: ${adminUser.accessDays} 天`);
    console.log(`创建时间: ${adminUser.createdAt}`);
    console.log('');

    if (!adminUser.isAdmin) {
      console.log('========================================');
      console.log('⚠️  警告');
      console.log('========================================');
      console.log('admin 用户不是管理员！');
      console.log('');
      console.log('修复方法:');
      console.log('  1. 运行: node backend/fix-admin-user.js');
      console.log('  2. 或手动更新数据库');
      console.log('');
    }

    if (!adminUser.isActive) {
      console.log('========================================');
      console.log('⚠️  警告');
      console.log('========================================');
      console.log('admin 用户已被禁用！');
      console.log('');
      console.log('修复方法:');
      console.log('  1. 运行: node backend/fix-admin-user.js');
      console.log('  2. 或手动更新数据库');
      console.log('');
    }

    if (adminUser.accessDays <= 0) {
      console.log('========================================');
      console.log('⚠️  警告');
      console.log('========================================');
      console.log('admin 用户访问权限已到期！');
      console.log('');
      console.log('修复方法:');
      console.log('  1. 运行: node backend/fix-admin-user.js');
      console.log('  2. 或手动更新数据库');
      console.log('');
    }

    if (adminUser.isAdmin && adminUser.isActive && adminUser.accessDays > 0) {
      console.log('========================================');
      console.log('✓ 管理员账号正常');
      console.log('========================================');
      console.log('');
      console.log('登录信息:');
      console.log('  URL: http://localhost:5173/login');
      console.log('  用户名: admin');
      console.log('  密码: admin123');
      console.log('');
      console.log('如果登录后仍然看不到缓存数据:');
      console.log('  1. 退出当前账号');
      console.log('  2. 清除浏览器缓存 (Ctrl+Shift+Delete)');
      console.log('  3. 重新登录');
      console.log('  4. 访问: http://localhost:5173/admin/cache');
      console.log('');
    }

    await sequelize.close();
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

checkAdminUser();
