import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import { User } from './src/models/index.js';

async function fixUserTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 检查表结构
    const tableInfo = await sequelize.getQueryInterface().describeTable('users');
    console.log('📋 当前users表结构:');
    Object.keys(tableInfo).forEach(column => {
      console.log(`  - ${column}: ${tableInfo[column].type}`);
    });

    // 检查是否有 is_super_admin 列
    if (!tableInfo['is_super_admin']) {
      console.log('\n⚠️  缺少 is_super_admin 列，正在添加...');
      await sequelize.getQueryInterface().addColumn('users', 'is_super_admin', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: '超级管理员，拥有最高权限'
      });
      console.log('✅ is_super_admin 列添加成功');
    } else {
      console.log('\n✅ is_super_admin 列已存在');
    }

    // 更新admin用户为超级管理员
    console.log('\n🔧 更新admin用户权限...');
    await User.update(
      { isAdmin: true, isSuperAdmin: true },
      { where: { username: 'admin' } }
    );
    console.log('✅ admin用户已设置为超级管理员');

    // 显示所有用户
    const users = await User.findAll({
      attributes: ['id', 'username', 'isAdmin', 'isSuperAdmin']
    });

    console.log('\n📋 用户列表:');
    users.forEach(user => {
      console.log(`  - ${user.username}: 管理员=${user.isAdmin}, 超级管理员=${user.isSuperAdmin}`);
    });

    await sequelize.close();
    console.log('\n✅ 修复完成！');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

fixUserTable();
