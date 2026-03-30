# 快速登录测试指南

## 测试目的
验证登录跳转功能已修复，用户登录后能正常跳转到分类首页。

## 前置条件
- ✅ 后端服务器运行中：http://localhost:3000
- ✅ 前端服务器运行中：http://localhost:5173
- ✅ 路由守卫已修复（response.authenticated）

## 测试步骤

### 1. 打开登录页面
访问：http://localhost:5173/login

### 2. 输入测试账号
```
用户名：testuser
密码：test123
```

### 3. 点击"登录"按钮

### 4. 观察结果

#### ✅ 预期结果（修复后）
1. 显示绿色提示："登录成功"
2. 页面自动跳转到：http://localhost:5173/categories
3. 显示分类列表页面
4. 顶部导航栏显示用户名"testuser"
5. 可以看到所有分类卡片

#### ❌ 错误结果（修复前）
1. 显示"登录成功"提示
2. 页面停留在登录页面
3. 或者短暂跳转后又回到登录页面

## 调试方法

### 如果仍然无法跳转

1. **打开浏览器开发者工具**
   - 按 F12 或右键 > 检查

2. **查看 Console 标签**
   - 检查是否有红色错误信息
   - 检查是否有"未登录"或"认证失败"的日志

3. **查看 Network 标签**
   - 找到 `/api/auth/login` 请求
   - 检查响应状态码（应该是 200）
   - 检查响应内容是否包含 `success: true`
   
   - 找到 `/api/auth/check` 请求
   - 检查响应状态码（应该是 200）
   - 检查响应内容是否包含 `authenticated: true`

4. **查看 Application 标签 > Cookies**
   - 检查是否有 `connect.sid` cookie
   - 这是 Express Session 的 cookie

### 常见问题

#### 问题 1：显示"未登录，请先登录"
**原因：** Session 未正确创建或 Cookie 未发送
**解决：**
- 检查后端 Session 配置
- 检查前端 Axios 配置中的 `withCredentials: true`

#### 问题 2：显示"用户名或密码错误"
**原因：** 测试账号不存在或密码错误
**解决：**
- 运行注册流程创建账号
- 或使用管理员账号：admin / admin123

#### 问题 3：跳转后又回到登录页
**原因：** 路由守卫认证检查失败（已修复）
**解决：**
- 确认 `router/index.js` 中使用 `response.authenticated`
- 刷新浏览器页面（Ctrl+F5）

## 完整测试流程

### 测试 1：普通用户登录
```
用户名：testuser
密码：test123
预期：跳转到分类首页
```

### 测试 2：管理员登录
```
用户名：admin
密码：admin123
预期：跳转到分类首页，导航栏显示"管理后台"入口
```

### 测试 3：错误密码
```
用户名：testuser
密码：wrongpassword
预期：显示"用户名或密码错误"，停留在登录页
```

### 测试 4：空用户名
```
用户名：（空）
密码：test123
预期：显示"请输入用户名"，无法提交
```

### 测试 5：登录后访问受保护页面
```
1. 登录成功
2. 访问：http://localhost:5173/categories
3. 预期：正常显示分类列表
4. 访问：http://localhost:5173/lessons/1/learning
5. 预期：正常显示学习页面
```

### 测试 6：退出登录
```
1. 登录成功
2. 点击右上角用户名
3. 点击"退出登录"
4. 确认退出
5. 预期：跳转回登录页
6. 尝试访问：http://localhost:5173/categories
7. 预期：自动跳转到登录页
```

## 测试结果记录

| 测试项 | 结果 | 备注 |
|--------|------|------|
| 普通用户登录 | ☐ 通过 ☐ 失败 | |
| 管理员登录 | ☐ 通过 ☐ 失败 | |
| 错误密码 | ☐ 通过 ☐ 失败 | |
| 空用户名 | ☐ 通过 ☐ 失败 | |
| 访问受保护页面 | ☐ 通过 ☐ 失败 | |
| 退出登录 | ☐ 通过 ☐ 失败 | |

## 技术细节

### 修复内容
文件：`frontend/src/router/index.js`

修改前：
```javascript
if (response.success && response.user) {
  // 已登录
  next();
}
```

修改后：
```javascript
if (response.authenticated && response.user) {
  // 已登录
  next();
}
```

### 原因
后端 `/api/auth/check` 返回的字段是 `authenticated` 而不是 `success`。

### 影响范围
- 登录后跳转
- 刷新页面后的认证状态保持
- 直接访问受保护页面的重定向

## 相关文档
- `LOGIN-FIX-SUMMARY.md` - 详细修复说明
- `test-login-fix.bat` - 自动化测试脚本
- `LEARNING-PAGE-TEST.md` - 学习页面测试指南
