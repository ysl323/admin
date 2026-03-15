# 设计文档补充

## JSON 导入解析逻辑

### JSON 格式规范

```json
{
  "category": "基础英语",
  "lessons": [
    {
      "lesson": 1,
      "words": [
        {
          "en": "hello",
          "cn": "你好"
        },
        {
          "en": "world",
          "cn": "世界"
        }
      ]
    },
    {
      "lesson": 2,
      "words": [
        {
          "en": "programming",
          "cn": "编程"
        }
      ]
    }
  ]
}
```

### JSON Schema 验证

```javascript
const Joi = require('joi');

const importSchema = Joi.object({
  category: Joi.string().min(1).max(100).required(),
  lessons: Joi.array().min(1).items(
    Joi.object({
      lesson: Joi.number().integer().min(1).required(),
      words: Joi.array().min(1).items(
        Joi.object({
          en: Joi.string().min(1).max(255).required(),
          cn: Joi.string().min(1).max(255).required()
        })
      ).required()
    })
  ).required()
});
```

### 导入流程实现

```javascript
class ImportService {
  async importFromJSON(jsonData) {
    // 1. 验证 JSON 格式
    const { error, value } = importSchema.validate(jsonData);
    if (error) {
      throw new ValidationError('JSON 格式错误', error.details);
    }

    // 2. 使用事务确保原子性
    const transaction = await sequelize.transaction();

    try {
      const stats = {
        categories: 0,
        lessons: 0,
        words: 0
      };

      // 3. 查找或创建分类
      let category = await Category.findOne({
        where: { name: value.category },
        transaction
      });

      if (!category) {
        category = await Category.create(
          { name: value.category },
          { transaction }
        );
        stats.categories = 1;
      }

      // 4. 处理每个课程
      for (const lessonData of value.lessons) {
        // 查找或创建课程
        let lesson = await Lesson.findOne({
          where: {
            categoryId: category.id,
            lessonNumber: lessonData.lesson
          },
          transaction
        });

        if (!lesson) {
          lesson = await Lesson.create({
            categoryId: category.id,
            lessonNumber: lessonData.lesson
          }, { transaction });
          stats.lessons++;
        }

        // 5. 批量插入单词
        const words = lessonData.words.map(word => ({
          lessonId: lesson.id,
          english: word.en,
          chinese: word.cn
        }));

        await Word.bulkCreate(words, {
          transaction,
          ignoreDuplicates: true // 忽略重复单词
        });

        stats.words += words.length;
      }

      // 6. 提交事务
      await transaction.commit();

      return {
        success: true,
        stats
      };
    } catch (error) {
      // 7. 回滚事务
      await transaction.rollback();
      throw error;
    }
  }

  async validateJSONFile(file) {
    try {
      // 检查文件大小（最大 10MB）
      if (file.size > 10 * 1024 * 1024) {
        return {
          valid: false,
          error: '文件大小超过 10MB'
        };
      }

      // 检查文件类型
      if (!file.mimetype.includes('json')) {
        return {
          valid: false,
          error: '文件类型必须是 JSON'
        };
      }

      // 解析 JSON
      const content = await file.text();
      const jsonData = JSON.parse(content);

      // 验证格式
      const { error } = importSchema.validate(jsonData);
      if (error) {
        return {
          valid: false,
          error: 'JSON 格式不符合规范',
          details: error.details
        };
      }

      return {
        valid: true,
        data: jsonData
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}
```

### API 端点

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/admin/import-json',
  adminMiddleware,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传文件'
        });
      }

      // 读取文件内容
      const content = await fs.readFile(req.file.path, 'utf8');
      const jsonData = JSON.parse(content);

      // 导入数据
      const importService = new ImportService();
      const result = await importService.importFromJSON(jsonData);

      // 删除临时文件
      await fs.unlink(req.file.path);

      res.json({
        success: true,
        message: '导入成功',
        stats: result.stats
      });
    } catch (error) {
      logger.error('JSON 导入失败:', error);

      // 删除临时文件
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }

      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message,
          details: error.details
        });
      }

      res.status(500).json({
        success: false,
        message: '导入失败'
      });
    }
  }
);
```

## 前端页面设计

### 页面路由结构

```javascript
// Vue Router 配置
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    component: RegisterPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/categories',
    component: CategoriesPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories/:id/lessons',
    component: LessonsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/lessons/:id/learn',
    component: LearningPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'users',
        component: UserManagement
      },
      {
        path: 'content',
        component: ContentManagement
      },
      {
        path: 'config',
        component: ConfigManagement
      }
    ]
  }
];

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  if (requiresAuth) {
    const authStatus = await checkAuth();
    
    if (!authStatus.authenticated) {
      next('/login');
      return;
    }

    if (requiresAdmin && !authStatus.user.isAdmin) {
      next('/categories');
      return;
    }
  }

  next();
});
```

### 学习页面 UI 组件设计

```vue
<!-- LearningPage.vue -->
<template>
  <div class="learning-page">
    <!-- 顶部信息栏 -->
    <div class="header">
      <div class="breadcrumb">
        {{ categoryName }} > 第 {{ lessonNumber }} 课
      </div>
      <div class="progress">
        <span>第 {{ currentIndex + 1 }} 题 / 共 {{ words.length }} 题</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- 单词显示区 -->
    <div class="word-display">
      <div class="english" :class="{ hidden: !showEnglish }">
        {{ currentWord.english }}
      </div>
      <div class="chinese">
        {{ currentWord.chinese }}
      </div>
    </div>

    <!-- 输入区 -->
    <div class="input-area">
      <input
        ref="answerInput"
        v-model="userInput"
        @keydown.space.prevent="handleSubmit"
        class="answer-input"
        placeholder="请输入英文单词，按空格提交"
        :disabled="isProcessing"
      />
    </div>

    <!-- 反馈信息 -->
    <div class="feedback" :class="feedbackType">
      {{ feedbackMessage }}
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <button
        @click="handlePrevious"
        :disabled="currentIndex === 0"
        class="btn btn-secondary"
      >
        上一题
      </button>
      <button
        @click="handlePlay"
        :disabled="isPlaying"
        class="btn btn-primary"
      >
        播放
      </button>
      <button
        @click="handleShowAnswer"
        class="btn btn-secondary"
      >
        显示答案
      </button>
      <button
        @click="handleReset"
        class="btn btn-secondary"
      >
        重新本题
      </button>
      <button
        @click="handleNext"
        :disabled="currentIndex === words.length - 1"
        class="btn btn-secondary"
      >
        下一题
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LearningPage',
  data() {
    return {
      words: [],
      currentIndex: 0,
      userInput: '',
      showEnglish: false,
      isProcessing: false,
      isPlaying: false,
      feedbackMessage: '',
      feedbackType: '',
      categoryName: '',
      lessonNumber: 0,
      audioManager: null
    };
  },
  computed: {
    currentWord() {
      return this.words[this.currentIndex] || {};
    },
    progressPercentage() {
      return Math.round(((this.currentIndex + 1) / this.words.length) * 100);
    }
  },
  async mounted() {
    await this.loadWords();
    this.audioManager = new AudioManager();
    await this.displayCurrentWord();
  },
  methods: {
    async loadWords() {
      const lessonId = this.$route.params.id;
      const response = await fetch(`/api/lessons/${lessonId}/words`);
      const data = await response.json();
      
      this.words = data.words;
      this.categoryName = data.categoryName;
      this.lessonNumber = data.lessonNumber;
    },
    
    async displayCurrentWord() {
      this.showEnglish = false;
      this.userInput = '';
      this.feedbackMessage = '';
      this.$refs.answerInput.focus();
      
      await this.audioManager.play(this.currentWord.english, 2);
      
      // 预加载下一题
      if (this.currentIndex < this.words.length - 1) {
        this.audioManager.preload(this.words[this.currentIndex + 1].english);
      }
    },
    
    async handleSubmit() {
      if (this.isProcessing || !this.userInput.trim()) return;
      
      this.isProcessing = true;
      
      const response = await fetch('/api/words/check-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordId: this.currentWord.id,
          answer: this.userInput
        })
      });
      
      const result = await response.json();
      
      if (result.correct) {
        await this.handleCorrectAnswer(result);
      } else {
        await this.handleIncorrectAnswer(result);
      }
      
      this.isProcessing = false;
    },
    
    async handleCorrectAnswer(result) {
      this.showEnglish = true;
      this.userInput = result.correctAnswer;
      this.feedbackMessage = '正确！';
      this.feedbackType = 'success';
      
      await this.sleep(1000);
      
      if (this.currentIndex < this.words.length - 1) {
        this.currentIndex++;
        await this.displayCurrentWord();
      } else {
        this.feedbackMessage = '恭喜完成所有单词！';
      }
    },
    
    async handleIncorrectAnswer(result) {
      this.showEnglish = true;
      this.userInput = result.correctAnswer;
      this.feedbackMessage = '错误，请重试';
      this.feedbackType = 'error';
      
      await this.sleep(1500);
      
      this.showEnglish = false;
      this.userInput = result.commonPrefix;
      this.feedbackMessage = '';
      this.$refs.answerInput.focus();
    },
    
    async handleNext() {
      if (this.currentIndex < this.words.length - 1) {
        this.currentIndex++;
        await this.displayCurrentWord();
      }
    },
    
    async handlePrevious() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        await this.displayCurrentWord();
      }
    },
    
    async handlePlay() {
      this.isPlaying = true;
      await this.audioManager.play(this.currentWord.english, 1);
      this.isPlaying = false;
    },
    
    async handleShowAnswer() {
      this.showEnglish = true;
      this.userInput = this.currentWord.english;
    },
    
    async handleReset() {
      await this.displayCurrentWord();
    },
    
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }
};
</script>

<style scoped>
.learning-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 30px;
}

.breadcrumb {
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.progress {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4caf50;
  transition: width 0.3s ease;
}

.word-display {
  text-align: center;
  margin: 40px 0;
}

.english {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  min-height: 60px;
}

.english.hidden {
  color: transparent;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.chinese {
  font-size: 24px;
  color: #666;
}

.input-area {
  margin: 40px 0;
}

.answer-input {
  width: 100%;
  padding: 15px;
  font-size: 24px;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
}

.answer-input:focus {
  border-color: #4caf50;
}

.feedback {
  text-align: center;
  font-size: 18px;
  min-height: 30px;
  margin: 20px 0;
}

.feedback.success {
  color: #4caf50;
}

.feedback.error {
  color: #f44336;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #4caf50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.btn-secondary {
  background: #2196f3;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #0b7dda;
}
</style>
```

## 安全设计

### 1. 认证和授权

**Session 配置：**

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));
```

**密码加密：**

```javascript
const bcrypt = require('bcrypt');

class PasswordService {
  async hash(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async verify(password, hash) {
    return bcrypt.compare(password, hash);
  }

  validate(password) {
    // 密码规则：至少 6 个字符
    if (password.length < 6) {
      throw new Error('密码长度至少为 6 个字符');
    }

    // 可选：添加更强的密码规则
    // - 至少包含一个大写字母
    // - 至少包含一个小写字母
    // - 至少包含一个数字
    // - 至少包含一个特殊字符
  }
}
```

### 2. SQL 注入防护

使用 Sequelize ORM 自动防护 SQL 注入：

```javascript
// ✅ 安全：使用参数化查询
const user = await User.findOne({
  where: { username: req.body.username }
});

// ❌ 不安全：直接拼接 SQL（永远不要这样做）
// const query = `SELECT * FROM users WHERE username = '${req.body.username}'`;
```

### 3. XSS 防护

**输入验证和清理：**

```javascript
const validator = require('validator');
const xss = require('xss');

function sanitizeInput(input) {
  // 移除 HTML 标签
  return xss(input, {
    whiteList: {}, // 不允许任何 HTML 标签
    stripIgnoreTag: true
  });
}

// 在所有用户输入处使用
router.post('/api/words/check-answer', (req, res) => {
  const answer = sanitizeInput(req.body.answer);
  // 处理答案...
});
```

**Content Security Policy (CSP)：**

```javascript
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
}));
```

### 4. CSRF 防护

```javascript
const csrf = require('csurf');

const csrfProtection = csrf({ cookie: true });

// 在所有修改数据的路由上使用
app.post('/api/*', csrfProtection, (req, res, next) => {
  next();
});

// 前端获取 CSRF token
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

**前端使用：**

```javascript
// 获取 CSRF token
const response = await fetch('/api/csrf-token');
const { csrfToken } = await response.json();

// 在所有 POST 请求中包含 token
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

### 5. 速率限制

```javascript
const rateLimit = require('express-rate-limit');

// 登录接口限流
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 最多 5 次尝试
  message: '登录尝试次数过多，请 15 分钟后再试'
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  // 登录逻辑...
});

// API 全局限流
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 分钟
  max: 100, // 最多 100 次请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', apiLimiter);
```

### 6. 文件上传安全

```javascript
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 只允许 JSON 文件
    const allowedTypes = ['application/json', 'text/json'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传 JSON 文件'));
    }
  }
});

// 文件名安全检查
function sanitizeFilename(filename) {
  // 移除路径遍历字符
  return path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
}
```

### 7. 敏感信息保护

**环境变量配置：**

```bash
# .env
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://user:pass@localhost:3306/dbname
SESSION_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-encryption-key-here
REDIS_HOST=localhost
REDIS_PORT=6379

# TTS 配置（不要提交到版本控制）
TTS_APP_ID=your-app-id
TTS_API_KEY=your-api-key
TTS_API_SECRET=your-api-secret
```

**日志脱敏：**

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format((info) => {
      // 脱敏处理
      if (info.password) {
        info.password = '***';
      }
      if (info.apiKey) {
        info.apiKey = info.apiKey.substring(0, 4) + '***';
      }
      return info;
    })()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 8. HTTPS 强制

```javascript
// 生产环境强制 HTTPS
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 9. 安全响应头

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}));
```

### 10. 数据库备份

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mysql"
DB_NAME="programming_english"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u root -p$MYSQL_PASSWORD $DB_NAME > $BACKUP_DIR/${DB_NAME}_${DATE}.sql

# 压缩备份文件
gzip $BACKUP_DIR/${DB_NAME}_${DATE}.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "数据库备份完成: ${DB_NAME}_${DATE}.sql.gz"
```

**定时任务配置：**

```bash
# crontab -e
# 每天凌晨 2 点执行备份
0 2 * * * /path/to/backup.sh
```

## 性能优化方案

### 1. 数据库索引优化

```sql
-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_access_days ON users(access_days);
CREATE INDEX idx_users_is_active ON users(is_active);

-- 分类表索引
CREATE INDEX idx_categories_name ON categories(name);

-- 课程表索引
CREATE INDEX idx_lessons_category ON lessons(category_id);
CREATE INDEX idx_lessons_number ON lessons(lesson_number);
CREATE UNIQUE INDEX idx_lessons_category_number ON lessons(category_id, lesson_number);

-- 单词表索引
CREATE INDEX idx_words_lesson ON words(lesson_id);
CREATE INDEX idx_words_english ON words(english);
```

### 2. 查询优化

```javascript
// ✅ 优化：只查询需要的字段
const users = await User.findAll({
  attributes: ['id', 'username', 'accessDays', 'isActive']
});

// ✅ 优化：使用 JOIN 减少查询次数
const lessons = await Lesson.findAll({
  where: { categoryId: categoryId },
  include: [{
    model: Word,
    attributes: ['id', 'english', 'chinese']
  }]
});

// ✅ 优化：使用分页
const { count, rows } = await User.findAndCountAll({
  limit: 20,
  offset: (page - 1) * 20
});
```

### 3. 缓存策略

```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 分钟

// 缓存分类列表
async function getCategories() {
  const cacheKey = 'categories';
  let categories = cache.get(cacheKey);

  if (!categories) {
    categories = await Category.findAll();
    cache.set(cacheKey, categories);
  }

  return categories;
}

// 清除缓存
function clearCategoriesCache() {
  cache.del('categories');
}
```

### 4. 前端资源优化

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'axios'],
          'admin': ['./src/views/admin/*']
        }
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true
      }
    }
  }
};
```

### 5. 音频预加载

```javascript
// 预加载下一题和下下题的音频
async function preloadAudio(currentIndex, words) {
  const preloadCount = 2;
  
  for (let i = 1; i <= preloadCount; i++) {
    const nextIndex = currentIndex + i;
    if (nextIndex < words.length) {
      const word = words[nextIndex];
      // 异步预加载，不阻塞当前操作
      fetch(`/api/tts/audio/${word.english}`).catch(() => {});
    }
  }
}
```

