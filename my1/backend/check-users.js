import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import { User } from './src/models/index.js';

async function checkUsers() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询所有用户
    const users = await User.findAll({
      attributes: ['id', 'username', 'isAdmin', 'createdAt']
    });

    console.log('📋 用户列表:');
    if (users.length === 0) {
      console.log('  ⚠️  数据库中没有用户！');
    } else {
      users.forEach(user => {
        console.log(`  - ID: ${user.id}`);
        console.log(`    用户名: ${user.username}`);
        console.log(`    管理员: ${user.isAdmin ? '是' : '否'}`);
        console.log(`    创建时间: ${user.createdAt}`);
        console.log();
      });
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkUsers();
