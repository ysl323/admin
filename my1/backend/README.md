# 编程英语单词学习系统 - 后端

## 项目简介

这是编程英语单词学习系统的后端服务，提供用户认证、学习内容管理、答题逻辑、火山引擎 TTS 集成等功能。

## 技术栈

- **运行环境**: Node.js 18+
- **Web 框架**: Express 4.x
- **数据库**: SQLite (开发) / MySQL 8.0+ (生产)
- **ORM**: Sequelize
- **认证**: express-session + bcrypt
- **日志**: winston
- **测试**: Jest + fast-check

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```bash
cp ../.env.example ../.env
```

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将运行在 `http://localhost:3000`

### 4. 测试数据库连接

访问 `http://localhost:3000/api/test-db` 检查数据库连接状态。

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   └── database.js  # 数据库配置
│   ├── models/          # 数据模型
│   ├── services/        # 业务逻辑
│   ├── routes/          # API 路由
│   ├── middleware/      # 中间件
│   ├── utils/           # 工具函数
│   │   └── logger.js    # 日志工具
│   └── index.js         # 入口文件
├── tests/               # 测试文件
├── logs/                # 日志文件
├── cache/               # 音频缓存
├── uploads/             # 上传文件
├── package.json
└── README.md
```

## 可用脚本

- `npm start` - 启动生产服务器
- `npm run dev` - 启动开发服务器（热重载）
- `npm test` - 运行测试
- `npm run test:watch` - 监听模式运行测试
- `npm run test:coverage` - 生成测试覆盖率报告

## API 文档

详细的 API 文档请参考 `.kiro/specs/programming-english-learning-system/design.md`

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| NODE_ENV | 运行环境 | development |
| PORT | 服务器端口 | 3000 |
| DB_DIALECT | 数据库类型 | sqlite |
| DB_STORAGE | SQLite 文件路径 | ./database.sqlite |
| SESSION_SECRET | Session 密钥 | - |
| ENCRYPTION_KEY | 加密密钥 | - |

## 开发规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 Airbnb JavaScript 风格指南
- 所有 API 必须有错误处理
- 敏感信息必须加密存储

## 许可证

MIT
