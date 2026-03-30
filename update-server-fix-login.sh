#!/bin/bash
set -e

echo '========================================'
echo '服务器更新 - 修复登录问题'
echo '========================================'
echo ''

# 1. 修复数据库表结构
echo '[1/5] 修复数据库表结构...'
cd /www/wwwroot/english-learning/backend

# 创建修复脚本
cat > fix-user-table.js << 'EOFSCRIPT'
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
EOFSCRIPT

node fix-user-table.js
echo '✓ 数据库表结构修复完成'
echo ''

# 2. 重置admin密码
echo '[2/5] 重置admin密码...'
cat > reset-admin-password.js << 'EOFSCRIPT'
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
EOFSCRIPT

node reset-admin-password.js
echo '✓ admin密码重置完成'
echo ''

# 3. 测试登录
echo '[3/5] 测试登录功能...'
cat > test-full-login.js << 'EOFSCRIPT'
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
      process.exit(1);
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
      process.exit(1);
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
      process.exit(1);
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

testFullLogin();
EOFSCRIPT

node test-full-login.js
echo '✓ 登录测试完成'
echo ''

# 4. 重启后端服务
echo '[4/5] 重启后端服务...'
pm2 restart english-backend || pm2 start src/index.js --name english-backend --log ../logs/backend.log --error ../logs/backend-error.log
pm2 save
echo '✓ 后端服务已重启'
echo ''

# 5. 测试服务状态
echo '[5/5] 测试服务状态...'
sleep 3

# 测试健康检查
echo '测试健康检查...'
HEALTH_CHECK=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo '✓ 健康检查通过'
else
    echo '✗ 健康检查失败'
    echo "响应: $HEALTH_CHECK"
fi

# 测试登录API
echo '测试登录API...'
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESULT" | grep -q "登录成功"; then
    echo '✓ 登录API测试成功'
else
    echo '✗ 登录API测试失败'
    echo "响应: $LOGIN_RESULT"
fi

echo ''
echo '========================================'
echo '✓ 服务器更新完成！'
echo '========================================'
echo ''
echo '登录凭据:'
echo '  用户名: admin'
echo '  密码: admin123'
echo ''
echo '服务状态:'
pm2 status
echo ''
echo '访问地址: http://47.97.185.117'
echo ''

# 清理临时脚本
rm -f fix-user-table.js reset-admin-password.js test-full-login.js
