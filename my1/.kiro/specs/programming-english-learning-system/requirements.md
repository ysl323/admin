# Requirements Document

## Introduction

本文档定义了编程英语单词学习系统的功能需求。该系统是一个面向编程学习者的在线英语单词学习平台，提供分类课程管理、智能学习功能、语音合成和完整的用户权限管理。系统包含学生端学习界面和管理员后台管理系统。

## Glossary

- **System**: 编程英语单词学习系统
- **User**: 注册用户，可以访问学习内容
- **Admin**: 超级管理员，可以管理用户和内容
- **Category**: 学习分类（如基础英语、ESP32、Java等）
- **Lesson**: 课程，属于某个分类
- **Word**: 单词，包含英文和中文翻译
- **Trial_Period**: 试用期，新用户注册后获得的免费使用天数
- **Access_Days**: 访问天数，用户可以访问学习内容的剩余天数
- **TTS_Service**: 火山引擎语音合成服务
- **Learning_Page**: 单词学习页面，核心学习界面
- **Answer_Input**: 答案输入框，用户输入英文单词的地方
- **Session**: 用户登录会话

## Requirements

### Requirement 1: 用户注册

**User Story:** 作为新用户，我想要注册账号，以便开始学习编程英语单词

#### Acceptance Criteria

1. THE System SHALL 提供用户注册界面，包含用户名和密码输入字段
2. WHEN 用户提交注册信息，THE System SHALL 验证用户名唯一性
3. WHEN 用户名已存在，THE System SHALL 返回错误提示
4. WHEN 注册成功，THE System SHALL 创建用户账号并自动设置 Trial_Period 为 3 天
5. WHEN 注册成功，THE System SHALL 将 Access_Days 初始化为 3
6. THE System SHALL 要求密码长度至少为 6 个字符

### Requirement 2: 用户登录

**User Story:** 作为注册用户，我想要登录系统，以便访问学习内容

#### Acceptance Criteria

1. THE System SHALL 默认显示登录页面作为首页
2. WHEN 用户未登录，THE System SHALL 阻止访问除登录和注册页面外的所有页面
3. WHEN 用户提交登录凭证，THE System SHALL 验证用户名和密码
4. WHEN 登录凭证正确，THE System SHALL 创建 Session 并跳转到分类首页
5. WHEN 登录凭证错误，THE System SHALL 返回错误提示
6. THE System SHALL 持久化 Session 状态，直到用户主动退出或 Session 过期

### Requirement 3: 用户退出登录

**User Story:** 作为已登录用户，我想要退出登录，以便保护我的账号安全

#### Acceptance Criteria

1. WHILE 用户已登录，THE System SHALL 在界面上显示退出登录按钮
2. WHEN 用户点击退出登录，THE System SHALL 清除 Session 状态
3. WHEN 用户退出登录，THE System SHALL 跳转到登录页面

### Requirement 4: 访问权限控制

**User Story:** 作为系统管理员，我想要控制用户访问权限，以便实现付费使用模式

#### Acceptance Criteria

1. WHEN 用户登录，THE System SHALL 检查 Access_Days 是否大于 0
2. WHEN Access_Days 大于 0，THE System SHALL 允许用户访问学习内容
3. WHEN Access_Days 等于 0，THE System SHALL 阻止用户访问学习内容并显示试用到期提示
4. THE System SHALL 每天自动减少活跃用户的 Access_Days 数值 1
5. WHEN 用户试用到期，THE System SHALL 显示提示信息引导联系管理员

### Requirement 5: 分类首页显示

**User Story:** 作为用户，我想要看到所有学习分类，以便选择我感兴趣的内容

#### Acceptance Criteria

1. WHEN 用户登录成功且有访问权限，THE System SHALL 显示分类首页
2. THE System SHALL 以卡片形式展示所有 Category
3. WHEN 用户点击 Category 卡片，THE System SHALL 跳转到该分类的课程列表页

### Requirement 6: 课程列表显示

**User Story:** 作为用户，我想要看到某个分类下的所有课程，以便选择学习进度

#### Acceptance Criteria

1. WHEN 用户进入课程列表页，THE System SHALL 显示当前 Category 名称
2. THE System SHALL 显示该 Category 下所有 Lesson 的列表
3. THE System SHALL 按课程编号顺序显示 Lesson
4. WHEN 用户点击 Lesson，THE System SHALL 跳转到该课程的 Learning_Page

### Requirement 7: 学习页面布局

**User Story:** 作为用户，我想要清晰的学习界面，以便专注于单词学习

#### Acceptance Criteria

1. THE Learning_Page SHALL 在顶部显示当前 Category 名称、Lesson 编号和学习进度
2. THE Learning_Page SHALL 在中间区域显示隐藏的英文单词和 Answer_Input
3. THE Learning_Page SHALL 在底部显示提示信息区域
4. THE Learning_Page SHALL 显示功能按钮：上一题、下一题、播放当前、显示答案、重新本题

### Requirement 8: 自动语音播放

**User Story:** 作为用户，我想要自动听到单词发音，以便学习正确读音

#### Acceptance Criteria

1. WHEN 用户进入 Learning_Page，THE System SHALL 自动调用 TTS_Service 播放当前单词英文发音 2 遍
2. WHEN 用户切换到下一题，THE System SHALL 自动播放新单词英文发音 2 遍
3. WHEN 用户切换到上一题，THE System SHALL 自动播放该单词英文发音 2 遍
4. WHEN 用户点击播放当前按钮，THE System SHALL 调用 TTS_Service 播放当前单词英文发音 1 遍

### Requirement 9: 答题提交

**User Story:** 作为用户，我想要通过空格键提交答案，以便快速学习

#### Acceptance Criteria

1. WHEN 用户在 Answer_Input 中按下空格键，THE System SHALL 提交当前输入的答案
2. WHEN 用户提交答案，THE System SHALL 比较输入内容与正确英文单词（忽略大小写）
3. THE System SHALL 在提交前自动去除输入内容首尾的空格

### Requirement 10: 正确答案处理

**User Story:** 作为用户，当我答对时，我想要自动进入下一题，以便保持学习流畅性

#### Acceptance Criteria

1. WHEN 用户答案正确，THE System SHALL 显示完整的英文单词和中文翻译
2. WHEN 用户答案正确，THE System SHALL 在 1 秒后自动跳转到下一题
3. WHEN 自动跳转到下一题，THE System SHALL 清空 Answer_Input
4. WHEN 自动跳转到下一题，THE System SHALL 自动播放新单词发音 2 遍

### Requirement 11: 错误答案处理

**User Story:** 作为用户，当我答错时，我想要看到正确答案并继续尝试，以便加深记忆

#### Acceptance Criteria

1. WHEN 用户答案错误，THE System SHALL 显示正确的英文单词和中文翻译
2. WHEN 用户答案错误，THE System SHALL 显示正确答案 1.5 秒
3. WHEN 显示时间结束，THE System SHALL 隐藏正确答案
4. WHEN 显示时间结束，THE System SHALL 清空 Answer_Input 中的错误部分
5. WHEN 显示时间结束，THE System SHALL 保留 Answer_Input 中与正确答案匹配的前缀部分
6. WHEN 用户答案错误，THE System SHALL 不跳转到下一题

### Requirement 12: 导航按钮功能

**User Story:** 作为用户，我想要手动控制学习进度，以便按自己的节奏学习

#### Acceptance Criteria

1. WHEN 用户点击下一题按钮，THE System SHALL 跳转到下一个 Word
2. WHEN 用户点击上一题按钮，THE System SHALL 跳转到上一个 Word
3. WHEN 当前是第一题，THE System SHALL 禁用上一题按钮
4. WHEN 当前是最后一题，THE System SHALL 禁用下一题按钮
5. WHEN 用户点击重新本题按钮，THE System SHALL 清空 Answer_Input 并重新播放当前单词 2 遍

### Requirement 13: 显示答案功能

**User Story:** 作为用户，我想要查看答案，以便在遇到困难时获得帮助

#### Acceptance Criteria

1. WHEN 用户点击显示答案按钮，THE System SHALL 显示当前单词的英文和中文翻译
2. WHEN 用户点击显示答案按钮，THE System SHALL 在 Answer_Input 中填充正确的英文单词
3. WHEN 显示答案后，THE System SHALL 不自动跳转到下一题

### Requirement 14: 管理员登录

**User Story:** 作为管理员，我想要登录后台管理系统，以便管理用户和内容

#### Acceptance Criteria

1. THE System SHALL 提供管理员登录入口
2. WHEN Admin 提交登录凭证，THE System SHALL 验证管理员权限
3. WHEN 管理员登录成功，THE System SHALL 跳转到后台管理首页
4. WHEN 非管理员尝试访问后台，THE System SHALL 拒绝访问并返回错误提示

### Requirement 15: 用户管理

**User Story:** 作为管理员，我想要管理用户账号，以便控制用户访问权限

#### Acceptance Criteria

1. THE System SHALL 显示所有用户列表，包含用户名、Access_Days、账号状态
2. WHEN Admin 选择用户并点击重置密码，THE System SHALL 将该用户密码重置为默认值
3. WHEN Admin 选择用户并输入天数，THE System SHALL 增加该用户的 Access_Days
4. WHEN Admin 点击禁用账号，THE System SHALL 将用户状态设置为禁用
5. WHEN Admin 点击启用账号，THE System SHALL 将用户状态设置为启用
6. WHEN 用户账号被禁用，THE System SHALL 阻止该用户登录

### Requirement 16: 分类和课程管理

**User Story:** 作为管理员，我想要管理学习内容，以便更新和维护课程

#### Acceptance Criteria

1. THE System SHALL 提供添加 Category 的界面
2. THE System SHALL 提供修改 Category 名称的功能
3. THE System SHALL 提供删除 Category 的功能
4. WHEN Admin 删除 Category，THE System SHALL 同时删除该分类下的所有 Lesson 和 Word
5. THE System SHALL 提供添加 Lesson 到指定 Category 的功能
6. THE System SHALL 提供修改 Lesson 的功能
7. THE System SHALL 提供删除 Lesson 的功能
8. WHEN Admin 删除 Lesson，THE System SHALL 同时删除该课程下的所有 Word

### Requirement 17: JSON 批量导入

**User Story:** 作为管理员，我想要批量导入单词数据，以便快速创建课程内容

#### Acceptance Criteria

1. THE System SHALL 提供 JSON 文件上传界面
2. WHEN Admin 上传 JSON 文件，THE System SHALL 验证 JSON 格式是否符合规范
3. WHEN JSON 格式正确，THE System SHALL 解析 category、lessons 和 words 数据
4. WHEN Category 不存在，THE System SHALL 自动创建该 Category
5. WHEN Lesson 不存在，THE System SHALL 自动创建该 Lesson
6. THE System SHALL 批量插入所有 Word 数据到对应的 Lesson
7. WHEN JSON 格式错误，THE System SHALL 返回详细的错误信息
8. THE System SHALL 支持以下 JSON 格式：包含 category 字段、lessons 数组、每个 lesson 包含 lesson 编号和 words 数组、每个 word 包含 en 和 cn 字段

### Requirement 18: 语音配置管理

**User Story:** 作为管理员，我想要配置语音合成服务，以便系统能够正常发音

#### Acceptance Criteria

1. THE System SHALL 提供火山引擎 API 配置界面
2. THE System SHALL 允许 Admin 输入和保存 AppID、APIKey 和 APISecret
3. WHEN Admin 保存配置，THE System SHALL 验证配置信息格式
4. THE System SHALL 加密存储 APIKey 和 APISecret
5. THE System SHALL 提供测试语音合成功能，验证配置是否正确

### Requirement 19: 火山引擎语音合成集成

**User Story:** 作为用户，我想要听到清晰的英文发音，以便学习正确的读音

#### Acceptance Criteria

1. THE System SHALL 使用火山引擎 TTS_Service 生成所有英文单词发音
2. WHEN System 调用 TTS_Service，THE System SHALL 使用管理员配置的 AppID、APIKey 和 APISecret
3. WHEN TTS_Service 返回音频数据，THE System SHALL 在浏览器中播放音频
4. WHEN TTS_Service 调用失败，THE System SHALL 记录错误日志并向用户显示友好提示
5. THE System SHALL 缓存已生成的音频，避免重复调用 TTS_Service

### Requirement 20: 学习进度显示

**User Story:** 作为用户，我想要看到学习进度，以便了解当前学习状态

#### Acceptance Criteria

1. THE Learning_Page SHALL 显示当前题号和总题数（格式：第 X 题 / 共 Y 题）
2. THE Learning_Page SHALL 计算并显示完成百分比
3. WHEN 用户完成所有单词，THE System SHALL 显示完成提示
4. WHEN 用户完成所有单词，THE System SHALL 提供返回课程列表的按钮

### Requirement 21: 数据持久化

**User Story:** 作为系统，我需要持久化存储所有数据，以便保证数据安全

#### Acceptance Criteria

1. THE System SHALL 使用数据库存储所有 User 数据
2. THE System SHALL 使用数据库存储所有 Category、Lesson 和 Word 数据
3. THE System SHALL 使用数据库存储管理员配置信息
4. THE System SHALL 加密存储用户密码
5. THE System SHALL 定期备份数据库

### Requirement 22: 答案比对逻辑

**User Story:** 作为用户，我想要系统智能比对答案，以便获得准确的反馈

#### Acceptance Criteria

1. WHEN 比对答案，THE System SHALL 忽略大小写差异
2. WHEN 比对答案，THE System SHALL 忽略首尾空格
3. WHEN 答案完全匹配，THE System SHALL 判定为正确
4. WHEN 答案不完全匹配，THE System SHALL 判定为错误
5. WHEN 答案错误，THE System SHALL 计算用户输入与正确答案的最长公共前缀
6. WHEN 答案错误，THE System SHALL 保留最长公共前缀部分在 Answer_Input 中

### Requirement 23: 响应式界面设计

**User Story:** 作为用户，我想要在不同设备上使用系统，以便随时随地学习

#### Acceptance Criteria

1. THE System SHALL 在桌面浏览器上正常显示所有功能
2. THE System SHALL 在移动设备浏览器上正常显示所有功能
3. THE System SHALL 根据屏幕尺寸自动调整布局
4. THE System SHALL 确保所有按钮在触摸屏上可点击

### Requirement 24: 错误处理和用户反馈

**User Story:** 作为用户，我想要清晰的错误提示，以便了解问题所在

#### Acceptance Criteria

1. WHEN 系统发生错误，THE System SHALL 显示友好的错误提示信息
2. WHEN 网络请求失败，THE System SHALL 提示用户检查网络连接
3. WHEN TTS_Service 调用失败，THE System SHALL 提示语音服务暂时不可用
4. WHEN 数据库操作失败，THE System SHALL 记录错误日志
5. THE System SHALL 不向用户暴露技术细节和敏感信息

### Requirement 25: 性能要求

**User Story:** 作为用户，我想要系统快速响应，以便流畅学习

#### Acceptance Criteria

1. WHEN 用户提交答案，THE System SHALL 在 100 毫秒内返回结果
2. WHEN 用户切换题目，THE System SHALL 在 200 毫秒内加载新题目
3. WHEN 用户点击播放，THE System SHALL 在 500 毫秒内开始播放音频
4. THE System SHALL 预加载下一题的音频，减少等待时间
5. THE System SHALL 优化数据库查询，确保页面加载时间小于 1 秒
