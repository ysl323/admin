# 编程英语单词学习系统 - 规格文档

## 文档结构

本规格包含以下文档：

### 1. requirements.md - 需求文档
完整的功能需求定义，包含 25 个需求和 100+ 个验收标准。

**主要内容：**
- 用户注册、登录和权限控制
- 学习内容管理（分类、课程、单词）
- 智能答题系统
- 火山引擎语音合成集成
- 管理员后台功能
- JSON 批量导入

### 2. design.md - 主设计文档
系统的核心技术设计文档。

**主要内容：**
- 系统概述和设计目标
- 技术架构（前后端分离 + RESTful API）
- 组件和接口定义
- 数据模型（5 个数据库表）
- 39 个正确性属性（Correctness Properties）
- 错误处理策略
- 测试策略（单元测试 + 属性测试）

### 3. design-appendix.md - 核心逻辑流程
详细的业务逻辑实现设计。

**主要内容：**
- 用户登录与权限校验流程
- 学习单词核心流程（完整状态机）
- 答案比对算法（LCP 算法）
- 自动播放语音逻辑
- 完整的代码实现示例

### 4. design-tts-integration.md - 火山引擎集成方案
语音合成服务的完整集成方案。

**主要内容：**
- 火山引擎 TTS API 配置
- 调用流程和错误处理
- 重试机制（最多 3 次）
- 三层缓存策略（内存 + 数据库 + 文件系统）
- 音频预加载优化
- 监控和日志记录

### 5. design-supplementary.md - 补充设计
其他重要的设计细节。

**主要内容：**
- JSON 导入解析逻辑（格式验证、事务处理）
- 前端页面设计（Vue Router 配置、学习页面组件）
- 安全设计（10 个安全措施）
  - 认证和授权（Session + bcrypt）
  - SQL 注入防护
  - XSS 防护
  - CSRF 防护
  - 速率限制
  - 文件上传安全
  - 敏感信息保护
  - HTTPS 强制
  - 安全响应头
  - 数据库备份
- 性能优化方案

## 快速导航

### 需求相关
- [完整需求列表](requirements.md)
- [用户认证需求](requirements.md#requirement-1-用户注册)
- [学习功能需求](requirements.md#requirement-7-学习页面布局)
- [管理员功能需求](requirements.md#requirement-14-管理员登录)

### 设计相关
- [系统架构](design.md#architecture)
- [数据库设计](design.md#data-models)
- [API 接口](design.md#components-and-interfaces)
- [正确性属性](design.md#correctness-properties)
- [测试策略](design.md#testing-strategy)

### 实现相关
- [登录流程](design-appendix.md#1-用户登录与权限校验流程)
- [学习流程](design-appendix.md#2-学习单词核心流程)
- [答案比对算法](design-appendix.md#3-答案比对算法)
- [TTS 集成](design-tts-integration.md)
- [JSON 导入](design-supplementary.md#json-导入解析逻辑)
- [安全设计](design-supplementary.md#安全设计)

## 技术栈总览

**前端：**
- HTML5 + CSS3 + JavaScript (ES6+)
- Vue.js 3.x（可选）
- Axios（HTTP 客户端）
- Web Audio API（音频播放）

**后端：**
- Node.js 18+ + Express 4.x
- Sequelize（ORM）
- bcrypt（密码加密）
- express-session（会话管理）
- winston（日志）
- node-cron（定时任务）

**数据库：**
- SQLite 3.x（开发环境）
- MySQL 8.0+（生产环境）

**测试：**
- Jest（后端测试框架）
- Vitest（前端测试框架）
- fast-check（属性测试库）
- Supertest（API 测试）

**第三方服务：**
- 火山引擎语音合成 API

## 关键特性

### 1. 智能答题系统
- 自动播放语音（进入/切换题目播放 2 遍）
- 实时答案比对（忽略大小写和空格）
- 错误答案智能处理（保留正确前缀）
- 最长公共前缀（LCP）算法

### 2. 访问权限控制
- 基于天数的试用机制
- 每日自动递减访问天数
- 账号启用/禁用功能
- 管理员权限分离

### 3. 语音合成集成
- 火山引擎 TTS API
- 三层缓存机制
- 自动重试（最多 3 次）
- 音频预加载优化

### 4. 管理员后台
- 用户管理（重置密码、增加天数、启用/禁用）
- 内容管理（分类、课程、单词的 CRUD）
- JSON 批量导入
- TTS 配置管理

### 5. 安全保障
- Session 认证 + bcrypt 密码加密
- SQL 注入防护（Sequelize ORM）
- XSS 防护（输入清理 + CSP）
- CSRF 防护
- 速率限制
- HTTPS 强制

### 6. 测试覆盖
- 39 个正确性属性
- 单元测试 + 属性测试
- 每个属性测试至少 100 次迭代
- 目标代码覆盖率 ≥ 80%

## 性能指标

- 答案提交响应时间：p95 < 100ms
- 页面加载时间：p95 < 1s
- TTS 音频播放延迟：p95 < 500ms
- 数据库查询：p95 < 50ms

## 开发流程

1. **阅读需求文档**：理解所有功能需求和验收标准
2. **研究设计文档**：了解系统架构和技术选型
3. **实现核心功能**：按照设计文档实现业务逻辑
4. **编写测试**：为每个正确性属性编写属性测试
5. **集成 TTS**：按照集成方案对接火山引擎 API
6. **安全加固**：实施所有安全措施
7. **性能优化**：应用缓存和优化策略
8. **部署上线**：按照部署方案发布到生产环境

## 下一步

根据 Requirements-First 工作流，设计阶段已完成。下一步是：

1. **用户审查设计文档**：确认设计是否满足需求
2. **创建任务列表**：将设计分解为可执行的开发任务
3. **开始实现**：按照任务列表进行开发

## 联系信息

- 项目名称：编程英语单词学习系统
- 工作流类型：Requirements-First
- 规格类型：Feature
- 规格 ID：7b5108e4-4807-4bd6-aa08-4bfcaa106be8

