# Implementation Plan: 编程英语单词学习系统

## Overview

本实现计划将编程英语单词学习系统的设计转化为可执行的开发任务。系统采用 Node.js + Express 后端和 Vue.js 前端架构，使用 SQLite/MySQL 数据库，集成火山引擎 TTS 服务。

实现顺序：基础设施 → 数据库层 → 后端核心功能 → TTS 集成 → 前端页面 → 安全和性能优化 → 测试。

## Tasks

- [x] 1. 项目初始化和基础设施搭建
  - 创建项目目录结构（backend、frontend、shared）
  - 初始化 Node.js 项目（package.json）
  - 安装核心依赖：express、sequelize、bcrypt、express-session、joi、winston
  - 配置环境变量文件（.env.example）
  - 设置 ESLint 和 Prettier 代码规范
  - 创建基础的 Express 服务器入口文件
  - _Requirements: 21.1, 21.2, 21.3_

- [x] 2. 数据库层实现
  - [x] 2.1 配置 Sequelize ORM
    - 创建 Sequelize 实例和数据库连接配置
    - 配置 SQLite（开发环境）和 MySQL（生产环境）支持
    - 实现数据库连接健康检查
    - _Requirements: 21.1, 21.2_

  - [x] 2.2 创建数据模型
    - 实现 User 模型（username, passwordHash, accessDays, expireDate, isActive, isAdmin）
    - 实现 Category 模型（name）
    - 实现 Lesson 模型（categoryId, lessonNumber）
    - 实现 Word 模型（lessonId, english, chinese, audioCacheUrl）
    - 实现 Config 模型（key, value）
    - 配置模型关系（Category -> Lessons -> Words 级联删除）
    - _Requirements: 21.1, 21.2, 21.3_


  - [ ]* 2.3 编写数据模型属性测试
    - **Property 26: 分类级联删除**
    - **Validates: Requirements 16.4**

  - [ ]* 2.4 编写数据模型属性测试
    - **Property 27: 课程级联删除**
    - **Validates: Requirements 16.8**

  - [x] 2.5 创建数据库迁移脚本
    - 编写初始化数据库表结构的迁移脚本
    - 创建所有必需的索引（username, access_days, category_id, lesson_id, english）
    - 实现数据库同步函数（开发环境自动同步）
    - _Requirements: 21.1, 21.2_

- [x] 3. 用户认证和授权系统
  - [x] 3.1 实现密码加密服务
    - 创建 PasswordService 类（hash, verify, validate 方法）
    - 使用 bcrypt 实现密码哈希（saltRounds = 10）
    - 实现密码验证规则（最少 6 个字符）
    - _Requirements: 1.6, 21.4_

  - [ ]* 3.2 编写密码服务属性测试
    - **Property 3: 密码长度验证**
    - **Validates: Requirements 1.6**

  - [ ]* 3.3 编写密码服务属性测试
    - **Property 36: 密码加密存储**
    - **Validates: Requirements 21.4**

  - [x] 3.4 实现用户注册功能
    - 创建 AuthService.register 方法
    - 验证用户名唯一性
    - 自动设置 accessDays = 3（试用期）
    - 返回成功或错误信息
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 3.5 编写注册功能属性测试
    - **Property 1: 用户注册唯一性**
    - **Validates: Requirements 1.2, 1.3**

  - [ ]* 3.6 编写注册功能属性测试
    - **Property 2: 注册自动赋予试用期**
    - **Validates: Requirements 1.4, 1.5**

  - [x] 3.7 实现用户登录功能
    - 创建 AuthService.login 方法
    - 验证用户名和密码
    - 检查账号状态（isActive）
    - 创建 Session 并返回用户信息
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

  - [ ]* 3.8 编写登录功能属性测试
    - **Property 5: 登录凭证验证**
    - **Validates: Requirements 2.3, 2.4, 2.5**

  - [ ]* 3.9 编写登录功能属性测试
    - **Property 25: 禁用账号阻止登录**
    - **Validates: Requirements 15.6**

  - [x] 3.10 实现 Session 管理
    - 配置 express-session 中间件
    - 配置 Session 存储（开发环境内存，生产环境 Redis）
    - 设置 Session 过期时间（24 小时）
    - 实现 Session 安全配置（httpOnly, secure, sameSite）
    - _Requirements: 2.6_

  - [ ]* 3.11 编写 Session 属性测试
    - **Property 6: Session 持久性**
    - **Validates: Requirements 2.6**

  - [x] 3.12 实现退出登录功能
    - 创建 AuthService.logout 方法
    - 清除 Session 状态
    - _Requirements: 3.2, 3.3_

  - [ ]* 3.13 编写退出登录属性测试
    - **Property 7: 退出登录清除会话**
    - **Validates: Requirements 3.2, 3.3**

  - [x] 3.14 实现认证中间件
    - 创建 authMiddleware 检查用户是否已登录
    - 创建 adminMiddleware 检查用户是否为管理员
    - 未认证时返回 401 错误
    - 非管理员访问管理接口返回 403 错误
    - _Requirements: 2.2, 14.2, 14.3, 14.4_

  - [ ]* 3.15 编写认证中间件属性测试
    - **Property 4: 未登录用户访问控制**
    - **Validates: Requirements 2.2**

  - [ ]* 3.16 编写认证中间件属性测试
    - **Property 22: 管理员权限验证**
    - **Validates: Requirements 14.2, 14.3, 14.4**

- [x] 4. 用户服务和访问权限控制
  - [x] 4.1 实现访问权限检查
    - 创建 UserService.checkAccess 方法
    - 检查 accessDays 是否大于 0
    - 返回访问权限状态和剩余天数
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ]* 4.2 编写访问权限属性测试
    - **Property 8: 访问权限检查**
    - **Validates: Requirements 4.1, 4.2, 4.3**

  - [x] 4.3 实现每日天数递减定时任务
    - 使用 node-cron 创建定时任务（每天凌晨执行）
    - 实现 UserService.decrementAccessDays 方法
    - 对所有 accessDays > 0 的用户减 1
    - 记录执行日志
    - _Requirements: 4.4_

  - [ ]* 4.4 编写天数递减属性测试
    - **Property 9: 每日天数递减**
    - **Validates: Requirements 4.4**

  - [x] 4.5 实现用户管理功能
    - 创建 UserService.getAllUsers 方法
    - 创建 UserService.updateAccessDays 方法（管理员加天数）
    - 创建 UserService.resetPassword 方法
    - 创建 UserService.toggleUserStatus 方法（启用/禁用账号）
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 4.6 编写用户管理属性测试
    - **Property 24: 管理员用户操作**
    - **Validates: Requirements 15.2, 15.3, 15.4, 15.5**

- [x] 5. 学习内容管理服务
  - [x] 5.1 实现分类管理功能
    - 创建 LearningService.getAllCategories 方法
    - 创建 AdminService.createCategory 方法
    - 创建 AdminService.updateCategory 方法
    - 创建 AdminService.deleteCategory 方法（级联删除）
    - _Requirements: 5.2, 16.1, 16.2, 16.3, 16.4_

  - [ ]* 5.2 编写分类管理属性测试
    - **Property 10: 分类显示完整性**
    - **Validates: Requirements 5.2**

  - [x] 5.3 实现课程管理功能
    - 创建 LearningService.getLessonsByCategory 方法
    - 创建 AdminService.createLesson 方法
    - 创建 AdminService.updateLesson 方法
    - 创建 AdminService.deleteLesson 方法（级联删除）
    - _Requirements: 6.1, 6.2, 6.3, 16.5, 16.6, 16.7, 16.8_

  - [ ]* 5.4 编写课程管理属性测试
    - **Property 12: 课程列表显示**
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [x] 5.5 实现单词查询功能
    - 创建 LearningService.getWordsByLesson 方法
    - 返回课程的所有单词（按顺序）
    - 包含分类名称和课程编号信息
    - _Requirements: 6.4, 7.2_

- [x] 6. 答题逻辑实现
  - [x] 6.1 实现最长公共前缀算法
    - 创建 LearningService.calculateLongestCommonPrefix 方法
    - 实现 LCP 算法（忽略大小写）
    - 返回匹配的前缀字符串
    - _Requirements: 11.5, 22.5, 22.6_

  - [ ]* 6.2 编写 LCP 算法属性测试
    - **Property 19: 最长公共前缀计算**
    - **Validates: Requirements 11.5, 22.5**

  - [x] 6.3 实现答案比对功能
    - 创建 LearningService.checkAnswer 方法
    - 去除首尾空格并转换为小写
    - 比对用户输入和正确答案
    - 返回正确/错误状态、正确答案、中文翻译
    - 错误时返回最长公共前缀
    - _Requirements: 9.1, 9.2, 9.3, 22.1, 22.2, 22.3, 22.4_

  - [ ]* 6.4 编写答案比对属性测试
    - **Property 16: 答案比对逻辑**
    - **Validates: Requirements 9.2, 9.3, 22.1, 22.2, 22.3, 22.4**

- [ ] 7. Checkpoint - 确保后端核心功能测试通过
  - 运行所有后端单元测试和属性测试
  - 确认所有测试通过
  - 如有问题，询问用户


- [-] 8. 火山引擎 TTS 服务集成
  - [x] 8.1 实现 TTS 配置管理
    - 创建配置加密/解密工具（使用 AES-256-CBC）
    - 实现 AdminService.getTTSConfig 方法
    - 实现 AdminService.saveTTSConfig 方法（加密存储 APIKey 和 APISecret）
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ]* 8.2 编写 TTS 配置属性测试
    - **Property 31: 配置保存和读取往返**
    - **Validates: Requirements 18.2, 18.3, 18.4**

  - [ ] 8.3 实现火山引擎 TTS 服务类
    - 创建 VolcengineTTSService 类
    - 实现 API 签名生成（HMAC-SHA256）
    - 实现 synthesize 方法（调用火山引擎 API）
    - 配置请求超时（5 秒）
    - _Requirements: 19.1, 19.2, 19.3_

  - [ ]* 8.4 编写 TTS 服务属性测试
    - **Property 32: TTS 服务调用**
    - **Validates: Requirements 19.1, 19.2, 19.3**

  - [ ] 8.5 实现 TTS 错误处理和重试机制
    - 实现自动重试逻辑（最多 3 次，间隔递增）
    - 实现错误日志记录
    - 返回友好的错误提示（不暴露技术细节）
    - _Requirements: 19.4, 24.3, 24.5_

  - [ ]* 8.6 编写 TTS 错误处理属性测试
    - **Property 33: TTS 错误处理**
    - **Validates: Requirements 19.4, 24.3, 24.5**

  - [x] 8.7 实现三层音频缓存机制
    - 实现内存缓存（Map，LRU 策略，最多 100 个）
    - 实现数据库缓存（words.audio_cache_url）
    - 实现文件系统缓存（/cache/audio/*.mp3）
    - 实现缓存查询和更新逻辑
    - _Requirements: 19.5_

  - [ ]* 8.8 编写音频缓存属性测试
    - **Property 34: 音频缓存机制**
    - **Validates: Requirements 19.5**

  - [x] 8.9 实现音频文件保存和服务
    - 创建音频缓存目录
    - 实现音频文件保存（使用 MD5 哈希命名）
    - 实现音频文件读取 API（GET /api/tts/audio/:filename）
    - 添加文件名安全检查（防止路径遍历攻击）
    - _Requirements: 19.3, 19.5_

  - [ ] 8.10 实现 TTS 测试功能
    - 创建 AdminService.testTTSConnection 方法
    - 测试配置是否正确
    - 返回测试结果和音频 URL
    - _Requirements: 18.5_

- [x] 9. JSON 批量导入功能
  - [x] 9.1 实现 JSON 格式验证
    - 使用 Joi 创建 JSON Schema
    - 验证必需字段（category, lessons, lesson, words, en, cn）
    - 返回详细的验证错误信息
    - _Requirements: 17.2, 17.7, 17.8_

  - [ ]* 9.2 编写 JSON 格式验证属性测试
    - **Property 28: JSON 格式验证**
    - **Validates: Requirements 17.2, 17.8**

  - [x] 9.3 实现 JSON 导入服务
    - 创建 ImportService.importFromJSON 方法
    - 使用数据库事务确保原子性
    - 自动创建不存在的分类和课程
    - 批量插入单词数据
    - 失败时回滚所有更改
    - _Requirements: 17.3, 17.4, 17.5, 17.6_

  - [ ]* 9.4 编写 JSON 导入属性测试
    - **Property 29: JSON 导入自动创建**
    - **Validates: Requirements 17.3, 17.4, 17.5, 17.6**

  - [ ]* 9.5 编写 JSON 导入错误处理属性测试
    - **Property 30: JSON 导入错误处理**
    - **Validates: Requirements 17.7**

  - [x] 9.6 实现文件上传接口
    - 使用 multer 处理文件上传
    - 限制文件大小（最大 10MB）
    - 限制文件类型（仅 JSON）
    - 上传后自动删除临时文件
    - _Requirements: 17.1, 17.2_

- [ ] 10. 后端 API 路由实现
  - [ ] 10.1 实现认证相关 API
    - POST /api/auth/register（注册）
    - POST /api/auth/login（登录）
    - POST /api/auth/logout（退出）
    - GET /api/auth/check（检查认证状态）
    - _Requirements: 1, 2, 3_

  - [ ] 10.2 实现学习内容 API
    - GET /api/categories（获取所有分类）
    - GET /api/categories/:id/lessons（获取分类的课程列表）
    - GET /api/lessons/:id/words（获取课程的单词列表）
    - POST /api/words/check-answer（检查答案）
    - _Requirements: 5, 6, 9, 10, 11_

  - [ ] 10.3 实现 TTS 相关 API
    - POST /api/tts/synthesize（合成语音）
    - GET /api/tts/audio/:filename（获取音频文件）
    - _Requirements: 8, 19_

  - [ ] 10.4 实现管理员用户管理 API
    - GET /api/admin/users（获取所有用户）
    - PUT /api/admin/users/:id/reset-password（重置密码）
    - PUT /api/admin/users/:id/add-days（增加访问天数）
    - PUT /api/admin/users/:id/toggle-status（启用/禁用账号）
    - _Requirements: 15_

  - [ ] 10.5 实现管理员内容管理 API
    - POST /api/admin/categories（创建分类）
    - PUT /api/admin/categories/:id（更新分类）
    - DELETE /api/admin/categories/:id（删除分类）
    - POST /api/admin/lessons（创建课程）
    - PUT /api/admin/lessons/:id（更新课程）
    - DELETE /api/admin/lessons/:id（删除课程）
    - POST /api/admin/import-json（JSON 批量导入）
    - _Requirements: 16, 17_

  - [ ] 10.6 实现管理员配置管理 API
    - GET /api/admin/config/tts（获取 TTS 配置）
    - PUT /api/admin/config/tts（保存 TTS 配置）
    - POST /api/admin/config/tts/test（测试 TTS 配置）
    - _Requirements: 18_

- [ ] 11. Checkpoint - 确保所有后端 API 测试通过
  - 运行所有 API 集成测试
  - 使用 Supertest 测试所有端点
  - 确认所有测试通过
  - 如有问题，询问用户

- [x] 12. 前端项目初始化
  - [x] 12.1 创建 Vue.js 项目
    - 使用 Vite 创建 Vue 3 项目
    - 安装核心依赖：vue-router、axios、element-plus
    - 配置 Vite 开发服务器（代理后端 API）
    - 设置项目目录结构（views、components、services、utils）
    - _Requirements: 23.1, 23.2_

  - [x] 12.2 配置路由和导航守卫
    - 创建 Vue Router 配置
    - 定义所有页面路由（login, register, categories, lessons, learning, admin）
    - 实现路由守卫（检查认证状态和管理员权限）
    - 配置路由元信息（requiresAuth, requiresAdmin）
    - _Requirements: 2.2, 14.4_

  - [x] 12.3 创建 API 服务层
    - 创建 Axios 实例（配置 baseURL、超时）
    - 实现请求拦截器（添加 CSRF token）
    - 实现响应拦截器（统一错误处理）
    - 创建 API 服务模块（auth, learning, admin, tts）
    - _Requirements: 24.1, 24.2_

  - [x] 12.4 创建音频管理器
    - 创建 AudioManager 类
    - 实现音频播放功能（支持播放次数控制）
    - 实现音频预加载功能
    - 处理音频加载错误
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 25.3, 25.4_

  - [ ]* 12.5 编写音频预加载属性测试
    - **Property 39: 音频预加载**
    - **Validates: Requirements 25.4**

- [x] 13. 前端登录和注册页面
  - [x] 13.1 实现登录页面
    - 创建 LoginPage 组件
    - 实现用户名和密码输入表单
    - 实现表单验证（非空检查）
    - 调用登录 API 并处理响应
    - 登录成功后跳转到分类首页
    - 显示错误提示信息
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

  - [x] 13.2 实现注册页面
    - 创建 RegisterPage 组件
    - 实现用户名和密码输入表单
    - 实现密码长度验证（至少 6 个字符）
    - 调用注册 API 并处理响应
    - 注册成功后跳转到登录页
    - 显示错误提示信息（用户名已存在等）
    - _Requirements: 1.1, 1.2, 1.3, 1.6_

  - [x] 13.3 添加退出登录功能
    - 在导航栏添加退出登录按钮
    - 调用退出登录 API
    - 清除本地状态
    - 跳转到登录页
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 14. 前端学习内容页面
  - [x] 14.1 实现分类首页
    - 创建 CategoriesPage 组件
    - 调用 API 获取所有分类
    - 以卡片形式展示分类列表
    - 实现分类卡片点击跳转到课程列表
    - 显示访问权限到期提示
    - _Requirements: 5.1, 5.2, 5.3, 4.3, 4.5_

  - [ ]* 14.2 编写分类导航属性测试
    - **Property 11: 分类导航**
    - **Validates: Requirements 5.3**

  - [x] 14.3 实现课程列表页
    - 创建 LessonsPage 组件
    - 显示当前分类名称
    - 调用 API 获取课程列表
    - 按课程编号排序显示
    - 实现课程点击跳转到学习页面
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 14.4 编写课程导航属性测试
    - **Property 13: 课程导航**
    - **Validates: Requirements 6.4**

- [x] 15. 前端学习页面核心功能
  - [x] 15.1 实现学习页面布局
    - 创建 LearningPage 组件
    - 实现顶部信息栏（分类名称、课程编号、进度）
    - 实现单词显示区（英文、中文）
    - 实现答案输入框
    - 实现反馈信息区域
    - 实现控制按钮区域
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 15.2 实现学习进度显示
    - 显示当前题号和总题数（第 X 题 / 共 Y 题）
    - 计算并显示完成百分比
    - 实现进度条可视化
    - _Requirements: 20.1, 20.2_

  - [ ]* 15.3 编写学习进度属性测试
    - **Property 35: 学习进度计算**
    - **Validates: Requirements 20.1, 20.2**

  - [x] 15.4 实现自动语音播放
    - 进入页面时自动播放当前单词 2 遍
    - 切换到下一题时自动播放 2 遍
    - 切换到上一题时自动播放 2 遍
    - 重新本题时自动播放 2 遍
    - 手动点击播放按钮播放 1 遍
    - 播放时禁用播放按钮
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 12.5_

  - [ ]* 15.5 编写自动语音播放属性测试
    - **Property 14: 自动语音播放**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 10.4, 12.5**

  - [x] 15.6 实现空格键提交答案
    - 监听输入框的空格键事件
    - 阻止空格键默认行为
    - 触发答案提交逻辑
    - _Requirements: 9.1_

  - [ ]* 15.7 编写空格键提交属性测试
    - **Property 15: 空格键提交答案**
    - **Validates: Requirements 9.1**

  - [x] 15.8 实现正确答案处理流程
    - 显示完整的英文单词和中文翻译
    - 显示"正确"反馈信息
    - 等待 1 秒后自动跳转到下一题
    - 清空输入框
    - 自动播放新单词 2 遍
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 15.9 编写正确答案处理属性测试
    - **Property 17: 正确答案自动跳转**
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [x] 15.10 实现错误答案处理流程
    - 显示正确的英文单词和中文翻译
    - 显示"错误"反馈信息
    - 显示 1.5 秒后隐藏答案
    - 清空输入框中的错误部分
    - 保留最长公共前缀
    - 不跳转到下一题
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 15.11 编写错误答案处理属性测试
    - **Property 18: 错误答案处理流程**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 22.5, 22.6**


  - [x] 15.12 实现导航按钮功能
    - 实现上一题按钮（第一题时禁用）
    - 实现下一题按钮（最后一题时禁用）
    - 实现播放当前按钮
    - 实现显示答案按钮
    - 实现重新本题按钮
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3_

  - [ ]* 15.13 编写导航按钮属性测试
    - **Property 20: 导航按钮功能**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

  - [ ]* 15.14 编写显示答案功能属性测试
    - **Property 21: 显示答案功能**
    - **Validates: Requirements 13.1, 13.2, 13.3**

  - [x] 15.15 实现完成提示
    - 检测是否完成所有单词
    - 显示完成提示信息
    - 提供返回课程列表按钮
    - _Requirements: 20.3, 20.4_

- [ ] 16. Checkpoint - 确保学习页面功能完整
  - 测试学习页面所有交互功能
  - 确认答题逻辑正确
  - 确认语音播放正常
  - 如有问题，询问用户

- [ ] 17. 前端管理员后台
  - [ ] 17.1 实现管理员布局
    - 创建 AdminLayout 组件
    - 实现侧边栏导航（用户管理、内容管理、配置管理）
    - 实现顶部导航栏
    - 实现主内容区域
    - _Requirements: 14.3_

  - [ ] 17.2 实现用户管理页面
    - 创建 UserManagement 组件
    - 显示所有用户列表（用户名、剩余天数、账号状态）
    - 实现重置密码功能
    - 实现增加访问天数功能
    - 实现启用/禁用账号功能
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 17.3 编写用户列表显示属性测试
    - **Property 23: 用户列表显示完整性**
    - **Validates: Requirements 15.1**

  - [ ] 17.4 实现内容管理页面
    - 创建 ContentManagement 组件
    - 实现分类管理（添加、修改、删除）
    - 实现课程管理（添加、修改、删除）
    - 显示级联删除警告
    - 实现 JSON 批量导入功能（文件上传）
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 17.1_

  - [ ] 17.5 实现配置管理页面
    - 创建 ConfigManagement 组件
    - 实现 TTS 配置表单（AppID、APIKey、APISecret、音色、语速、音量）
    - 实现配置保存功能
    - 实现配置测试功能
    - 显示测试结果和音频播放
    - _Requirements: 18.1, 18.2, 18.3, 18.5_

- [ ] 18. 安全措施实施
  - [ ] 18.1 实现 CSRF 防护
    - 安装并配置 csurf 中间件
    - 实现 CSRF token 生成接口
    - 在前端所有 POST 请求中包含 CSRF token
    - _Requirements: 24.5_

  - [ ] 18.2 实现 XSS 防护
    - 安装并配置 xss 库
    - 对所有用户输入进行清理
    - 配置 Content Security Policy（使用 helmet）
    - _Requirements: 24.5_

  - [ ] 18.3 实现速率限制
    - 安装并配置 express-rate-limit
    - 对登录接口限流（15 分钟最多 5 次）
    - 对 API 全局限流（1 分钟最多 100 次）
    - _Requirements: 24.1, 24.2_

  - [ ] 18.4 实现安全响应头
    - 使用 helmet 配置所有安全响应头
    - 配置 HTTPS 强制重定向（生产环境）
    - 配置 HSTS、X-Frame-Options 等
    - _Requirements: 24.5_

  - [ ] 18.5 实现文件上传安全
    - 配置 multer 文件大小限制（10MB）
    - 配置文件类型限制（仅 JSON）
    - 实现文件名安全检查
    - 上传后自动删除临时文件
    - _Requirements: 17.1, 17.2_

  - [ ]* 18.6 编写安全措施属性测试
    - **Property 37: 错误消息安全性**
    - **Validates: Requirements 24.5**

- [ ] 19. 性能优化
  - [ ] 19.1 实现数据库查询优化
    - 确认所有必需索引已创建
    - 优化查询（只查询需要的字段）
    - 使用 JOIN 减少查询次数
    - 实现分页功能（用户列表）
    - _Requirements: 25.1, 25.2, 25.5_

  - [ ] 19.2 实现缓存策略
    - 使用 node-cache 缓存分类列表（10 分钟）
    - 实现缓存失效机制（内容更新时清除）
    - 缓存 TTS 配置（避免频繁读取数据库）
    - _Requirements: 25.5_

  - [ ] 19.3 实现前端资源优化
    - 配置 Vite 代码分割（vendor、admin 分离）
    - 配置生产环境代码压缩
    - 移除生产环境 console.log
    - 配置 Gzip 压缩
    - _Requirements: 23.1, 23.2, 25.5_

  - [ ] 19.4 实现音频预加载优化
    - 在显示当前单词时预加载下一题音频
    - 预加载下下题音频（可选）
    - 异步预加载，不阻塞当前操作
    - _Requirements: 25.3, 25.4_

- [ ] 20. 日志和监控
  - [ ] 20.1 实现日志系统
    - 使用 winston 配置日志记录
    - 实现日志分级（error, warn, info, debug）
    - 配置日志文件输出（error.log, combined.log）
    - 实现日志脱敏（密码、API 密钥）
    - _Requirements: 19.4, 24.4_

  - [ ]* 20.2 编写日志记录属性测试
    - **Property 38: 数据库错误日志记录**
    - **Validates: Requirements 24.4**

  - [ ] 20.3 实现错误处理中间件
    - 创建全局错误处理中间件
    - 根据错误类型返回适当的 HTTP 状态码
    - 记录错误日志
    - 返回友好的错误信息（不暴露技术细节）
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 24.5_

- [ ] 21. 响应式设计
  - [ ] 21.1 实现移动端适配
    - 使用 CSS 媒体查询适配不同屏幕尺寸
    - 优化学习页面在移动设备上的布局
    - 确保所有按钮在触摸屏上可点击
    - 测试在不同设备上的显示效果
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

  - [ ] 21.2 优化触摸交互
    - 增大按钮点击区域（移动端）
    - 优化输入框焦点处理
    - 防止双击缩放（viewport 配置）
    - _Requirements: 23.4_

- [ ] 22. 数据库备份和恢复
  - [ ] 22.1 创建数据库备份脚本
    - 编写 backup.sh 脚本（mysqldump）
    - 实现自动压缩备份文件
    - 实现自动删除 7 天前的备份
    - _Requirements: 21.5_

  - [ ] 22.2 配置定时备份任务
    - 配置 crontab 定时任务（每天凌晨 2 点）
    - 测试备份脚本执行
    - 验证备份文件完整性
    - _Requirements: 21.5_

- [ ] 23. 部署准备
  - [ ] 23.1 创建生产环境配置
    - 创建 .env.production 配置文件模板
    - 配置生产环境数据库连接（MySQL）
    - 配置 Redis 连接（Session 存储）
    - 配置 HTTPS 和安全设置
    - _Requirements: 21.1, 21.2, 21.3_

  - [ ] 23.2 创建 PM2 配置
    - 创建 ecosystem.config.js
    - 配置 Cluster 模式（多进程）
    - 配置自动重启和日志
    - 配置环境变量
    - _Requirements: 25.5_

  - [ ] 23.3 创建 Nginx 配置
    - 配置反向代理（前端静态文件 + 后端 API）
    - 配置 HTTPS（SSL 证书）
    - 配置 Gzip 压缩
    - 配置负载均衡（可选）
    - _Requirements: 23.1, 25.5_

  - [ ] 23.4 编写部署文档
    - 创建 README.md（项目说明）
    - 创建 DEPLOYMENT.md（部署指南）
    - 说明环境要求和依赖安装
    - 说明数据库初始化步骤
    - 说明配置文件设置
    - _Requirements: 所有需求_

- [ ] 24. 端到端测试
  - [ ]* 24.1 编写用户注册登录流程测试
    - 测试完整的注册流程
    - 测试完整的登录流程
    - 测试退出登录流程
    - _Requirements: 1, 2, 3_

  - [ ]* 24.2 编写学习流程测试
    - 测试浏览分类和课程
    - 测试完整的学习流程（答题、导航、语音）
    - 测试访问权限控制
    - _Requirements: 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20_

  - [ ]* 24.3 编写管理员功能测试
    - 测试用户管理功能
    - 测试内容管理功能
    - 测试 JSON 导入功能
    - 测试 TTS 配置功能
    - _Requirements: 14, 15, 16, 17, 18_

- [ ] 25. Final Checkpoint - 完整系统测试
  - 运行所有单元测试、属性测试、集成测试
  - 在开发环境进行完整的手动测试
  - 测试所有用户场景和边界情况
  - 确认所有功能正常工作
  - 如有问题，询问用户

## Notes

- 任务标记 `*` 的为可选测试任务，可以跳过以加快 MVP 开发
- 每个任务都引用了具体的需求编号，确保可追溯性
- Checkpoint 任务用于在关键节点验证系统状态
- 属性测试使用 fast-check 库，每个属性至少运行 100 次迭代
- 单元测试使用 Jest（后端）和 Vitest（前端）
- 所有测试任务都明确标注了验证的属性编号和需求编号
- 实现顺序遵循依赖关系：基础设施 → 数据库 → 后端 → 前端 → 优化 → 测试

## Implementation Language

- 后端：Node.js 18+ with Express 4.x
- 前端：Vue.js 3.x with Vite
- 数据库：SQLite (开发) / MySQL 8.0+ (生产)
- ORM：Sequelize
- 测试：Jest (后端) / Vitest (前端) + fast-check (属性测试)

## Getting Started

完成任务列表后，可以通过以下步骤开始实现：

1. 打开 tasks.md 文件
2. 点击任务旁边的 "Start task" 按钮
3. Kiro 将引导你完成该任务的实现
4. 完成后继续下一个任务

祝开发顺利！
