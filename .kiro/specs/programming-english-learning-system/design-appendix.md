# Design Document Appendix

## 核心逻辑流程设计

### 1. 用户登录与权限校验流程

```
用户访问系统
    │
    ▼
是否已登录？
    │
    ├─ 否 → 跳转到登录页
    │       │
    │       ▼
    │   输入用户名和密码
    │       │
    │       ▼
    │   验证用户名是否存在？
    │       │
    │       ├─ 否 → 返回"用户不存在"
    │       │
    │       ▼
    │   验证密码是否正确？
    │       │
    │       ├─ 否 → 返回"密码错误"
    │       │
    │       ▼
    │   检查账号是否启用（is_active）？
    │       │
    │       ├─ 否 → 返回"账号已被禁用"
    │       │
    │       ▼
    │   检查 access_days > 0？
    │       │
    │       ├─ 否 → 返回"试用已到期"
    │       │
    │       ▼
    │   创建 Session
    │       │
    │       ▼
    │   跳转到分类首页
    │
    ▼
是 → 验证 Session 有效性
        │
        ▼
    检查 access_days > 0？
        │
        ├─ 否 → 清除 Session，跳转到登录页
        │
        ▼
    允许访问学习内容
```

**实现代码示例：**

```javascript
// 认证中间件
const authMiddleware = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  const user = await User.findByPk(req.session.userId);
  
  if (!user || !user.isActive) {
    req.session.destroy();
    return res.status(401).json({
      success: false,
      message: '账号不可用'
    });
  }

  if (user.accessDays <= 0) {
    return res.status(403).json({
      success: false,
      message: '试用已到期，请联系管理员'
    });
  }

  req.user = user;
  next();
};

// 登录接口
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: '用户名或密码错误'
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: '账号已被禁用'
    });
  }

  if (user.accessDays <= 0) {
    return res.status(403).json({
      success: false,
      message: '试用已到期，请联系管理员'
    });
  }

  req.session.userId = user.id;
  req.session.isAdmin = user.isAdmin;

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      accessDays: user.accessDays,
      isAdmin: user.isAdmin
    }
  });
});
```

### 2. 学习单词核心流程

```
进入学习页面
    │
    ▼
加载课程的所有单词
    │
    ▼
初始化状态：currentIndex = 0
    │
    ▼
显示当前单词（隐藏英文）
    │
    ▼
自动播放语音 2 遍
    │
    ▼
等待用户输入
    │
    ▼
用户按空格键提交
    │
    ▼
处理输入：trim() + toLowerCase()
    │
    ▼
比对答案
    │
    ├─ 正确 ─────────────────┐
    │   │                     │
    │   ▼                     │
    │ 显示完整答案和翻译       │
    │   │                     │
    │   ▼                     │
    │ 等待 1 秒                │
    │   │                     │
    │   ▼                     │
    │ currentIndex++          │
    │   │                     │
    │   ▼                     │
    │ 是否还有下一题？         │
    │   │                     │
    │   ├─ 是 → 清空输入框    │
    │   │       │             │
    │   │       ▼             │
    │   │   播放新单词 2 遍   │
    │   │       │             │
    │   │       └─────────────┘
    │   │
    │   └─ 否 → 显示完成提示
    │
    └─ 错误 ─────────────────┐
        │                     │
        ▼                     │
      显示完整答案和翻译       │
        │                     │
        ▼                     │
      等待 1.5 秒              │
        │                     │
        ▼                     │
      隐藏答案                 │
        │                     │
        ▼                     │
      计算最长公共前缀（LCP）   │
        │                     │
        ▼                     │
      保留 LCP，清除错误部分   │
        │                     │
        ▼                     │
      等待用户重新输入         │
        │                     │
        └─────────────────────┘
```

**实现代码示例：**

```javascript
// 前端学习页面核心逻辑
class LearningPage {
  constructor(words) {
    this.words = words;
    this.currentIndex = 0;
    this.isShowingAnswer = false;
  }

  async init() {
    await this.displayCurrentWord();
    await this.playAudio(2);
  }

  async displayCurrentWord() {
    const word = this.words[this.currentIndex];
    
    // 更新 UI
    this.updateProgress();
    this.hideEnglish();
    this.showChinese(word.chinese);
    this.clearInput();
    
    // 预加载下一题音频
    if (this.currentIndex < this.words.length - 1) {
      this.preloadAudio(this.words[this.currentIndex + 1].english);
    }
  }

  async handleSubmit() {
    if (this.isShowingAnswer) return;

    const userInput = this.getInput().trim();
    const currentWord = this.words[this.currentIndex];

    const result = await this.checkAnswer(
      currentWord.id,
      userInput
    );

    if (result.correct) {
      await this.handleCorrectAnswer(result);
    } else {
      await this.handleIncorrectAnswer(result);
    }
  }

  async handleCorrectAnswer(result) {
    // 显示完整答案
    this.showEnglish(result.correctAnswer);
    this.showChinese(result.chinese);
    this.setInputValue(result.correctAnswer);
    
    // 等待 1 秒
    await this.sleep(1000);
    
    // 跳转到下一题
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      await this.displayCurrentWord();
      await this.playAudio(2);
    } else {
      this.showCompletionMessage();
    }
  }

  async handleIncorrectAnswer(result) {
    // 显示完整答案
    this.showEnglish(result.correctAnswer);
    this.showChinese(result.chinese);
    this.setInputValue(result.correctAnswer);
    
    // 等待 1.5 秒
    await this.sleep(1500);
    
    // 隐藏答案
    this.hideEnglish();
    
    // 保留公共前缀
    this.setInputValue(result.commonPrefix);
    this.focusInput();
  }

  async playAudio(times) {
    const word = this.words[this.currentIndex];
    const audioUrl = await this.getAudioUrl(word.english);
    
    for (let i = 0; i < times; i++) {
      await this.playAudioOnce(audioUrl);
      if (i < times - 1) {
        await this.sleep(500); // 两次播放之间间隔 0.5 秒
      }
    }
  }

  async checkAnswer(wordId, answer) {
    const response = await fetch('/api/words/check-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wordId, answer })
    });
    return response.json();
  }

  updateProgress() {
    const current = this.currentIndex + 1;
    const total = this.words.length;
    const percentage = Math.round((current / total) * 100);
    
    this.setProgressText(`第 ${current} 题 / 共 ${total} 题`);
    this.setProgressBar(percentage);
  }

  // 导航按钮处理
  async handleNext() {
    if (this.currentIndex < this.words.length - 1) {
      this.currentIndex++;
      await this.displayCurrentWord();
      await this.playAudio(2);
    }
  }

  async handlePrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.displayCurrentWord();
      await this.playAudio(2);
    }
  }

  async handleReset() {
    this.clearInput();
    this.hideEnglish();
    await this.playAudio(2);
  }

  async handleShowAnswer() {
    const word = this.words[this.currentIndex];
    this.showEnglish(word.english);
    this.showChinese(word.chinese);
    this.setInputValue(word.english);
    this.isShowingAnswer = true;
  }
}
```

### 3. 答案比对算法

**核心算法实现：**

```javascript
// 后端答案比对服务
class AnswerCheckService {
  checkAnswer(userInput, correctAnswer) {
    // 1. 标准化输入
    const normalizedInput = this.normalize(userInput);
    const normalizedCorrect = this.normalize(correctAnswer);

    // 2. 比对答案
    const isCorrect = normalizedInput === normalizedCorrect;

    // 3. 如果错误，计算最长公共前缀
    let commonPrefix = '';
    if (!isCorrect) {
      commonPrefix = this.calculateLCP(
        normalizedInput,
        normalizedCorrect
      );
    }

    return {
      correct: isCorrect,
      correctAnswer: correctAnswer,
      commonPrefix: commonPrefix
    };
  }

  normalize(str) {
    return str.trim().toLowerCase();
  }

  calculateLCP(str1, str2) {
    let i = 0;
    const minLength = Math.min(str1.length, str2.length);

    while (i < minLength && str1[i] === str2[i]) {
      i++;
    }

    return str1.substring(0, i);
  }
}

// API 端点
app.post('/api/words/check-answer', authMiddleware, async (req, res) => {
  const { wordId, answer } = req.body;

  const word = await Word.findByPk(wordId);
  
  if (!word) {
    return res.status(404).json({
      success: false,
      message: '单词不存在'
    });
  }

  const service = new AnswerCheckService();
  const result = service.checkAnswer(answer, word.english);

  res.json({
    success: true,
    correct: result.correct,
    correctAnswer: result.correctAnswer,
    chinese: word.chinese,
    commonPrefix: result.commonPrefix
  });
});
```

**算法复杂度分析：**
- 时间复杂度：O(min(m, n))，其中 m 和 n 是两个字符串的长度
- 空间复杂度：O(1)

**测试用例：**
```javascript
// 单元测试
describe('AnswerCheckService', () => {
  const service = new AnswerCheckService();

  test('完全正确', () => {
    const result = service.checkAnswer('hello', 'hello');
    expect(result.correct).toBe(true);
  });

  test('忽略大小写', () => {
    const result = service.checkAnswer('HELLO', 'hello');
    expect(result.correct).toBe(true);
  });

  test('忽略首尾空格', () => {
    const result = service.checkAnswer('  hello  ', 'hello');
    expect(result.correct).toBe(true);
  });

  test('计算最长公共前缀', () => {
    const result = service.checkAnswer('hel', 'hello');
    expect(result.correct).toBe(false);
    expect(result.commonPrefix).toBe('hel');
  });

  test('完全错误', () => {
    const result = service.checkAnswer('world', 'hello');
    expect(result.correct).toBe(false);
    expect(result.commonPrefix).toBe('');
  });
});
```

### 4. 自动播放语音逻辑

**播放规则总结：**

| 触发事件 | 播放次数 | 说明 |
|---------|---------|------|
| 进入学习页面 | 2 次 | 自动播放当前单词 |
| 切换到下一题 | 2 次 | 自动播放新单词 |
| 切换到上一题 | 2 次 | 自动播放该单词 |
| 答对自动跳转 | 2 次 | 自动播放新单词 |
| 点击重新本题 | 2 次 | 重新播放当前单词 |
| 手动点击播放 | 1 次 | 仅播放一次 |

**实现代码：**

```javascript
// 音频播放管理器
class AudioManager {
  constructor() {
    this.audioCache = new Map();
    this.currentAudio = null;
    this.isPlaying = false;
  }

  async play(word, times = 1) {
    if (this.isPlaying) {
      await this.stop();
    }

    const audioUrl = await this.getAudioUrl(word);
    
    for (let i = 0; i < times; i++) {
      await this.playOnce(audioUrl);
      
      // 两次播放之间间隔 500ms
      if (i < times - 1) {
        await this.sleep(500);
      }
    }
  }

  async playOnce(audioUrl) {
    return new Promise((resolve, reject) => {
      this.currentAudio = new Audio(audioUrl);
      this.isPlaying = true;

      this.currentAudio.onended = () => {
        this.isPlaying = false;
        resolve();
      };

      this.currentAudio.onerror = (error) => {
        this.isPlaying = false;
        console.error('音频播放失败:', error);
        reject(error);
      };

      this.currentAudio.play().catch(reject);
    });
  }

  async stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  async getAudioUrl(word) {
    // 检查缓存
    if (this.audioCache.has(word)) {
      return this.audioCache.get(word);
    }

    // 请求音频 URL
    const response = await fetch('/api/tts/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: word })
    });

    const data = await response.json();
    
    if (data.success) {
      this.audioCache.set(word, data.audioUrl);
      return data.audioUrl;
    } else {
      throw new Error('获取音频失败');
    }
  }

  async preload(word) {
    try {
      await this.getAudioUrl(word);
    } catch (error) {
      console.error('预加载音频失败:', error);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

