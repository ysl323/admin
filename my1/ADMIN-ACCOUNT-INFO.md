# 管理员账户信息

## 默认管理员账户

### 账户信息
- **用户名：** admin
- **密码：** admin123
- **权限：** 超级管理员
- **访问天数：** 999 天
- **状态：** 启用

### 创建方式
管理员账户通过初始化脚本自动创建：
```bash
cd backend
node scripts/createAdmin.js
```

## 管理员功能

### 1. 用户管理
- ✅ 查看所有用户列表
- ✅ 修改用户名
- ✅ 重置用户密码
- ✅ 增加访问天数
- ✅ 启用/禁用账号

### 2. 内容管理
- 创建/编辑/删除分类
- 创建/编辑/删除课程
- JSON 批量导入单词

### 3. 配置管理
- TTS 配置（火山引擎）
- 系统参数配置

## 访问管理后台

### 方式 1：导航栏按钮（推荐）
1. 使用管理员账户登录
2. 在顶部导航栏右侧会显示蓝色的"进入后台"按钮
3. 点击按钮进入管理后台

### 方式 2：用户下拉菜单
1. 使用管理员账户登录
2. 点击右上角用户图标
3. 在下拉菜单中选择"管理后台"

### 方式 3：直接访问
访问：http://localhost:5173/admin/users

## 管理后台功能

### 用户管理页面
路径：`/admin/users`

#### 功能列表
1. **查看用户列表**
   - 显示所有用户信息
   - 包含：ID、用户名、剩余天数、管理员标识、状态、创建时间

2. **修改用户名**
   - 点击"修改用户名"按钮
   - 输入新用户名（3-20字符）
   - 系统自动检查用户名是否已存在

3. **重置密码**
   - 点击"重置密码"按钮
   - 输入新密码（至少6字符）
   - 需要确认密码
   - 密码立即生效

4. **增加天数**
   - 点击"加天数"按钮
   - 输入要增加的天数（1-365）
   - 立即生效

5. **启用/禁用账号**
   - 点击"启用"或"禁用"按钮
   - 确认操作
   - 禁用后用户无法登录
   - 注意：不能禁用管理员账号

#### 用户状态标识
- **剩余天数：**
  - 绿色：> 7 天
  - 橙色：1-7 天
  - 红色：0 天（已到期）

- **管理员：**
  - 绿色"是"：管理员
  - 灰色"否"：普通用户

- **状态：**
  - 绿色"启用"：账号正常
  - 红色"禁用"：账号已禁用

### 返回主页
在管理后台左侧菜单顶部有"返回主页"按钮，点击可返回学习分类首页。

## 测试账号

### 管理员账号
```
用户名：admin
密码：admin123
权限：超级管理员
```

### 普通用户账号
```
用户名：testuser
密码：test123
权限：普通用户（3天试用期）
```

## 安全注意事项

### 1. 修改默认密码
首次登录后，建议立即修改管理员密码：
1. 登录管理后台
2. 进入用户管理
3. 找到 admin 用户
4. 点击"重置密码"
5. 设置新的强密码

### 2. 密码要求
- 最少 6 个字符
- 建议使用字母、数字、特殊字符组合
- 不要使用简单密码（如：123456、password）

### 3. 账号保护
- 不要将管理员账号分享给他人
- 定期更换密码
- 不要在公共场所登录管理后台

### 4. 操作日志
所有管理员操作都会记录在系统日志中：
- 位置：`backend/logs/combined.log`
- 包含：操作时间、操作类型、操作对象

## 常见问题

### Q1: 忘记管理员密码怎么办？
**A:** 运行重置脚本：
```bash
cd backend
node scripts/createAdmin.js
```
这会重置管理员密码为默认密码 `admin123`

### Q2: 普通用户能看到"进入后台"按钮吗？
**A:** 不能。"进入后台"按钮只对管理员用户显示。

### Q3: 可以创建多个管理员吗？
**A:** 目前系统只支持一个超级管理员账户。如需多个管理员，需要修改数据库。

### Q4: 修改用户名后，用户需要重新登录吗？
**A:** 是的。用户名修改后，用户需要使用新用户名登录。

### Q5: 重置密码后，用户会收到通知吗？
**A:** 目前系统不会自动通知用户。管理员需要手动告知用户新密码。

## API 端点

### 用户管理 API
```
GET    /api/admin/users                      # 获取所有用户
GET    /api/admin/users/:id                  # 获取用户详情
PUT    /api/admin/users/:id/update-username  # 修改用户名
PUT    /api/admin/users/:id/reset-password   # 重置密码
PUT    /api/admin/users/:id/add-days         # 增加天数
PUT    /api/admin/users/:id/toggle-status    # 启用/禁用
```

### 请求示例

#### 修改用户名
```bash
curl -X PUT http://localhost:3000/api/admin/users/2/update-username \
  -H "Content-Type: application/json" \
  -d '{"newUsername": "newuser"}'
```

#### 重置密码
```bash
curl -X PUT http://localhost:3000/api/admin/users/2/reset-password \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "newpass123"}'
```

#### 增加天数
```bash
curl -X PUT http://localhost:3000/api/admin/users/2/add-days \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'
```

## 数据库信息

### 用户表结构
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  accessDays INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  isAdmin BOOLEAN DEFAULT false,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### 查询管理员
```sql
SELECT * FROM users WHERE isAdmin = 1;
```

### 手动创建管理员（SQLite）
```sql
-- 注意：密码需要使用 bcrypt 加密
INSERT INTO users (username, passwordHash, accessDays, isActive, isAdmin, createdAt, updatedAt)
VALUES ('admin', '$2b$10$...', 999, 1, 1, datetime('now'), datetime('now'));
```

## 相关文件

### 前端文件
- `frontend/src/views/admin/UserManagement.vue` - 用户管理页面
- `frontend/src/views/AdminLayout.vue` - 管理后台布局
- `frontend/src/components/NavBar.vue` - 导航栏（含进入后台按钮）
- `frontend/src/services/admin.js` - 管理员 API 服务

### 后端文件
- `backend/src/routes/admin.js` - 管理员路由
- `backend/src/services/UserService.js` - 用户服务
- `backend/scripts/createAdmin.js` - 创建管理员脚本
- `backend/src/middleware/auth.js` - 认证中间件

## 更新日志

### 2026-03-06
- ✅ 添加"进入后台"按钮（仅管理员可见）
- ✅ 添加"返回主页"按钮（管理后台）
- ✅ 实现修改用户名功能
- ✅ 实现重置密码功能
- ✅ 完善用户管理页面
- ✅ 修复登录跳转问题
- ✅ 修复路由守卫认证检查

## 下一步计划

### 待开发功能
- [ ] 内容管理页面（分类、课程、单词）
- [ ] 配置管理页面（TTS 配置）
- [ ] 用户操作日志查看
- [ ] 数据统计和报表
- [ ] 批量用户操作
- [ ] 用户权限细分
