# 直接部署到服务器（跳过GitHub）

由于Git环境问题，我们直接更新服务器。

## 🚀 执行步骤

### 方式1: SSH手动执行（推荐）

#### 1. SSH登录服务器

打开命令行，执行：

```bash
ssh root@47.97.185.117
```

输入密码后进入服务器。

#### 2. 进入后端目录

```bash
cd /www/wwwroot/english-learning/backend
```

#### 3. 创建数据库修复脚本

```bash
cat > fix-user-table.js << 'EOF'
import { sequelize } from './src/config/database.js';
import './src/models/index.js';
import { User } from './src/models/index.js';

async function fixUserTable() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    const tableInfo = await sequelize.getQueryInterface().describeTable('users');

    if (!tableInfo['is_super_admin']) {
      await sequelize.getQueryInterface().addColumn('users', 'is_super_admin', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
      console.log('is_super_admin column added');
    }

    await User.update(
      { isAdmin: true, isSuperAdmin: true },
      { where: { username: 'admin' } }
    );
    console.log('Admin user updated');

    await sequelize.close();
    console.log('Fix completed!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixUserTable();
EOF
```

#### 4. 创建密码重置脚本

```bash
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
    console.log('Admin password reset to admin123');

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();
EOF
```

#### 5. 执行修复

```bash
node fix-user-table.js
node reset-admin-password.js
```

#### 6. 重启服务

```bash
pm2 restart english-backend
pm2 save
```

#### 7. 验证服务

```bash
pm2 status
curl -I http://47.97.185.117
```

### 方式2: 上传并执行脚本

#### 1. 下载服务器脚本

在本地浏览器访问：
- 文件路径: `e:/demo/my1/my1/my1/update-server-fix-login.sh`

#### 2. 使用SCP上传

如果本地有SCP工具：

```bash
scp update-server-fix-login.sh root@47.97.185.117:/root/
```

#### 3. 执行脚本

```bash
ssh root@47.97.185.117
cd /root
chmod +x update-server-fix-login.sh
./update-server-fix-login.sh
```

## ✅ 验证部署

### 测试登录

访问: http://47.97.185.117

使用凭据:
```
用户名: admin
密码: admin123
```

### 测试API

```bash
curl -X POST http://47.97.185.117/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 检查服务状态

```bash
pm2 status
pm2 logs english-backend
```

## 🔧 常见问题

### 问题1: SSH连接失败

**解决方案**:
- 检查服务器IP: 47.97.185.117
- 确认SSH端口: 22
- 检查密码是否正确

### 问题2: PM2命令不存在

**解决方案**:
```bash
npm install -g pm2
```

### 问题3: 数据库脚本执行失败

**解决方案**:
- 检查Node.js版本: `node --version`
- 确保在正确的目录
- 查看错误日志

### 问题4: 服务无法启动

**解决方案**:
```bash
# 查看错误日志
pm2 logs english-backend --err

# 重新启动
pm2 restart english-backend

# 查看详细状态
pm2 monit
```

## 📊 修复内容

- ✅ 添加 is_super_admin 列
- ✅ 重置 admin 密码为 admin123
- ✅ 设置 admin 为超级管理员
- ✅ 重启后端服务
- ✅ 验证登录功能

## 🎯 完成后

1. 访问 http://47.97.185.117
2. 使用 admin / admin123 登录
3. 查看所有分类和课程
4. 体验6个学习模式

## 📞 需要帮助？

如果遇到问题，请提供：
1. 错误信息的完整文本
2. 执行的命令
3. 服务器日志输出

我会帮你解决！
