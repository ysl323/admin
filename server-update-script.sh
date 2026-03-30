#!/bin/bash
set -e

echo '========================================'
echo '服务器完整更新脚本'
echo '========================================'
echo ''

# 1. 修复数据库表结构
echo '[1/6] 修复数据库表结构...'
cd /www/wwwroot/english-learning/backend

cat > fix-user-table.js << 'EOF'
import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import { User } from './src/models/index.js';

async function fixUserTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const tableInfo = await sequelize.getQueryInterface().describeTable('users');

    if (!tableInfo['is_super_admin']) {
      await sequelize.getQueryInterface().addColumn('users', 'is_super_admin', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      console.log('✅ is_super_admin 列已添加');
    }

    await User.update(
      { isAdmin: true, isSuperAdmin: true },
      { where: { username: 'admin' } }
    );
    console.log('✅ admin用户权限已更新');

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

fixUserTable();
EOF

node fix-user-table.js
echo '✓ 数据库表结构修复完成'
echo ''

# 2. 重置admin密码
echo '[2/6] 重置admin密码...'
cat > reset-admin-password.js << 'EOF'
import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import bcrypt from 'bcryptjs';
import { User } from './src/models/index.js';

async function resetAdminPassword() {
  try {
    await sequelize.authenticate();

    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.update(
      { passwordHash: hashedPassword },
      { where: { username: 'admin' } }
    );
    console.log('✅ admin密码已重置');

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
EOF

node reset-admin-password.js
echo '✓ admin密码重置完成'
echo ''

# 3. 测试登录
echo '[3/6] 测试登录功能...'
cat > test-login.js << 'EOF'
import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import bcrypt from 'bcryptjs';
import { User } from './src/models/index.js';

async function testLogin() {
  try {
    await sequelize.authenticate();

    const user = await User.findOne({ where: { username: 'admin' } });

    if (user) {
      const isValid = await bcrypt.compare('admin123', user.passwordHash);
      if (isValid) {
        console.log('✅ 登录测试成功');
        console.log(`用户: ${user.username}, 管理员: ${user.isAdmin}`);
      } else {
        console.log('❌ 密码验证失败');
        process.exit(1);
      }
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

testLogin();
EOF

node test-login.js
echo '✓ 登录测试完成'
echo ''

# 4. 重启后端服务
echo '[4/6] 重启后端服务...'
pm2 restart english-backend || pm2 start src/index.js --name english-backend
pm2 save
echo '✓ 后端服务已重启'
echo ''

# 5. 测试健康检查
echo '[5/6] 测试健康检查...'
sleep 3
HEALTH_CHECK=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo '✓ 健康检查通过'
else
    echo '✗ 健康检查失败'
fi
echo ''

# 6. 测试登录API
echo '[6/6] 测试登录API...'
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESULT" | grep -q "登录成功"; then
    echo '✓ 登录API测试成功'
else
    echo '✗ 登录API测试失败'
fi
echo ''

# 清理临时文件
rm -f fix-user-table.js reset-admin-password.js test-login.js

echo '========================================'
echo '✓ 服务器更新完成！'
echo '========================================'
echo ''
echo '登录凭据:'
echo '  用户名: admin'
echo '  密码: admin123'
echo ''
echo '访问地址: http://47.97.185.117'
echo ''
pm2 status
