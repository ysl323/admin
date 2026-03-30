# ✅ 登录问题已修复

## 问题原因
部署到服务器后，数据库是全新的，没有任何用户数据，导致无法登录。

## 解决方案
在服务器上创建了管理员账号。

## 管理员账号信息
- **用户名**: admin
- **密码**: admin123
- **用户ID**: 1
- **权限**: 管理员
- **访问天数**: 3天

## 测试结果
```json
{
  "success": true,
  "message": "登录成功",
  "user": {
    "id": 1,
    "username": "admin",
    "accessDays": 3,
    "isAdmin": true,
    "isActive": true
  }
}
```

## 现在可以正常使用

### 1. 访问网站
http://47.97.185.117/

### 2. 登录
- 用户名: admin
- 密码: admin123

### 3. 访问管理后台
http://47.97.185.117/admin

## 后续建议

### 1. 导入示例数据
如果需要测试学习功能，可以导入示例数据：

```bash
# 登录服务器
ssh root@47.97.185.117

# 进入后端目录
cd /root/english-learning/backend

# 导入示例数据（如果有的话）
node test-import.js
```

### 2. 创建更多用户
可以通过以下方式创建更多用户：
- 使用注册页面: http://47.97.185.117/register
- 使用管理后台的用户管理功能

### 3. 修改管理员密码
建议登录后立即修改默认密码：
1. 登录管理后台
2. 进入用户管理
3. 修改 admin 用户的密码

## 创建用户的脚本

如果需要批量创建用户或重新创建管理员，可以使用以下脚本：

**create-admin-server.js** (已上传到服务器)
```javascript
import { sequelize } from './src/models/index.js';
import User from './src/models/User.js';
import bcryptjs from 'bcryptjs';

async function createAdmin() {
  try {
    await sequelize.sync();
    
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('✅ 管理员账号已存在');
      return;
    }
    
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
  } catch (error) {
    console.error('❌ 创建管理员失败:', error);
  } finally {
    process.exit();
  }
}

createAdmin();
```

运行方式：
```bash
cd /root/english-learning/backend
node create-admin-server.js
```

## 注意事项

1. **密码字段名**: 数据库中密码字段名为 `passwordHash`，不是 `password`
2. **密码加密**: 使用 bcryptjs 进行密码加密
3. **ES 模块**: 服务器使用 ES 模块，需要使用 `import` 而不是 `require`

---

**修复时间**: 2026-03-09 03:15 CST  
**状态**: ✅ 已解决  
**测试**: ✅ 登录成功
