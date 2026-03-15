# Design Document

## Overview

编程英语单词学习系统是一个面向编程学习者的在线英语单词学习平台。系统采用前后端分离架构，提供用户学习界面和管理员后台管理系统。核心功能包括：

- 用户注册登录和访问权限控制（基于天数的试用机制）
- 分类课程管理和单词学习
- 智能答题系统（自动播放语音、答案比对、错误处理）
- 火山引擎语音合成集成
- 管理员后台（用户管理、内容管理、配置管理）
- JSON 批量导入功能

系统设计目标：
- 简洁直观的学习体验
- 快速响应（答题反馈 < 100ms）
- 可扩展的内容管理
- 安全的用户数据保护

## Architecture

### 技术栈选型

**前端技术栈：**
- HTML5 + CSS3 + JavaScript (ES6+)
- 可选框架：Vue.js 3.x（推荐用于管理后台的复杂交互）
- UI 组件库：Element Plus（Vue）或原生 CSS
- HTTP 客户端：Axios
- 音频播放：Web Audio API / HTML5 Audio

**后端技术栈：**
- Node.js 18+ + Express 4.x
- 认证：express-session + connect-redis（Session 管理）
- 密码加密：bcrypt
- 数据验证：joi
- 日志：winston
- 定时任务：node-cron（每日减少 access_days）

**数据库：**
- 开发环境：SQLite 3.x（轻量级，易于部署）
- 生产环境：MySQL 8.0+（支持高并发）
- ORM：Sequelize（支持多数据库切换）

**第三方服务：**
- 火山引擎语音合成 API（TTS）

### 架构模式

采用 **前后端分离 + RESTful API** 架构：

```
┌─────────────────────────────────────────────────────────┐
│                      前端层 (Frontend)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  学习界面     │  │  管理后台     │  │  登录注册     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │ HTTP/HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API 网关层 (Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  认证中间件   │  │  权限中间件   │  │  日志中间件   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    业务逻辑层 (Services)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  用户服务     │  │  学习服务     │  │  管理服务     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  TTS 服务     │  │  导入服务     │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   数据访问层 (Models)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  User Model  │  │ Category Model│  │ Lesson Model │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │  Word Model  │  │ Config Model │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  数据存储层 (Database)                    │
│              SQLite (Dev) / MySQL (Prod)                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  外部服务 (External)                      │
│              火山引擎 TTS API + 音频缓存                  │
└─────────────────────────────────────────────────────────┘
```

### 部署方案

**开发环境：**
- 前端：Vite Dev Server (localhost:5173)
- 后端：Node.js (localhost:3000)
- 数据库：SQLite (本地文件)

**生产环境：**
- 前端：Nginx 静态文件服务 + Gzip 压缩
- 后端：PM2 进程管理 + Node.js Cluster 模式
- 数据库：MySQL 主从复制
- 反向代理：Nginx (HTTPS + 负载均衡)
- 音频缓存：本地文件系统或 CDN

**推荐部署架构：**
```
Internet
    │
    ▼
┌─────────────────┐
│  Nginx (HTTPS)  │
│  Port 443       │
└─────────────────┘
    │
    ├─────────────────┐
    │                 │
    ▼                 ▼
┌─────────┐    ┌─────────────┐
│ Static  │    │  Node.js    │
│ Files   │    │  Backend    │
│ (前端)   │    │  Port 3000  │
└─────────┘    └─────────────┘
                      │
                      ▼
               ┌─────────────┐
               │   MySQL     │
               │  Port 3306  │
               └─────────────┘
```

## Components and Interfaces

### 前端组件结构

**页面组件：**

1. **LoginPage** - 登录页面
   - 输入：用户名、密码
   - 输出：跳转到分类首页或显示错误

2. **RegisterPage** - 注册页面
   - 输入：用户名、密码
   - 输出：创建账号并跳转到登录页

3. **CategoriesPage** - 分类首页
   - 显示所有分类卡片
   - 点击跳转到课程列表

4. **LessonsPage** - 课程列表页
   - 显示指定分类下的所有课程
   - 点击跳转到学习页面

5. **LearningPage** - 学习页面（核心组件）
   - 子组件：
     - ProgressBar：显示进度（第 X 题 / 共 Y 题）
     - WordDisplay：显示隐藏/显示的英文单词
     - AnswerInput：字母格子式输入框
     - TranslationDisplay：中文翻译显示
     - ControlButtons：上一题、下一题、播放、显示答案、重新本题
     - FeedbackMessage：正确/错误反馈提示

6. **AdminLayout** - 管理后台布局
   - 侧边栏导航
   - 子页面：
     - UserManagement：用户管理
     - ContentManagement：内容管理
     - ConfigManagement：配置管理

### 后端服务模块

**1. AuthService - 认证服务**
```javascript
class AuthService {
  async register(username, password)
  async login(username, password)
  async logout(sessionId)
  async checkAuth(sessionId)
  async checkAdmin(userId)
}
```

**2. UserService - 用户服务**
```javascript
class UserService {
  async getAllUsers()
  async getUserById(userId)
  async updateAccessDays(userId, days)
  async resetPassword(userId, newPassword)
  async toggleUserStatus(userId)
  async decrementAccessDays() // 定时任务调用
}
```

**3. LearningService - 学习服务**
```javascript
class LearningService {
  async getAllCategories()
  async getLessonsByCategory(categoryId)
  async getWordsByLesson(lessonId)
  async checkAnswer(wordId, userInput)
  calculateLongestCommonPrefix(input, correct)
}
```

**4. TTSService - 语音合成服务**
```javascript
class TTSService {
  async synthesize(text)
  async getCachedAudio(word)
  async cacheAudio(word, audioData)
  async testConnection(config)
}
```

**5. AdminService - 管理服务**
```javascript
class AdminService {
  // 分类管理
  async createCategory(name)
  async updateCategory(id, name)
  async deleteCategory(id) // 级联删除
  
  // 课程管理
  async createLesson(categoryId, lessonNumber)
  async updateLesson(id, data)
  async deleteLesson(id) // 级联删除
  
  // 批量导入
  async importFromJSON(jsonData)
  
  // 配置管理
  async getTTSConfig()
  async saveTTSConfig(config)
}
```

### API 接口定义

**认证相关：**

```
POST /api/auth/register
Request: { username: string, password: string }
Response: { success: boolean, message: string }

POST /api/auth/login
Request: { username: string, password: string }
Response: { success: boolean, user: { id, username, accessDays, isAdmin } }

POST /api/auth/logout
Response: { success: boolean }

GET /api/auth/check
Response: { authenticated: boolean, user: { id, username, accessDays, isAdmin } }
```

**学习内容：**

```
GET /api/categories
Response: { categories: [{ id, name, createdAt }] }

GET /api/categories/:id/lessons
Response: { categoryName: string, lessons: [{ id, lessonNumber, wordCount }] }

GET /api/lessons/:id/words
Response: { 
  lessonId: number,
  categoryName: string,
  lessonNumber: number,
  words: [{ id, english, chinese }]
}

POST /api/words/check-answer
Request: { wordId: number, answer: string }
Response: { 
  correct: boolean, 
  correctAnswer: string,
  chinese: string,
  commonPrefix: string // 错误时返回
}
```

**语音合成：**

```
POST /api/tts/synthesize
Request: { text: string }
Response: { audioUrl: string }

GET /api/tts/audio/:word
Response: Audio file (binary)
```

**管理员 - 用户管理：**

```
GET /api/admin/users
Response: { users: [{ id, username, accessDays, expireDate, isActive, isAdmin }] }

PUT /api/admin/users/:id/reset-password
Request: { newPassword: string }
Response: { success: boolean }

PUT /api/admin/users/:id/add-days
Request: { days: number }
Response: { success: boolean, newAccessDays: number }

PUT /api/admin/users/:id/toggle-status
Response: { success: boolean, isActive: boolean }
```

**管理员 - 内容管理：**

```
POST /api/admin/categories
Request: { name: string }
Response: { success: boolean, category: { id, name } }

PUT /api/admin/categories/:id
Request: { name: string }
Response: { success: boolean }

DELETE /api/admin/categories/:id
Response: { success: boolean, deletedCount: { lessons, words } }

POST /api/admin/lessons
Request: { categoryId: number, lessonNumber: number }
Response: { success: boolean, lesson: { id, lessonNumber } }

PUT /api/admin/lessons/:id
Request: { lessonNumber: number }
Response: { success: boolean }

DELETE /api/admin/lessons/:id
Response: { success: boolean, deletedWordCount: number }

POST /api/admin/import-json
Request: { 
  category: string,
  lessons: [{
    lesson: number,
    words: [{ en: string, cn: string }]
  }]
}
Response: { 
  success: boolean, 
  imported: { categories: number, lessons: number, words: number },
  errors: []
}
```

**管理员 - 配置管理：**

```
GET /api/admin/config/tts
Response: { 
  appId: string, 
  apiKey: string (masked), 
  voice: string,
  speed: number,
  volume: number
}

PUT /api/admin/config/tts
Request: { 
  appId: string, 
  apiKey: string, 
  apiSecret: string,
  voice: string,
  speed: number,
  volume: number
}
Response: { success: boolean }

POST /api/admin/config/tts/test
Request: { text: string }
Response: { success: boolean, audioUrl: string, error: string }
```

## Data Models

### 数据库表结构

**1. users - 用户表**

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  access_days INTEGER DEFAULT 3,
  expire_date DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_access_days ON users(access_days);
```

字段说明：
- `id`: 主键
- `username`: 用户名（唯一）
- `password_hash`: bcrypt 加密后的密码
- `access_days`: 剩余访问天数
- `expire_date`: 到期时间（计算字段，用于显示）
- `is_active`: 账号状态（true=启用，false=禁用）
- `is_admin`: 管理员标识
- `created_at`: 创建时间
- `updated_at`: 更新时间

**2. categories - 分类表**

```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_name ON categories(name);
```

字段说明：
- `id`: 主键
- `name`: 分类名称（如"基础英语"、"ESP32"、"Java"）
- `created_at`: 创建时间
- `updated_at`: 更新时间

**3. lessons - 课程表**

```sql
CREATE TABLE lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(category_id, lesson_number)
);

CREATE INDEX idx_lessons_category ON lessons(category_id);
CREATE INDEX idx_lessons_number ON lessons(lesson_number);
```

字段说明：
- `id`: 主键
- `category_id`: 所属分类 ID（外键）
- `lesson_number`: 课程编号（同一分类内唯一）
- `created_at`: 创建时间
- `updated_at`: 更新时间

**4. words - 单词表**

```sql
CREATE TABLE words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id INTEGER NOT NULL,
  english VARCHAR(255) NOT NULL,
  chinese VARCHAR(255) NOT NULL,
  audio_cache_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE INDEX idx_words_lesson ON words(lesson_id);
CREATE INDEX idx_words_english ON words(english);
```

字段说明：
- `id`: 主键
- `lesson_id`: 所属课程 ID（外键）
- `english`: 英文单词
- `chinese`: 中文翻译
- `audio_cache_url`: 缓存的音频文件路径
- `created_at`: 创建时间

**5. config - 配置表**

```sql
CREATE TABLE config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_config_key ON config(key);
```

字段说明：
- `id`: 主键
- `key`: 配置键（如 "tts_app_id", "tts_api_key"）
- `value`: 配置值（JSON 格式存储复杂配置）
- `created_at`: 创建时间
- `updated_at`: 更新时间

存储的配置项：
```json
{
  "tts_app_id": "火山引擎应用ID",
  "tts_api_key": "加密后的API密钥",
  "tts_api_secret": "加密后的API密钥",
  "tts_voice": "en_us_female",
  "tts_speed": 1.0,
  "tts_volume": 1.0
}
```

### Sequelize 模型定义

**User Model:**
```javascript
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  accessDays: { type: DataTypes.INTEGER, defaultValue: 3 },
  expireDate: { type: DataTypes.DATE },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true,
  underscored: true
});
```

**Category Model:**
```javascript
const Category = sequelize.define('Category', {
  name: { type: DataTypes.STRING(100), allowNull: false }
}, {
  timestamps: true,
  underscored: true
});
```

**Lesson Model:**
```javascript
const Lesson = sequelize.define('Lesson', {
  categoryId: { type: DataTypes.INTEGER, allowNull: false },
  lessonNumber: { type: DataTypes.INTEGER, allowNull: false }
}, {
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['category_id', 'lesson_number'] }]
});
```

**Word Model:**
```javascript
const Word = sequelize.define('Word', {
  lessonId: { type: DataTypes.INTEGER, allowNull: false },
  english: { type: DataTypes.STRING(255), allowNull: false },
  chinese: { type: DataTypes.STRING(255), allowNull: false },
  audioCacheUrl: { type: DataTypes.STRING(500) }
}, {
  timestamps: true,
  underscored: true,
  createdAt: true,
  updatedAt: false
});
```

**Config Model:**
```javascript
const Config = sequelize.define('Config', {
  key: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  value: { type: DataTypes.TEXT, allowNull: false }
}, {
  timestamps: true,
  underscored: true
});
```

### 数据关系

```
User (1) ──────────────────────────────────────────────
                                                        
Category (1) ───< Lessons (N) ───< Words (N)
                                                        
Config (独立表)
```

关系说明：
- 一个 Category 包含多个 Lessons（一对多）
- 一个 Lesson 包含多个 Words（一对多）
- 删除 Category 时级联删除所有 Lessons 和 Words
- 删除 Lesson 时级联删除所有 Words
- User 表独立，不与其他表关联


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 用户注册唯一性

*For any* username, attempting to register the same username twice should result in the second registration failing with an error message.

**Validates: Requirements 1.2, 1.3**

### Property 2: 注册自动赋予试用期

*For any* valid registration (unique username, password ≥ 6 characters), the newly created user should have access_days initialized to 3.

**Validates: Requirements 1.4, 1.5**

### Property 3: 密码长度验证

*For any* password with length less than 6 characters, the registration should be rejected.

**Validates: Requirements 1.6**

### Property 4: 未登录用户访问控制

*For any* protected page (excluding login and register pages), accessing it without authentication should redirect to the login page or return an authorization error.

**Validates: Requirements 2.2**

### Property 5: 登录凭证验证

*For any* login attempt, the system should verify both username existence and password correctness, returning success only when both match.

**Validates: Requirements 2.3, 2.4, 2.5**

### Property 6: Session 持久性

*For any* authenticated user, the session should remain valid across multiple requests until explicit logout or session expiration.

**Validates: Requirements 2.6**

### Property 7: 退出登录清除会话

*For any* authenticated user, performing logout should clear the session and prevent subsequent authenticated requests.

**Validates: Requirements 3.2, 3.3**

### Property 8: 访问权限检查

*For any* user login attempt, if access_days > 0, the user should be granted access to learning content; if access_days = 0, access should be denied.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 9: 每日天数递减

*For any* active user, the daily decrement operation should reduce access_days by exactly 1.

**Validates: Requirements 4.4**

### Property 10: 分类显示完整性

*For any* set of categories in the database, the categories page should display all of them.

**Validates: Requirements 5.2**

### Property 11: 分类导航

*For any* category, clicking on it should navigate to the lessons page for that specific category.

**Validates: Requirements 5.3**

### Property 12: 课程列表显示

*For any* category, the lessons page should display all lessons belonging to that category, sorted by lesson_number in ascending order.

**Validates: Requirements 6.1, 6.2, 6.3**

### Property 13: 课程导航

*For any* lesson, clicking on it should navigate to the learning page with all words from that lesson.

**Validates: Requirements 6.4**

### Property 14: 自动语音播放

*For any* word in the learning page, when entering the page, switching to next/previous word, or resetting the current word, the system should automatically play the word's pronunciation 2 times; when manually clicking play, it should play 1 time.

**Validates: Requirements 8.1, 8.2, 8.3, 8.4, 10.4, 12.5**

### Property 15: 空格键提交答案

*For any* input in the answer field, pressing the space key should trigger answer submission.

**Validates: Requirements 9.1**

### Property 16: 答案比对逻辑

*For any* user input and correct answer, the comparison should:
- Trim leading and trailing whitespace from input
- Ignore case differences
- Return correct if normalized input equals normalized answer
- Return incorrect otherwise

**Validates: Requirements 9.2, 9.3, 22.1, 22.2, 22.3, 22.4**

### Property 17: 正确答案自动跳转

*For any* correct answer submission, the system should display the answer, wait 1 second, then automatically advance to the next word with cleared input.

**Validates: Requirements 10.1, 10.2, 10.3**

### Property 18: 错误答案处理流程

*For any* incorrect answer submission, the system should:
- Display the correct answer for 1.5 seconds
- Hide the answer after the delay
- Calculate and preserve the longest common prefix in the input field
- Not advance to the next word

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 22.5, 22.6**

### Property 19: 最长公共前缀计算

*For any* two strings (user input and correct answer), the longest common prefix calculation should return the maximum length prefix that matches character-by-character (case-insensitive).

**Validates: Requirements 11.5, 22.5**

### Property 20: 导航按钮功能

*For any* word position in a lesson:
- Clicking next should advance to the next word (if not at the end)
- Clicking previous should go to the previous word (if not at the start)
- Previous button should be disabled on the first word
- Next button should be disabled on the last word

**Validates: Requirements 12.1, 12.2, 12.3, 12.4**

### Property 21: 显示答案功能

*For any* word, clicking the show answer button should display the correct answer and fill the input field, but should not automatically advance to the next word.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 22: 管理员权限验证

*For any* user attempting to access admin routes, access should be granted only if the user has is_admin = true; otherwise, access should be denied with an error.

**Validates: Requirements 14.2, 14.3, 14.4**

### Property 23: 用户列表显示完整性

*For any* set of users in the database, the admin user management page should display all users with their username, access_days, and account status.

**Validates: Requirements 15.1**

### Property 24: 管理员用户操作

*For any* user selected by admin:
- Reset password should change the user's password to the default value
- Add days should increase access_days by the specified amount
- Toggle status should flip is_active between true and false

**Validates: Requirements 15.2, 15.3, 15.4, 15.5**

### Property 25: 禁用账号阻止登录

*For any* user with is_active = false, login attempts should be rejected regardless of correct credentials.

**Validates: Requirements 15.6**

### Property 26: 分类级联删除

*For any* category deletion, all lessons belonging to that category and all words belonging to those lessons should also be deleted.

**Validates: Requirements 16.4**

### Property 27: 课程级联删除

*For any* lesson deletion, all words belonging to that lesson should also be deleted.

**Validates: Requirements 16.8**

### Property 28: JSON 格式验证

*For any* uploaded JSON file, the system should validate that it contains the required fields (category, lessons array, each lesson has lesson number and words array, each word has en and cn fields) before processing.

**Validates: Requirements 17.2, 17.8**

### Property 29: JSON 导入自动创建

*For any* valid JSON import:
- If the category doesn't exist, it should be created
- If a lesson doesn't exist, it should be created
- All words should be inserted into their respective lessons

**Validates: Requirements 17.3, 17.4, 17.5, 17.6**

### Property 30: JSON 导入错误处理

*For any* invalid JSON file, the system should return detailed error information without performing any database modifications.

**Validates: Requirements 17.7**

### Property 31: 配置保存和读取往返

*For any* TTS configuration (AppID, APIKey, APISecret), saving the configuration and then reading it back should return the same values (with sensitive fields properly encrypted in storage).

**Validates: Requirements 18.2, 18.3, 18.4**

### Property 32: TTS 服务调用

*For any* word requiring pronunciation, the system should call the TTS service with the configured credentials and return audio data or an error.

**Validates: Requirements 19.1, 19.2, 19.3**

### Property 33: TTS 错误处理

*For any* TTS service call failure, the system should log the error and display a user-friendly message without exposing technical details.

**Validates: Requirements 19.4, 24.3, 24.5**

### Property 34: 音频缓存机制

*For any* word, the first TTS request should call the external service and cache the result; subsequent requests for the same word should return the cached audio without calling the service again.

**Validates: Requirements 19.5**

### Property 35: 学习进度计算

*For any* learning session with N total words and current position P, the progress should display "第 P 题 / 共 N 题" and calculate percentage as (P / N) * 100.

**Validates: Requirements 20.1, 20.2**

### Property 36: 密码加密存储

*For any* user password, the stored password_hash should be a bcrypt hash, not the plaintext password.

**Validates: Requirements 21.4**

### Property 37: 错误消息安全性

*For any* system error, the error message displayed to users should not contain sensitive information such as database schema, file paths, or API keys.

**Validates: Requirements 24.5**

### Property 38: 数据库错误日志记录

*For any* database operation failure, the system should log the error with timestamp, operation type, and error details.

**Validates: Requirements 24.4**

### Property 39: 音频预加载

*For any* word at position P in a lesson, when displaying word P, the system should preload the audio for word P+1 (if it exists).

**Validates: Requirements 25.4**

## Error Handling

### 错误分类

系统错误分为以下几类：

1. **客户端错误（4xx）**
   - 400 Bad Request：请求参数错误、JSON 格式错误
   - 401 Unauthorized：未登录或 session 过期
   - 403 Forbidden：权限不足（非管理员访问管理接口）
   - 404 Not Found：资源不存在（分类、课程、单词）
   - 409 Conflict：资源冲突（用户名已存在）

2. **服务器错误（5xx）**
   - 500 Internal Server Error：数据库错误、未预期的异常
   - 502 Bad Gateway：TTS 服务调用失败
   - 503 Service Unavailable：服务暂时不可用

### 错误处理策略

**前端错误处理：**

```javascript
// 统一错误处理拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 跳转到登录页
          router.push('/login');
          break;
        case 403:
          showMessage('权限不足');
          break;
        case 404:
          showMessage('资源不存在');
          break;
        case 409:
          showMessage(error.response.data.message);
          break;
        case 500:
          showMessage('服务器错误，请稍后重试');
          break;
        case 502:
          showMessage('语音服务暂时不可用');
          break;
        default:
          showMessage('操作失败，请重试');
      }
    } else if (error.request) {
      showMessage('网络连接失败，请检查网络');
    }
    return Promise.reject(error);
  }
);
```

**后端错误处理：**

```javascript
// 全局错误处理中间件
app.use((err, req, res, next) => {
  // 记录错误日志
  logger.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack
  });

  // 根据错误类型返回适当的响应
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '请求参数错误',
      errors: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: '未授权访问'
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: '资源已存在'
    });
  }

  // 默认服务器错误（不暴露详细信息）
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});
```

### 特定场景错误处理

**1. TTS 服务调用失败：**
- 重试机制：最多重试 3 次，每次间隔 1 秒
- 超时设置：单次请求超时 5 秒
- 降级策略：显示"语音暂时不可用"，允许用户继续学习
- 错误日志：记录失败原因、请求参数、响应内容

**2. 数据库连接失败：**
- 连接池配置：最小 5 个连接，最大 20 个连接
- 重连机制：自动重连，最多尝试 5 次
- 健康检查：每 30 秒检查一次连接状态
- 降级策略：返回 503 错误，提示系统维护中

**3. Session 过期：**
- 过期时间：24 小时无活动自动过期
- 前端处理：自动跳转到登录页，保存当前路径
- 后端处理：返回 401 错误，清除无效 session

**4. JSON 导入错误：**
- 格式验证：使用 JSON Schema 验证
- 事务处理：全部成功或全部回滚
- 错误详情：返回具体的错误位置和原因
- 示例：
  ```json
  {
    "success": false,
    "message": "JSON 格式错误",
    "errors": [
      {
        "line": 15,
        "field": "lessons[2].words[5].en",
        "error": "缺少必需字段"
      }
    ]
  }
  ```

**5. 文件上传错误：**
- 大小限制：最大 10MB
- 类型限制：仅允许 .json 文件
- 病毒扫描：上传前进行安全检查
- 错误提示：明确告知限制和要求

## Testing Strategy

### 测试方法论

系统采用**双重测试策略**，结合单元测试和基于属性的测试（Property-Based Testing）：

- **单元测试**：验证特定示例、边界情况和错误条件
- **属性测试**：通过随机生成大量输入验证通用属性

两种测试方法互补，共同确保系统的正确性和健壮性。

### 测试技术栈

**后端测试：**
- 测试框架：Jest
- 属性测试库：fast-check
- API 测试：Supertest
- 数据库测试：SQLite in-memory
- Mock 工具：jest.mock()

**前端测试：**
- 测试框架：Vitest
- 组件测试：Vue Test Utils
- 属性测试库：fast-check
- E2E 测试：Playwright（可选）

### 属性测试配置

**基本配置：**
```javascript
import fc from 'fast-check';

// 每个属性测试至少运行 100 次
fc.assert(
  fc.property(/* generators */, /* test function */),
  { numRuns: 100 }
);
```

**标签格式：**
每个属性测试必须包含注释，引用设计文档中的属性：

```javascript
/**
 * Feature: programming-english-learning-system
 * Property 2: 注册自动赋予试用期
 * 
 * For any valid registration (unique username, password ≥ 6 characters),
 * the newly created user should have access_days initialized to 3.
 */
test('property: registration grants trial period', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.string({ minLength: 6, maxLength: 100 }),
      async (username, password) => {
        // Test implementation
      }
    ),
    { numRuns: 100 }
  );
});
```

### 测试覆盖范围

**1. 认证和授权测试**

单元测试：
- 登录成功/失败的具体场景
- Session 创建和验证
- 管理员权限检查

属性测试：
- Property 3: 密码长度验证
- Property 5: 登录凭证验证
- Property 6: Session 持久性
- Property 22: 管理员权限验证

**2. 用户管理测试**

单元测试：
- 注册流程的边界情况（空用户名、特殊字符）
- 密码重置功能
- 账号启用/禁用

属性测试：
- Property 1: 用户注册唯一性
- Property 2: 注册自动赋予试用期
- Property 9: 每日天数递减
- Property 24: 管理员用户操作
- Property 25: 禁用账号阻止登录
- Property 36: 密码加密存储

**3. 学习内容管理测试**

单元测试：
- 空分类列表显示
- 单个课程的单词列表
- 级联删除的边界情况

属性测试：
- Property 10: 分类显示完整性
- Property 12: 课程列表显示
- Property 26: 分类级联删除
- Property 27: 课程级联删除

**4. 答题逻辑测试**

单元测试：
- 空输入提交
- 特殊字符处理
- 完全正确/完全错误的情况

属性测试：
- Property 16: 答案比对逻辑
- Property 17: 正确答案自动跳转
- Property 18: 错误答案处理流程
- Property 19: 最长公共前缀计算

示例实现：
```javascript
/**
 * Feature: programming-english-learning-system
 * Property 19: 最长公共前缀计算
 */
test('property: longest common prefix calculation', () => {
  fc.assert(
    fc.property(
      fc.string(),
      fc.string(),
      (input, correct) => {
        const lcp = calculateLongestCommonPrefix(
          input.toLowerCase(),
          correct.toLowerCase()
        );
        
        // LCP 长度不应超过较短字符串的长度
        expect(lcp.length).toBeLessThanOrEqual(
          Math.min(input.length, correct.length)
        );
        
        // LCP 应该是两个字符串的公共前缀
        expect(input.toLowerCase().startsWith(lcp)).toBe(true);
        expect(correct.toLowerCase().startsWith(lcp)).toBe(true);
        
        // 如果 LCP 长度小于较短字符串，下一个字符应该不同
        if (lcp.length < Math.min(input.length, correct.length)) {
          expect(
            input.toLowerCase()[lcp.length]
          ).not.toBe(
            correct.toLowerCase()[lcp.length]
          );
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**5. 导航和 UI 状态测试**

单元测试：
- 第一题时上一题按钮禁用
- 最后一题时下一题按钮禁用
- 完成所有单词后的提示

属性测试：
- Property 20: 导航按钮功能
- Property 35: 学习进度计算

**6. TTS 服务测试**

单元测试：
- TTS 调用成功
- TTS 调用失败（网络错误、认证失败）
- 音频缓存命中/未命中

属性测试：
- Property 32: TTS 服务调用
- Property 33: TTS 错误处理
- Property 34: 音频缓存机制
- Property 39: 音频预加载

**7. JSON 导入测试**

单元测试：
- 有效 JSON 格式示例
- 无效 JSON 格式示例
- 部分字段缺失

属性测试：
- Property 28: JSON 格式验证
- Property 29: JSON 导入自动创建
- Property 30: JSON 导入错误处理

示例实现：
```javascript
/**
 * Feature: programming-english-learning-system
 * Property 29: JSON 导入自动创建
 */
test('property: JSON import auto-creates resources', () => {
  fc.assert(
    fc.property(
      fc.record({
        category: fc.string({ minLength: 1 }),
        lessons: fc.array(
          fc.record({
            lesson: fc.integer({ min: 1 }),
            words: fc.array(
              fc.record({
                en: fc.string({ minLength: 1 }),
                cn: fc.string({ minLength: 1 })
              }),
              { minLength: 1 }
            )
          }),
          { minLength: 1 }
        )
      }),
      async (jsonData) => {
        const result = await importFromJSON(jsonData);
        
        expect(result.success).toBe(true);
        
        // 验证分类被创建
        const category = await Category.findOne({
          where: { name: jsonData.category }
        });
        expect(category).not.toBeNull();
        
        // 验证所有课程被创建
        for (const lessonData of jsonData.lessons) {
          const lesson = await Lesson.findOne({
            where: {
              categoryId: category.id,
              lessonNumber: lessonData.lesson
            }
          });
          expect(lesson).not.toBeNull();
          
          // 验证所有单词被创建
          const wordCount = await Word.count({
            where: { lessonId: lesson.id }
          });
          expect(wordCount).toBe(lessonData.words.length);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**8. 错误处理和安全测试**

单元测试：
- SQL 注入尝试
- XSS 攻击尝试
- 敏感信息泄露检查

属性测试：
- Property 37: 错误消息安全性
- Property 38: 数据库错误日志记录

### 测试数据生成器

为属性测试创建自定义生成器：

```javascript
// 用户名生成器
const usernameArb = fc.string({
  minLength: 1,
  maxLength: 50
}).filter(s => s.trim().length > 0);

// 密码生成器
const passwordArb = fc.string({
  minLength: 6,
  maxLength: 100
});

// 单词生成器
const wordArb = fc.record({
  english: fc.string({ minLength: 1, maxLength: 50 }),
  chinese: fc.string({ minLength: 1, maxLength: 50 })
});

// 课程生成器
const lessonArb = fc.record({
  lessonNumber: fc.integer({ min: 1, max: 100 }),
  words: fc.array(wordArb, { minLength: 1, maxLength: 50 })
});

// JSON 导入数据生成器
const importDataArb = fc.record({
  category: fc.string({ minLength: 1, maxLength: 100 }),
  lessons: fc.array(lessonArb, { minLength: 1, maxLength: 20 })
});
```

### 测试执行策略

**开发阶段：**
- 每次代码提交前运行所有单元测试
- 每次 PR 前运行完整测试套件（包括属性测试）

**CI/CD 流程：**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:property
      - run: npm run test:integration
      - run: npm run test:coverage
```

**测试覆盖率目标：**
- 代码覆盖率：≥ 80%
- 分支覆盖率：≥ 75%
- 属性测试：每个属性至少 100 次迭代
- 关键路径：100% 覆盖（认证、答题逻辑、数据持久化）

### 性能测试

虽然性能要求（Requirements 25）不适合单元测试，但应该进行专门的性能测试：

**工具：**
- Apache JMeter 或 Artillery（负载测试）
- Lighthouse（前端性能）

**测试场景：**
- 100 并发用户同时学习
- 1000 次答案提交的平均响应时间
- TTS 服务调用的延迟分布
- 数据库查询性能（慢查询日志）

**性能基准：**
- 答案提交响应时间：p95 < 100ms
- 页面加载时间：p95 < 1s
- TTS 音频播放延迟：p95 < 500ms
- 数据库查询：p95 < 50ms

