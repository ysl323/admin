# TTS 集成指南

## 概述

本指南说明如何在学习页面集成火山引擎 TTS，替换浏览器的 Speech Synthesis API。

## 当前状态

### 已完成
- ✅ 后端 TTS 配置管理（加密存储）
- ✅ 前端配置管理页面
- ✅ 火山引擎 TTS 配置已保存

### 待完成
- ⏳ 创建 TTS 服务接口
- ⏳ 在学习页面集成 TTS
- ⏳ 实现音频缓存机制
- ⏳ 添加错误处理和降级方案

## 实现步骤

### 第一步：创建后端 TTS 服务

#### 1.1 创建 VolcengineTTSService.js

```javascript
// backend/src/services/VolcengineTTSService.js
import axios from 'axios';
import crypto from 'crypto';
import AdminService from './AdminService.js';
import logger from '../utils/logger.js';

class VolcengineTTSService {
  /**
   * 生成签名
   */
  generateSignature(appId, accessToken, text, timestamp) {
    const data = `${appId}${accessToken}${text}${timestamp}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * 合成语音
   */
  async synthesize(text, options = {}) {
    try {
      // 获取配置
      const config = await AdminService.getTTSConfig();
      const volcengineConfig = config.volcengine;

      if (!volcengineConfig.appId || !volcengineConfig.apiKey) {
        throw new Error('火山引擎 TTS 配置不完整');
      }

      const timestamp = Date.now();
      const signature = this.generateSignature(
        volcengineConfig.appId,
        volcengineConfig.apiKey,
        text,
        timestamp
      );

      // 调用火山引擎 TTS API
      const response = await axios.post(
        volcengineConfig.endpoint,
        {
          app_id: volcengineConfig.appId,
          text: text,
          voice_type: options.voiceType || volcengineConfig.voiceType,
          language: options.language || volcengineConfig.language,
          timestamp: timestamp,
          signature: signature
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${volcengineConfig.apiKey}`
          },
          responseType: 'arraybuffer'
        }
      );

      return response.data;
    } catch (error) {
      logger.error('火山引擎 TTS 合成失败:', error);
      throw error;
    }
  }

  /**
   * 测试连接
   */
  async testConnection() {
    try {
      await this.synthesize('test');
      return { success: true, message: '连接成功' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

export default new VolcengineTTSService();
```

#### 1.2 创建 TTS 路由

```javascript
// backend/src/routes/tts.js
import express from 'express';
import VolcengineTTSService from '../services/VolcengineTTSService.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const router = express.Router();

// 所有 TTS 路由都需要认证
router.use(authMiddleware);

/**
 * POST /api/tts/synthesize
 * 合成语音
 */
router.post('/synthesize', async (req, res) => {
  try {
    const { text, voiceType, language } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: '文本不能为空'
      });
    }

    // 生成缓存文件名
    const hash = crypto.createHash('md5').update(text).digest('hex');
    const cacheDir = path.join(process.cwd(), 'cache', 'audio');
    const cacheFile = path.join(cacheDir, `${hash}.mp3`);

    // 检查缓存
    try {
      await fs.access(cacheFile);
      logger.info(`使用缓存音频: ${text}`);
      return res.sendFile(cacheFile);
    } catch (error) {
      // 缓存不存在，继续合成
    }

    // 合成语音
    const audioData = await VolcengineTTSService.synthesize(text, {
      voiceType,
      language
    });

    // 保存到缓存
    await fs.mkdir(cacheDir, { recursive: true });
    await fs.writeFile(cacheFile, audioData);

    logger.info(`合成并缓存音频: ${text}`);

    // 返回音频
    res.set('Content-Type', 'audio/mpeg');
    res.send(audioData);
  } catch (error) {
    logger.error('TTS 合成失败:', error);

    res.status(500).json({
      success: false,
      message: 'TTS 合成失败'
    });
  }
});

/**
 * POST /api/tts/test
 * 测试 TTS 连接
 */
router.post('/test', async (req, res) => {
  try {
    const result = await VolcengineTTSService.testConnection();
    res.json(result);
  } catch (error) {
    logger.error('TTS 测试失败:', error);

    res.status(500).json({
      success: false,
      message: 'TTS 测试失败'
    });
  }
});

export default router;
```

### 第二步：更新前端 TTS 服务

#### 2.1 更新 tts.js

```javascript
// frontend/src/services/tts.js
import api from './api';

export default {
  /**
   * 合成语音
   */
  async synthesize(text, options = {}) {
    try {
      const response = await api.post('/tts/synthesize', {
        text,
        voiceType: options.voiceType,
        language: options.language
      }, {
        responseType: 'blob'
      });

      // 创建音频 URL
      const audioBlob = new Blob([response], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      return audioUrl;
    } catch (error) {
      console.error('TTS 合成失败:', error);
      throw error;
    }
  },

  /**
   * 测试 TTS 连接
   */
  async testConnection() {
    return await api.post('/tts/test');
  }
};
```

### 第三步：更新学习页面

#### 3.1 修改 LearningPage.vue

```javascript
// 在 <script setup> 中添加
import ttsService from '../../services/tts';

// 替换 playAudio 方法
const playAudio = async (text) => {
  try {
    // 尝试使用火山引擎 TTS
    const audioUrl = await ttsService.synthesize(text, {
      voiceType: 'BV700_streaming',
      language: 'en-US'
    });

    const audio = new Audio(audioUrl);
    audio.play();

    // 播放完成后释放 URL
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  } catch (error) {
    console.error('火山引擎 TTS 失败，降级到浏览器 TTS:', error);

    // 降级到浏览器 Speech Synthesis API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      ElMessage.error('语音播放失败');
    }
  }
};
```

### 第四步：实现音频预加载

#### 4.1 在学习页面添加预加载逻辑

```javascript
// 预加载下一个单词的音频
const preloadNextAudio = async () => {
  if (currentIndex.value < words.value.length - 1) {
    const nextWord = words.value[currentIndex.value + 1];
    try {
      await ttsService.synthesize(nextWord.english);
    } catch (error) {
      console.error('预加载音频失败:', error);
    }
  }
};

// 在切换到下一个单词时调用
const nextWord = () => {
  if (currentIndex.value < words.value.length - 1) {
    currentIndex.value++;
    userAnswer.value = '';
    showEnglish.value = false;
    feedback.value = '';
    
    // 预加载下一个音频
    preloadNextAudio();
  }
};
```

## 火山引擎 TTS API 文档

### 请求格式

```
POST https://openspeech.bytedance.com/api/v1/tts
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "app_id": "8594935941",
  "text": "hello world",
  "voice_type": "BV700_streaming",
  "language": "en-US",
  "timestamp": 1234567890,
  "signature": "md5_hash"
}
```

### 响应格式

```
Content-Type: audio/mpeg

[二进制音频数据]
```

### 音色列表

- `BV001_streaming` - 通用女声（中文）
- `BV002_streaming` - 通用男声（中文）
- `BV700_streaming` - 英文女声（推荐）
- `BV701_streaming` - 英文男声

### 语言代码

- `zh-CN` - 中文（普通话）
- `en-US` - 英文（美式）
- `en-GB` - 英文（英式）

## 测试步骤

### 1. 测试后端 TTS 接口

```bash
# 登录获取 cookie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# 测试 TTS 合成
curl -X POST http://localhost:3000/api/tts/synthesize \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"text":"hello world"}' \
  --output test.mp3

# 播放音频
start test.mp3
```

### 2. 测试前端集成

1. 登录系统
2. 进入学习页面
3. 点击播放按钮
4. 验证使用火山引擎 TTS
5. 检查控制台无错误
6. 验证音频缓存生效

### 3. 测试降级方案

1. 停止后端服务
2. 刷新学习页面
3. 点击播放按钮
4. 验证降级到浏览器 TTS
5. 检查错误提示

## 性能优化

### 音频缓存策略

1. **后端缓存**
   - 使用 MD5 哈希作为文件名
   - 缓存目录：`backend/cache/audio/`
   - 缓存时间：永久（直到手动清理）

2. **前端缓存**
   - 使用 Map 存储音频 URL
   - 页面卸载时清理 URL
   - 最大缓存数量：50 个

3. **预加载策略**
   - 预加载下一个单词的音频
   - 在用户答题时后台加载
   - 减少等待时间

### 错误处理

1. **网络错误**
   - 自动重试 3 次
   - 重试间隔：1 秒
   - 失败后降级到浏览器 TTS

2. **配置错误**
   - 检查配置完整性
   - 提示管理员配置 TTS
   - 降级到浏览器 TTS

3. **API 错误**
   - 记录详细错误日志
   - 显示友好错误提示
   - 降级到浏览器 TTS

## 监控和日志

### 后端日志

```javascript
logger.info('TTS 合成成功', { text, cached: true });
logger.error('TTS 合成失败', { text, error: error.message });
logger.info('使用缓存音频', { text, cacheFile });
```

### 前端日志

```javascript
console.log('使用火山引擎 TTS');
console.error('TTS 失败，降级到浏览器 TTS');
console.log('音频预加载完成');
```

## 注意事项

1. **API 配额**
   - 火山引擎 TTS 有调用次数限制
   - 使用缓存减少 API 调用
   - 监控 API 使用量

2. **音频质量**
   - 火山引擎 TTS 音质优于浏览器 TTS
   - 支持多种音色和语速
   - 适合英语学习场景

3. **用户体验**
   - 首次播放可能有延迟
   - 使用预加载优化体验
   - 提供降级方案保证可用性

4. **安全性**
   - API 密钥加密存储
   - 仅认证用户可访问
   - 限制请求频率

## 下一步工作

1. [ ] 实现后端 TTS 服务
2. [ ] 创建 TTS 路由
3. [ ] 更新前端 TTS 服务
4. [ ] 修改学习页面集成 TTS
5. [ ] 实现音频缓存
6. [ ] 实现预加载机制
7. [ ] 添加错误处理
8. [ ] 测试完整流程
9. [ ] 性能优化
10. [ ] 监控和日志

## 参考资料

- [火山引擎 TTS 官方文档](https://www.volcengine.com/docs/6561/79820)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
