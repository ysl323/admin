# 火山引擎语音合成集成方案

## 火山引擎 TTS API 概述

火山引擎提供高质量的文本转语音（TTS）服务，支持多种语言和音色。

**官方文档：** https://www.volcengine.com/docs/6561/79820

## 配置参数

### 必需参数

```javascript
const ttsConfig = {
  appId: 'your_app_id',           // 应用标识
  apiKey: 'your_api_key',         // API 密钥
  apiSecret: 'your_api_secret',   // API 密钥（需加密存储）
  voice: 'en_us_female',          // 语音类型
  speed: 1.0,                     // 语速（0.5 - 2.0）
  volume: 1.0,                    // 音量（0.0 - 2.0）
  format: 'mp3',                  // 音频格式
  sampleRate: 16000               // 采样率
};
```

### 支持的英文音色

| 音色代码 | 描述 | 适用场景 |
|---------|------|---------|
| en_us_female | 美式英语女声 | 通用学习 |
| en_us_male | 美式英语男声 | 通用学习 |
| en_uk_female | 英式英语女声 | 英式发音学习 |
| en_uk_male | 英式英语男声 | 英式发音学习 |

## 调用流程

```
前端请求单词发音
    │
    ▼
后端接收请求
    │
    ▼
检查本地缓存
    │
    ├─ 缓存存在 ────────┐
    │   │               │
    │   ▼               │
    │ 返回缓存的音频 URL │
    │                   │
    └─ 缓存不存在       │
        │               │
        ▼               │
    读取 TTS 配置       │
        │               │
        ▼               │
    构建请求参数        │
        │               │
        ▼               │
    调用火山引擎 API    │
        │               │
        ▼               │
    API 调用成功？      │
        │               │
        ├─ 是           │
        │   │           │
        │   ▼           │
        │ 接收音频数据  │
        │   │           │
        │   ▼           │
        │ 保存到本地    │
        │   │           │
        │   ▼           │
        │ 更新数据库缓存 URL
        │   │           │
        │   ▼           │
        │ 返回音频 URL  │
        │   │           │
        │   └───────────┘
        │
        └─ 否
            │
            ▼
        记录错误日志
            │
            ▼
        重试（最多 3 次）
            │
            ▼
        仍然失败？
            │
            ▼
        返回错误信息
```

## 后端实现

### 1. TTS 服务类

```javascript
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class VolcengineTTSService {
  constructor() {
    this.baseUrl = 'https://openspeech.bytedance.com/api/v1/tts';
    this.cacheDir = path.join(__dirname, '../cache/audio');
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 秒
  }

  async initialize() {
    // 确保缓存目录存在
    await fs.mkdir(this.cacheDir, { recursive: true });
  }

  async synthesize(text, options = {}) {
    // 1. 检查缓存
    const cachedUrl = await this.getCachedAudio(text);
    if (cachedUrl) {
      return { success: true, audioUrl: cachedUrl, cached: true };
    }

    // 2. 获取配置
    const config = await this.getConfig();

    // 3. 调用 API（带重试）
    let lastError;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const audioData = await this.callTTSAPI(text, config);
        
        // 4. 保存音频
        const audioUrl = await this.saveAudio(text, audioData);
        
        // 5. 更新缓存记录
        await this.updateCache(text, audioUrl);
        
        return { success: true, audioUrl, cached: false };
      } catch (error) {
        lastError = error;
        logger.warn(`TTS API 调用失败 (尝试 ${attempt}/${this.maxRetries}):`, error.message);
        
        if (attempt < this.maxRetries) {
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    // 所有重试都失败
    logger.error('TTS API 调用最终失败:', lastError);
    throw new Error('语音合成服务暂时不可用');
  }

  async callTTSAPI(text, config) {
    const timestamp = Date.now();
    const nonce = this.generateNonce();
    
    // 构建请求参数
    const params = {
      app_id: config.appId,
      text: text,
      voice_type: config.voice,
      speed_ratio: config.speed,
      volume_ratio: config.volume,
      audio_format: config.format,
      sample_rate: config.sampleRate,
      timestamp: timestamp,
      nonce: nonce
    };

    // 生成签名
    const signature = this.generateSignature(params, config.apiSecret);
    params.signature = signature;

    // 发送请求
    const response = await axios.post(this.baseUrl, params, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      responseType: 'arraybuffer',
      timeout: 5000 // 5 秒超时
    });

    if (response.status !== 200) {
      throw new Error(`TTS API 返回错误: ${response.status}`);
    }

    return response.data;
  }

  generateSignature(params, apiSecret) {
    // 按字母顺序排序参数
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 使用 HMAC-SHA256 生成签名
    const hmac = crypto.createHmac('sha256', apiSecret);
    hmac.update(signString);
    return hmac.digest('hex');
  }

  generateNonce() {
    return crypto.randomBytes(16).toString('hex');
  }

  async saveAudio(text, audioData) {
    // 生成文件名（使用 MD5 哈希）
    const hash = crypto.createHash('md5').update(text).digest('hex');
    const filename = `${hash}.mp3`;
    const filepath = path.join(this.cacheDir, filename);

    // 保存文件
    await fs.writeFile(filepath, audioData);

    // 返回 URL
    return `/audio/${filename}`;
  }

  async getCachedAudio(text) {
    const word = await Word.findOne({
      where: { english: text },
      attributes: ['audioCacheUrl']
    });

    return word?.audioCacheUrl || null;
  }

  async updateCache(text, audioUrl) {
    await Word.update(
      { audioCacheUrl: audioUrl },
      { where: { english: text } }
    );
  }

  async getConfig() {
    const config = await Config.findOne({
      where: { key: 'tts_config' }
    });

    if (!config) {
      throw new Error('TTS 配置未设置');
    }

    const configData = JSON.parse(config.value);
    
    // 解密敏感信息
    return {
      appId: configData.appId,
      apiKey: this.decrypt(configData.apiKey),
      apiSecret: this.decrypt(configData.apiSecret),
      voice: configData.voice || 'en_us_female',
      speed: configData.speed || 1.0,
      volume: configData.volume || 1.0,
      format: 'mp3',
      sampleRate: 16000
    };
  }

  encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY;
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText) {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY;
    
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnection(config) {
    try {
      const result = await this.synthesize('test', config);
      return { success: true, message: '连接成功' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = VolcengineTTSService;
```

### 2. API 端点

```javascript
const express = require('express');
const router = express.Router();
const TTSService = require('../services/tts.service');

const ttsService = new TTSService();
ttsService.initialize();

// 合成语音
router.post('/synthesize', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '文本不能为空'
      });
    }

    const result = await ttsService.synthesize(text);
    
    res.json(result);
  } catch (error) {
    logger.error('TTS 合成失败:', error);
    res.status(502).json({
      success: false,
      message: '语音服务暂时不可用，请稍后重试'
    });
  }
});

// 获取音频文件
router.get('/audio/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../cache/audio', filename);

  // 安全检查：防止路径遍历攻击
  if (!filename.match(/^[a-f0-9]{32}\.mp3$/)) {
    return res.status(400).json({
      success: false,
      message: '无效的文件名'
    });
  }

  res.sendFile(filepath, (err) => {
    if (err) {
      logger.error('发送音频文件失败:', err);
      res.status(404).json({
        success: false,
        message: '音频文件不存在'
      });
    }
  });
});

module.exports = router;
```

### 3. 管理员配置接口

```javascript
// 获取 TTS 配置
router.get('/admin/config/tts', adminMiddleware, async (req, res) => {
  try {
    const config = await Config.findOne({
      where: { key: 'tts_config' }
    });

    if (!config) {
      return res.json({
        success: true,
        config: {
          appId: '',
          apiKey: '',
          voice: 'en_us_female',
          speed: 1.0,
          volume: 1.0
        }
      });
    }

    const configData = JSON.parse(config.value);
    
    // 隐藏敏感信息
    res.json({
      success: true,
      config: {
        appId: configData.appId,
        apiKey: '********',
        voice: configData.voice,
        speed: configData.speed,
        volume: configData.volume
      }
    });
  } catch (error) {
    logger.error('获取 TTS 配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配置失败'
    });
  }
});

// 保存 TTS 配置
router.put('/admin/config/tts', adminMiddleware, async (req, res) => {
  try {
    const { appId, apiKey, apiSecret, voice, speed, volume } = req.body;

    // 验证参数
    if (!appId || !apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        message: 'AppID、APIKey 和 APISecret 不能为空'
      });
    }

    // 加密敏感信息
    const ttsService = new TTSService();
    const configData = {
      appId,
      apiKey: ttsService.encrypt(apiKey),
      apiSecret: ttsService.encrypt(apiSecret),
      voice: voice || 'en_us_female',
      speed: speed || 1.0,
      volume: volume || 1.0
    };

    // 保存配置
    await Config.upsert({
      key: 'tts_config',
      value: JSON.stringify(configData)
    });

    res.json({
      success: true,
      message: '配置保存成功'
    });
  } catch (error) {
    logger.error('保存 TTS 配置失败:', error);
    res.status(500).json({
      success: false,
      message: '保存配置失败'
    });
  }
});

// 测试 TTS 配置
router.post('/admin/config/tts/test', adminMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    const testText = text || 'hello';

    const ttsService = new TTSService();
    const result = await ttsService.synthesize(testText);

    res.json({
      success: true,
      message: '测试成功',
      audioUrl: result.audioUrl
    });
  } catch (error) {
    logger.error('测试 TTS 配置失败:', error);
    res.status(502).json({
      success: false,
      message: error.message
    });
  }
});
```

## 错误处理

### 常见错误及处理

| 错误类型 | 错误码 | 处理方式 |
|---------|-------|---------|
| 认证失败 | 401 | 检查 AppID 和 APIKey 是否正确 |
| 配额超限 | 429 | 提示管理员检查配额，考虑限流 |
| 请求超时 | ETIMEDOUT | 自动重试，最多 3 次 |
| 网络错误 | ECONNREFUSED | 记录日志，返回友好提示 |
| 参数错误 | 400 | 验证输入参数，返回详细错误 |

### 降级策略

当 TTS 服务不可用时：

1. **前端处理：**
   - 显示"语音暂时不可用"提示
   - 允许用户继续学习（不阻塞学习流程）
   - 禁用播放按钮，显示灰色状态

2. **后端处理：**
   - 记录详细错误日志
   - 发送告警通知管理员
   - 返回 502 错误和友好提示

3. **监控和告警：**
   - 监控 TTS API 调用成功率
   - 当成功率低于 95% 时发送告警
   - 记录每日调用量和配额使用情况

## 缓存策略

### 缓存层级

```
请求单词发音
    │
    ▼
1. 内存缓存（Map）
    │
    ├─ 命中 → 返回
    │
    └─ 未命中
        │
        ▼
2. 数据库缓存（words.audio_cache_url）
    │
    ├─ 命中 → 返回 + 更新内存缓存
    │
    └─ 未命中
        │
        ▼
3. 文件系统缓存（/cache/audio/*.mp3）
    │
    ├─ 命中 → 返回 + 更新数据库和内存
    │
    └─ 未命中
        │
        ▼
4. 调用 TTS API
    │
    ▼
保存到所有缓存层
```

### 缓存实现

```javascript
class AudioCacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.maxMemoryCacheSize = 100; // 最多缓存 100 个音频 URL
  }

  async get(word) {
    // 1. 检查内存缓存
    if (this.memoryCache.has(word)) {
      return this.memoryCache.get(word);
    }

    // 2. 检查数据库缓存
    const dbCache = await Word.findOne({
      where: { english: word },
      attributes: ['audioCacheUrl']
    });

    if (dbCache?.audioCacheUrl) {
      this.set(word, dbCache.audioCacheUrl);
      return dbCache.audioCacheUrl;
    }

    return null;
  }

  set(word, audioUrl) {
    // LRU 策略：如果缓存满了，删除最早的
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(word, audioUrl);
  }

  clear() {
    this.memoryCache.clear();
  }
}
```

### 预加载策略

```javascript
// 在学习页面预加载下一题音频
async preloadNextAudio(currentIndex, words) {
  if (currentIndex < words.length - 1) {
    const nextWord = words[currentIndex + 1];
    
    // 异步预加载，不阻塞当前操作
    this.ttsService.synthesize(nextWord.english).catch(error => {
      logger.warn('预加载音频失败:', error);
    });
  }
}
```

## 性能优化

### 1. 并发控制

```javascript
const pLimit = require('p-limit');

class TTSService {
  constructor() {
    // 限制同时最多 5 个 TTS 请求
    this.limit = pLimit(5);
  }

  async synthesize(text) {
    return this.limit(() => this._synthesize(text));
  }

  async _synthesize(text) {
    // 实际的合成逻辑
  }
}
```

### 2. 批量预生成

```javascript
// 管理员工具：批量预生成所有单词的音频
router.post('/admin/tts/batch-generate', adminMiddleware, async (req, res) => {
  try {
    const words = await Word.findAll({
      where: { audioCacheUrl: null },
      attributes: ['id', 'english']
    });

    const ttsService = new TTSService();
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const word of words) {
      try {
        await ttsService.synthesize(word.english);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          word: word.english,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    logger.error('批量生成音频失败:', error);
    res.status(500).json({
      success: false,
      message: '批量生成失败'
    });
  }
});
```

### 3. CDN 加速（可选）

如果音频文件较多，可以考虑使用 CDN：

```javascript
// 上传到 CDN
async uploadToCDN(audioData, filename) {
  const cdnClient = new CDNClient({
    accessKey: process.env.CDN_ACCESS_KEY,
    secretKey: process.env.CDN_SECRET_KEY
  });

  const cdnUrl = await cdnClient.upload(audioData, filename);
  return cdnUrl;
}
```

## 监控和日志

### 日志记录

```javascript
// TTS 调用日志
logger.info('TTS API 调用', {
  word: text,
  cached: result.cached,
  duration: Date.now() - startTime,
  success: true
});

// TTS 错误日志
logger.error('TTS API 调用失败', {
  word: text,
  error: error.message,
  stack: error.stack,
  attempt: attempt,
  config: {
    appId: config.appId,
    voice: config.voice
  }
});
```

### 监控指标

- TTS API 调用次数
- TTS API 成功率
- TTS API 平均响应时间
- 缓存命中率
- 音频文件总大小
- 每日配额使用量

