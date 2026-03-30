# 音频缓存测试指南

## 当前状态

### ✅ 已完成
1. 数据库表结构修复（lessons 表的 UNIQUE 约束问题）
2. 示例数据导入成功
   - Programming Basics: 3 个课程
   - Web Development: 2 个课程
3. 音频缓存功能已实现
   - 数据库中有 3 条缓存记录
   - 音频文件已保存到 `backend/audio-cache/` 目录

### ❓ 待验证
- 前端缓存管理页面是否能正常显示缓存记录

## 问题诊断

### 数据库检查

运行以下命令检查缓存记录：

```bash
cd my1/backend
node check-audio-cache-correct.js
```

预期输出：
```
音频缓存记录数量: 3

最近的缓存记录:

1. 缓存 ID: 3
   文本: string
   缓存键: b45cffe084dd3d20d928bee85e7b0f21
   文件路径: b45cffe084dd3d20d928bee85e7b0f21.mp3
   ...
```

### 前端测试步骤

#### 1. 确保服务运行

```bash
# 启动所有服务
cd my1
start-all.bat
```

确认：
- 后端运行在 http://localhost:3000
- 前端运行在 http://localhost:5173

#### 2. 管理员登录

1. 打开浏览器访问: http://localhost:5173/login
2. 使用管理员账号登录:
   - 用户名: `admin`
   - 密码: `admin123`

#### 3. 访问缓存管理页面

登录后，访问: http://localhost:5173/admin/cache

**预期结果**:
- 看到统计卡片显示缓存总数、总大小等信息
- 看到缓存列表显示 3 条记录

**如果看不到数据**:
1. 打开浏览器开发者工具 (F12)
2. 查看 Console 标签页是否有错误
3. 查看 Network 标签页，检查 API 请求:
   - `/api/audio-cache/list` - 应该返回 200 状态码
   - `/api/audio-cache/statistics` - 应该返回 200 状态码
4. 如果返回 401 错误，说明未登录或 session 过期，请重新登录

#### 4. 测试音频播放和缓存

1. 访问: http://localhost:5173/categories
2. 选择 "Programming Basics" 或 "Web Development"
3. 点击任意课程（例如：第 1 课）
4. 点击单词旁边的播放按钮
5. 返回缓存管理页面 (http://localhost:5173/admin/cache)
6. 点击"刷新"按钮

**预期结果**:
- 缓存列表中应该出现新的记录
- 缓存总数应该增加

## 常见问题

### Q1: 缓存管理页面显示"加载缓存列表失败"

**原因**: 未以管理员身份登录

**解决方案**:
1. 退出当前账号
2. 使用管理员账号重新登录 (admin/admin123)
3. 刷新缓存管理页面

### Q2: 播放音频后没有生成缓存

**检查步骤**:
1. 打开浏览器开发者工具 Network 标签
2. 播放音频时观察 API 请求
3. 查找 `/api/tts/synthesize` 请求
4. 检查响应是否成功

**可能原因**:
- TTS 服务配置错误
- 火山引擎 API 凭证无效
- 网络连接问题

### Q3: 数据库中有缓存记录，但前端看不到

**检查步骤**:
1. 确认已使用管理员账号登录
2. 打开开发者工具 Network 标签
3. 刷新缓存管理页面
4. 查看 `/api/audio-cache/list` 请求:
   - 状态码 401: 未登录，请重新登录
   - 状态码 403: 权限不足，确保使用管理员账号
   - 状态码 200: 检查响应数据是否包含缓存记录

## 诊断工具

### 快速诊断

运行诊断脚本：

```bash
cd my1
diagnose-cache.bat
```

这个脚本会检查：
1. 数据库中的缓存记录
2. 音频文件是否存在
3. 后端服务状态
4. API 可访问性

### 手动检查

#### 检查数据库

```bash
cd my1/backend
node check-audio-cache-correct.js
```

#### 检查音频文件

```bash
cd my1/backend
dir audio-cache\*.mp3
```

#### 检查后端服务

```bash
curl http://localhost:3000/api/health
```

## API 端点

### 缓存管理 API

所有端点都需要管理员权限。

#### 获取缓存列表
```
GET /api/audio-cache/list
Query参数:
  - search: 搜索文本
  - provider: 提供商过滤
  - limit: 每页数量
  - offset: 偏移量
```

#### 获取统计信息
```
GET /api/audio-cache/statistics
```

#### 删除缓存
```
DELETE /api/audio-cache/:id
```

#### 批量删除
```
POST /api/audio-cache/batch-delete
Body: { ids: [1, 2, 3] }
```

#### 清空所有缓存
```
POST /api/audio-cache/clear-all
```

#### 获取音频文件
```
GET /api/audio-cache/audio/:id
```

## 技术细节

### 缓存机制

1. **缓存键生成**: 使用文本内容的 MD5 哈希作为缓存键
2. **查询流程**:
   - 前端请求 TTS 合成
   - 后端先查询缓存（通过 MD5 哈希）
   - 如果缓存存在，直接返回缓存的音频
   - 如果缓存不存在，调用火山引擎 TTS，然后保存到缓存
3. **文件存储**: 音频文件保存在 `backend/audio-cache/` 目录
4. **数据库记录**: 元数据保存在 `audio_caches` 表

### 数据库表结构

```sql
CREATE TABLE audio_caches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cache_key VARCHAR(32) UNIQUE NOT NULL,  -- MD5 哈希
  text TEXT NOT NULL,                      -- 原始文本
  file_path VARCHAR(255) NOT NULL,         -- 文件名
  file_size INTEGER NOT NULL,              -- 文件大小（字节）
  provider VARCHAR(50) NOT NULL,           -- TTS 提供商
  hit_count INTEGER DEFAULT 0,             -- 命中次数
  last_accessed_at DATETIME,               -- 最后访问时间
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### 认证机制

- 使用 **Session** 认证（不是 Bearer Token）
- Cookie 名称: `connect.sid`
- 需要设置 `withCredentials: true` 才能发送 Cookie
- 管理员权限检查: `req.user.isAdmin === true`

## 下一步

如果前端缓存管理页面仍然无法显示数据，请提供：

1. 浏览器开发者工具 Console 的错误信息
2. Network 标签页中 `/api/audio-cache/list` 请求的详细信息
3. 是否已使用管理员账号登录

---

创建时间: 2026-03-07
作者: Kiro AI Assistant
