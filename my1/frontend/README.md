# 编程英语单词学习系统 - 前端

## 项目简介

这是编程英语单词学习系统的前端应用，提供用户学习界面和管理员后台。

## 技术栈

- **框架**: Vue.js 3.x
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **HTTP 客户端**: Axios
- **路由**: Vue Router
- **测试**: Vitest + fast-check

## 快速开始

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

应用将运行在 `http://localhost:5173`

### 3. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

## 项目结构

```
frontend/
├── src/
│   ├── views/           # 页面组件
│   ├── components/      # 通用组件
│   ├── services/        # API 服务
│   ├── utils/           # 工具函数
│   ├── router/          # 路由配置
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── public/              # 静态资源
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
├── package.json
└── README.md
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建
- `npm test` - 运行测试
- `npm run test:ui` - 运行测试（UI 模式）
- `npm run test:coverage` - 生成测试覆盖率报告

## 开发规范

- 使用 Vue 3 Composition API
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- 遵循 Vue 官方风格指南

## 许可证

MIT
