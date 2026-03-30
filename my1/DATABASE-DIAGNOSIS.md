# 数据库课程丢失问题诊断

## 问题描述

用户反映：
1. 数据库里的课程都丢失了
2. 上传课程还失败

## 问题分析

根据文档和代码分析：

### 1. 可能的原因

1. **数据库同步导致的数据丢失**
   - 代码中 `src/index.js` 第88-92行：
   ```javascript
   if (process.env.NODE_ENV === 'development') {
     await syncDatabase({ alter: true });
     logger.info('数据库同步完成');
   }
   ```
   - `alter: true` 可能会修改表结构，导致数据丢失
   - 特别是在环境变量设置为 `production` 但实际运行环境是 `development` 时

2. **数据库文件被替换**
   - 项目根目录和 `backend` 目录都有 `database.sqlite` 文件
   - 可能是不同的实例在使用不同的数据库文件

3. **数据库路径配置问题**
   - `src/config/database.js` 第8行：
   ```javascript
   storage: process.env.DB_STORAGE || './database.sqlite',
   ```
   - 如果 `.env` 文件不存在或配置不正确，可能使用默认路径

### 2. 上传课程失败的可能原因

1. **认证/权限问题**
   - 需要管理员权限才能上传课程
   - 如果登录状态失效或权限不足会失败

2. **数据格式问题**
   - JSON 格式不正确
   - 缺少必填字段（question, english, chinese）
   - 课程编号冲突

3. **数据库约束问题**
   - 之前提到的 `category_id` 唯一约束问题
   - 外键约束问题

## 诊断步骤

### 步骤1: 检查数据库文件位置和内容

```bash
# 检查数据库文件
cd e:/demo/my1/my1/my1/backend
dir *.sqlite

# 使用 SQLite 查看数据库内容
sqlite3 database.sqlite ".tables"
sqlite3 database.sqlite "SELECT COUNT(*) FROM categories;"
sqlite3 database.sqlite "SELECT COUNT(*) FROM lessons;"
sqlite3 database.sqlite "SELECT COUNT(*) FROM words;"
```

### 步骤2: 检查环境配置

```bash
# 检查 .env 文件是否存在
cd e:/demo/my1/my1/my1/backend
type .env

# 如果没有 .env，检查 .env.production
type .env.production
```

### 步骤3: 检查后端服务状态

```bash
# 检查后端是否在运行
# 检查日志中的错误信息
```

### 步骤4: 测试上传接口

```bash
# 使用 curl 测试上传接口
curl -X POST http://localhost:3000/api/admin/import-simple-lesson \
  -H "Content-Type: application/json" \
  -d '{"data": [{"lesson": 1, "question": 1, "english": "test", "chinese": "测试"}], "categoryName": "测试分类"}'
```

## 解决方案

### 方案1: 恢复备份数据

如果有备份：
```bash
# 停止后端服务
# 替换数据库文件
# 重启后端服务
```

### 方案2: 重新导入数据

使用现有的导入功能：
1. 登录管理后台
2. 进入内容管理
3. 使用"一键导入课程"功能
4. 粘贴 JSON 数据

### 方案3: 修复数据库配置

1. 确保 `.env` 文件配置正确：
```env
NODE_ENV=development
PORT=3000
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

2. 修改 `index.js`，避免使用 `alter: true`：
```javascript
// 改为 force: false 或者完全删除 sync 调用
if (process.env.NODE_ENV === 'development') {
  await syncDatabase({ force: false });  // 或者注释掉这一行
  logger.info('数据库同步完成');
}
```

### 方案4: 修复上传功能

检查以下内容：
1. 确保使用管理员账号登录
2. 检查 `SimpleLessonImportService.js` 的验证逻辑
3. 检查前端上传代码的错误处理

## 预防措施

1. **定期备份数据库**
   ```bash
   # 创建备份脚本
   cp backend/database.sqlite backups/database-$(date +%Y%m%d).sqlite
   ```

2. **避免在生产环境使用 alter: true**
   - 只在开发环境使用
   - 或者改用 migration 脚本

3. **使用统一的数据库路径**
   - 确保所有配置指向同一个数据库文件
   - 使用绝对路径避免混淆

4. **添加数据导入验证**
   - 导入前备份数据
   - 导入时显示进度
   - 导入后验证数据完整性

## 立即执行的操作

1. ✅ 检查数据库文件是否存在数据
2. ✅ 检查环境配置
3. ✅ 查看后端日志错误
4. ✅ 尝试手动导入测试数据
5. ✅ 修复发现的问题

## 后续步骤

1. 修复数据库配置问题
2. 恢复或重新导入课程数据
3. 验证上传功能正常
4. 添加数据备份机制
