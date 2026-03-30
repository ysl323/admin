import { sequelize } from './src/models/index.js';
import User from './src/models/User.js';

async function checkUsers() {
  try {
    await sequelize.sync();
    const users = await User.findAll();
    console.log('=== 数据库中的用户 ===');
    console.log(JSON.stringify(users, null, 2));
    console.log('\n用户数量:', users.length);
    
    if (users.length === 0) {
      console.log('\n⚠️ 数据库中没有用户！需要创建管理员账号。');
    }
  } catch (error) {
    console.error('错误:', error);
  } finally {
    process.exit();
  }
}

checkUsers();
