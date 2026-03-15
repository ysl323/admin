# 需求文档：学习模式功能

## 简介

为英语学习系统的学习页面增加两种新的学习模式：随机学习模式和循环学习模式，让用户可以用不同的方式练习当前课程的单词。

## 术语表

- **System**: 英语学习系统
- **Learning_Page**: 学习页面，用户进行单词学习和练习的界面
- **Random_Mode**: 随机学习模式，从当前课程随机选择单词进行练习
- **Loop_Mode**: 循环学习模式，按顺序循环展示当前课程的所有单词
- **Random_Loop_Mode**: 随机循环学习模式，随机顺序循环展示当前课程的所有单词
- **Current_Lesson**: 当前课程，用户正在学习的课程
- **Word**: 单词，包含英文、中文翻译和音频的学习内容
- **Learning_Session**: 学习会话，用户一次完整的学习过程

## 需求

### 需求 1: 学习模式选择

**用户故事:** 作为学习者，我想要选择不同的学习模式，以便用适合自己的方式练习单词。

#### 验收标准

1. WHEN Learning_Page 加载时，THEN THE System SHALL 显示学习模式选择界面
2. THE System SHALL 提供四种学习模式选项：顺序模式、随机模式、循环模式、随机循环模式
3. WHEN 用户选择一种学习模式，THEN THE System SHALL 激活该模式并开始学习会话
4. THE System SHALL 在界面上清晰标识当前激活的学习模式
5. WHEN 用户切换学习模式，THEN THE System SHALL 保存当前学习进度并切换到新模式

### 需求 2: 随机学习模式

**用户故事:** 作为学习者，我想要随机练习单词，以便打破记忆顺序依赖，提高学习效果。

#### 验收标准

1. WHEN Random_Mode 被激活，THEN THE System SHALL 从 Current_Lesson 的所有单词中随机选择一个单词展示
2. WHEN 用户完成当前单词的学习，THEN THE System SHALL 随机选择下一个单词
3. THE System SHALL 确保在一个学习会话中每个单词至少被展示一次后才重复
4. WHEN 所有单词都被学习过一次，THEN THE System SHALL 提示用户完成一轮学习
5. THE System SHALL 允许用户继续新一轮的随机学习
6. THE System SHALL 记录每个单词在随机模式下的学习次数

### 需求 3: 循环学习模式

**用户故事:** 作为学习者，我想要循环练习单词，以便通过重复加深记忆。

#### 验收标准

1. WHEN Loop_Mode 被激活，THEN THE System SHALL 按顺序展示 Current_Lesson 的第一个单词
2. WHEN 用户完成当前单词的学习，THEN THE System SHALL 展示下一个单词
3. WHEN 到达课程最后一个单词，THEN THE System SHALL 自动返回到第一个单词继续循环
4. THE System SHALL 在界面上显示当前单词在课程中的位置（例如：3/20）
5. THE System SHALL 显示当前已完成的循环次数
6. THE System SHALL 允许用户随时暂停或退出循环学习

### 需求 4: 随机循环学习模式

**用户故事:** 作为学习者，我想要以随机顺序循环练习单词，以便既打破顺序记忆又能完整覆盖所有单词。

#### 验收标准

1. WHEN Random_Loop_Mode 被激活，THEN THE System SHALL 将 Current_Lesson 的所有单词随机打乱顺序
2. THE System SHALL 按照打乱后的顺序依次展示所有单词
3. WHEN 完成一轮所有单词的学习，THEN THE System SHALL 重新随机打乱顺序开始新一轮
4. THE System SHALL 确保每一轮中所有单词都被展示一次且仅一次
5. THE System SHALL 在界面上显示当前单词在本轮中的位置（例如：5/20）
6. THE System SHALL 显示当前已完成的循环次数
7. THE System SHALL 在每轮开始时生成新的随机顺序

### 需求 5: 学习进度追踪

**用户故事:** 作为学习者，我想要看到我的学习进度，以便了解学习效果。

#### 验收标准

1. THE System SHALL 显示当前学习会话中已学习的单词数量
2. THE System SHALL 显示当前课程的总单词数量
3. WHEN 使用 Random_Mode，THEN THE System SHALL 显示本轮已学习和未学习的单词数量
4. WHEN 使用 Loop_Mode 或 Random_Loop_Mode，THEN THE System SHALL 显示当前循环次数和单词位置
5. THE System SHALL 在用户切换模式时保留学习进度统计

### 需求 6: 用户交互体验

**用户故事:** 作为学习者，我想要流畅的交互体验，以便专注于学习内容。

#### 验收标准

1. THE System SHALL 在 500 毫秒内响应模式切换操作
2. THE System SHALL 在 300 毫秒内加载并显示下一个单词
3. WHEN 用户输入答案，THEN THE System SHALL 立即提供反馈
4. THE System SHALL 支持键盘快捷键进行模式切换和单词导航
5. THE System SHALL 在移动设备上提供触摸友好的界面

### 需求 7: 数据持久化

**用户故事:** 作为学习者，我想要系统记住我的学习偏好，以便下次学习时继续使用。

#### 验收标准

1. THE System SHALL 保存用户最后使用的学习模式
2. WHEN 用户重新打开 Learning_Page，THEN THE System SHALL 自动加载上次使用的学习模式
3. THE System SHALL 保存每种模式下的学习进度
4. THE System SHALL 在用户登出时保存所有学习数据
5. THE System SHALL 在用户重新登录时恢复学习数据
