# 编程英语单词学习系统

一个面向编程学习者的在线英语单词学习平台，提供智能答题、语音合成、分类课程管理等功能。

## 功能特性

- ✅ 用户注册登录（3 天免费试用）
- ✅ 访问权限控制（基于天数）
- ✅ 分类课程管理（基础英语、ESP32、Java、Arduino 等）
- ✅ 智能答题系统（自动播放语音、错误答案保留正确前缀）
- ✅ 火山引擎 TTS 语音合成
- ✅ 管理员后台（用户管理、内容管理、JSON 批量导入）
- ✅ 完整的安全措施（CSRF、XSS 防护、速率限制）

## 技术栈

### 后端
- Node.js 18+ + Express 4.x
- Sequelize ORM
- SQLite (开发) / MySQL 8.0+ (生产)
- bcrypt + express-session
- winston 日志

### 前端
- Vue.js 3.x + Vite
- Element Plus UI
- Axios
- Vue Router

### 测试
- Jest (后端) + Vitest (前端)
- fast-check (属性测试)
- Supertest (API 测试)

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0.0
- npm 或 yarn

### 方法1：一键启动（推荐）

```bash
# Windows用户
start-all.bat

# 系统会自动启动后端和前端服务
# 并在浏览器中打开应用
```

### 方法2：手动启动

#### 1. 克隆项目

```bash
git clone <repository-url>
cd programming-english-learning-system
```

#### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

#### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，设置必要的配置
```

#### 4. 启动开发服务器

```bash
# 启动后端（终端 1）
cd backend
npm start

# 启动前端（终端 2）
cd frontend
npm run dev
```

- 后端服务: http://localhost:3000
- 前端应用: http://localhost:5173

#### 5. 访问应用

打开浏览器访问 http://localhost:5173

### 默认账号

- **管理员账号**：
  - 用户名：`admin`
  - 密码：`admin123`

### 停止服务

```bash
# Windows用户
stop-all.bat

# 或手动关闭终端窗口
```

## 项目结构

```
programming-english-learning-system/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   ├── models/         # 数据模型
│   │   ├── services/       # 业务逻辑
│   │   ├── routes/         # API 路由
│   │   ├── middleware/     # 中间件
│   │   ├── utils/          # 工具函数
│   │   └── index.js        # 入口文件
│   ├── tests/              # 测试文件
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   ├── components/     # 通用组件
│   │   ├── services/       # API 服务
│   │   ├── router/         # 路由配置
│   │   └── main.js         # 入口文件
│   └── package.json
├── .kiro/                  # 规格文档
│   └── specs/
│       └── programming-english-learning-system/
│           ├── requirements.md  # 需求文档
│           ├── design.md        # 设计文档
│           └── tasks.md         # 任务列表
├── .env.example            # 环境变量模板
├── .gitignore
└── README.md
```

## 开发指南

### 运行测试

```bash
# 后端测试
cd backend
npm test

# 前端测试
cd frontend
npm test
```

### 代码规范

项目使用 ESLint 和 Prettier 进行代码检查和格式化。

### API 文档

详细的 API 文档请参考 `.kiro/specs/programming-english-learning-system/design.md`

## 部署

### 生产环境部署

1. 构建前端

```bash
cd frontend
npm run build
```

2. 配置生产环境变量

```bash
cp .env.example .env.production
# 编辑 .env.production，设置生产环境配置
```

3. 使用 PM2 启动后端

```bash
cd backend
pm2 start ecosystem.config.js --env production
```

4. 配置 Nginx 反向代理

详细部署指南请参考 `DEPLOYMENT.md`（待创建）

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | development |
| PORT | 后端端口 | 3000 |
| DB_DIALECT | 数据库类型 | sqlite |
| SESSION_SECRET | Session 密钥 | - |
| ENCRYPTION_KEY | 加密密钥 | - |
| CORS_ORIGIN | 前端地址 | http://localhost:5173 |

## 📚 文档

### 用户文档
- [用户使用指南](USER-GUIDE.md) - 完整的用户使用说明
- [快速测试指南](QUICK-TEST-GUIDE.md) - 功能测试方法

### 开发文档
- [修复总结](FIXES-SUMMARY.md) - 最近修复的问题详情
- [系统状态](CURRENT-STATUS.md) - 当前系统状态
- [完成总结](COMPLETION-SUMMARY.md) - 项目完成情况

### 技术文档
- [需求文档](.kiro/specs/programming-english-learning-system/requirements.md)
- [设计文档](.kiro/specs/programming-english-learning-system/design.md)
- [任务列表](.kiro/specs/programming-english-learning-system/tasks.md)

## 🔧 最近更新

### 2026-03-07 最新修复
1. ✅ 修复课程数量显示为0的问题
2. ✅ 修复TTS播放没有声音的问题
3. ✅ 修复课程列表显示"未知分类"和"0个单词"的问题
4. ✅ 修复TTS API返回404错误
5. ✅ 添加学习页面返回按钮
6. ✅ 确认后台内容管理功能完整
7. ✅ 确认一键导入功能可用

详细信息请查看：
- [修复总结](FIXES-SUMMARY.md) - 所有修复的详细说明
- [最新修复测试指南](LATEST-FIXES-TEST.md) - 最新修复的测试方法
- [系统状态](CURRENT-STATUS.md) - 当前系统完整状态

### 快速测试最新修复

```bash
# Windows用户
test-latest-fixes.bat

# 或手动测试
# 1. 访问 http://localhost:5173
# 2. 登录系统
# 3. 测试课程列表显示
# 4. 测试TTS播放功能
# 5. 测试返回按钮
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。
