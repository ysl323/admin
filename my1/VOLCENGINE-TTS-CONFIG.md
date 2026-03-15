# 火山引擎 TTS 配置文档

## 火山引擎 TTS 凭证信息

### 正式凭证
```
APP ID: 8594935941
Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPLSecret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
```

### 配置说明
- **APP ID**: 应用标识符
- **Access Token**: 访问令牌（需加密存储）
- **Secret Key**: 密钥（需加密存储）
- **接口地址**: https://openspeech.bytedance.com/api/v1/tts
- **默认音色**: BV700_streaming（英文女声）
- **语言**: en-US

## 配置存储方案

### 1. 数据库存储结构

```sql
-- configs 表
CREATE TABLE configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,  -- 加密后的 JSON 字符串
  createdAt DATETIME,
  updatedAt DATETIME
);

-- 存储示例
INSERT INTO configs (key, value) VALUES (
  'tts_volcengine',
  'encrypted_json_string_here'
);
```

### 2. 加密存储实现

```javascript
// backend/src/utils/encryption.js

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!';
const ALGORITHM = 'aes-256-cbc';

/**
 * 加密数据
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 解密数据
 */
export function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 32)),
    iv
  );
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * 脱敏显示
 */
export function maskSensitiveData(data, visibleChars = 4) {
  if (!data || data.length <= visibleChars) return data;
  const visible = data.slice(0, visibleChars);
  const masked = '*'.repeat(Math.min(data.length - visibleChars, 20));
  return visible + masked;
}
```

### 3. 配置管理服务

```javascript
// backend/src/services/ConfigService.js

import { Config } from '../models/index.js';
import { encrypt, decrypt, maskSensitiveData } from '../utils/encryption.js';
import logger from '../utils/logger.js';

class ConfigService {
  /**
   * 保存 TTS 配置
   */
  async saveTTSConfig(provider, config) {
    try {
      const key = `tts_${provider}`;
      
      // 加密配置
      const encryptedValue = encrypt(JSON.stringify(config));
      
      // 保存或更新
      const [configRecord, created] = await Config.findOrCreate({
        where: { key },
        defaults: { value: encryptedValue }
      });
      
      if (!created) {
        configRecord.value = encryptedValue;
        await configRecord.save();
      }
      
      logger.info(`TTS 配置已保存: ${provider}`);
      
      return {
        success: true,
        message: '配置保存成功'
      };
    } catch (error) {
      logger.error('保存 TTS 配置失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取 TTS 配置
   */
  async getTTSConfig(provider) {
    try {
      const key = `tts_${provider}`;
      const configRecord = await Config.findOne({ where: { key } });
      
      if (!configRecord) {
        return null;
      }
      
      // 解密配置
      const decrypted = decrypt(configRecord.value);
      const config = JSON.parse(decrypted);
      
      // 脱敏处理
      if (config.accessToken) {
        config.accessTokenMasked = maskSensitiveData(config.accessToken);
      }
      if (config.secretKey) {
        config.secretKeyMasked = maskSensitiveData(config.secretKey);
      }
      if (config.apiKey) {
        config.apiKeyMasked = maskSensitiveData(config.apiKey);
      }
      
      return config;
    } catch (error) {
      logger.error('获取 TTS 配置失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取所有 TTS 配置
   */
  async getAllTTSConfigs() {
    try {
      const volcengine = await this.getTTSConfig('volcengine');
      const google = await this.getTTSConfig('google');
      
      return {
        volcengine: volcengine || {},
        google: google || {}
      };
    } catch (error) {
      logger.error('获取所有 TTS 配置失败:', error);
      throw error;
    }
  }
}

export default new ConfigService();
```

## 火山引擎 TTS 集成

### 1. TTS 服务实现

```javascript
// backend/src/services/VolcengineTTSService.js

import axios from 'axios';
import crypto from 'crypto';
import ConfigService from './ConfigService.js';
import logger from '../utils/logger.js';

class VolcengineTTSService {
  /**
   * 生成签名
   */
  generateSignature(params, secretKey) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');
  }
  
  /**
   * 合成语音
   */
  async synthesize(text, options = {}) {
    try {
      // 获取配置
      const config = await ConfigService.getTTSConfig('volcengine');
      
      if (!config || !config.appId || !config.accessToken) {
        throw new Error('火山引擎 TTS 配置不完整');
      }
      
      const params = {
        app_id: config.appId,
        access_token: config.accessToken,
        text: text,
        voice_type: options.voiceType || config.voiceType || 'BV700_streaming',
        language: options.language || config.language || 'en-US',
        speed_ratio: options.speedRatio || 1.0,
        volume_ratio: options.volumeRatio || 1.0,
        pitch_ratio: options.pitchRatio || 1.0
      };
      
      // 生成签名
      if (config.secretKey) {
        params.signature = this.generateSignature(params, config.secretKey);
      }
      
      const endpoint = config.endpoint || 'https://openspeech.bytedance.com/api/v1/tts';
      
      const response = await axios.post(endpoint, params, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      logger.info(`火山引擎 TTS 合成成功: ${text.substring(0, 20)}...`);
      
      return {
        success: true,
        audio: response.data,
        format: 'mp3'
      };
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
      const result = await this.synthesize('test', {});
      return {
        success: true,
        message: '连接测试成功'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '连接测试失败'
      };
    }
  }
}

export default new VolcengineTTSService();
```

### 2. 前端 TTS 服务更新

```javascript
// frontend/src/services/tts.js

import api from './api';

export default {
  /**
   * 合成语音（使用火山引擎）
   */
  async synthesize(text, wordId = null) {
    return await api.post('/tts/synthesize', { 
      text, 
      wordId,
      provider: 'volcengine'  // 默认使用火山引擎
    });
  },

  /**
   * 获取音频 URL
   */
  getAudioUrl(filename) {
    return `/api/tts/audio/${filename}`;
  },

  /**
   * 测试 TTS 配置
   */
  async testTTS(provider = 'volcengine') {
    return await api.post('/tts/test', { provider });
  }
};
```

## 前端配置页面更新

### 更新 ConfigManagement.vue

```vue
<!-- 火山引擎配置表单 -->
<el-form-item label="APP ID" prop="appId">
  <el-input v-model="volcengineForm.appId" placeholder="8594935941" />
</el-form-item>

<el-form-item label="Access Token" prop="accessToken">
  <el-input 
    v-model="volcengineForm.accessToken" 
    type="password"
    show-password
    placeholder="sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL"
  />
  <span v-if="volcengineForm.accessTokenMasked" class="masked-hint">
    当前值: {{ volcengineForm.accessTokenMasked }}
  </span>
</el-form-item>

<el-form-item label="Secret Key" prop="secretKey">
  <el-input 
    v-model="volcengineForm.secretKey" 
    type="password"
    show-password
    placeholder="hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR"
  />
  <span v-if="volcengineForm.secretKeyMasked" class="masked-hint">
    当前值: {{ volcengineForm.secretKeyMasked }}
  </span>
</el-form-item>

<el-form-item label="接口地址" prop="endpoint">
  <el-input 
    v-model="volcengineForm.endpoint" 
    placeholder="https://openspeech.bytedance.com/api/v1/tts" 
  />
</el-form-item>

<el-form-item label="默认音色" prop="voiceType">
  <el-select v-model="volcengineForm.voiceType">
    <el-option label="英文女声 (推荐)" value="BV700_streaming" />
    <el-option label="英文男声" value="BV701_streaming" />
    <el-option label="通用女声" value="BV001_streaming" />
    <el-option label="通用男声" value="BV002_streaming" />
  </el-select>
</el-form-item>

<el-form-item>
  <el-button type="primary" @click="saveVolcengineConfig" :loading="saving">
    保存配置
  </el-button>
  <el-button @click="resetVolcengineForm">重置</el-button>
  <el-button @click="testVolcengineConnection" :loading="testing">
    测试连接
  </el-button>
</el-form-item>
```

## 环境变量配置

### .env 文件

```bash
# 加密密钥（32字符）
ENCRYPTION_KEY=your-32-character-secret-key!!

# 火山引擎 TTS 配置（可选，也可通过管理后台配置）
VOLCENGINE_APP_ID=8594935941
VOLCENGINE_ACCESS_TOKEN=sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
VOLCENGINE_SECRET_KEY=hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
VOLCENGINE_ENDPOINT=https://openspeech.bytedance.com/api/v1/tts
```

## 初始化配置脚本

```javascript
// backend/scripts/initTTSConfig.js

import ConfigService from '../src/services/ConfigService.js';
import logger from '../src/utils/logger.js';

async function initTTSConfig() {
  try {
    // 初始化火山引擎配置
    await ConfigService.saveTTSConfig('volcengine', {
      appId: '8594935941',
      accessToken: 'sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL',
      secretKey: 'hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR',
      endpoint: 'https://openspeech.bytedance.com/api/v1/tts',
      voiceType: 'BV700_streaming',
      language: 'en-US'
    });
    
    logger.info('✅ 火山引擎 TTS 配置初始化成功');
    console.log('✅ 火山引擎 TTS 配置初始化成功');
    
    process.exit(0);
  } catch (error) {
    logger.error('❌ 初始化失败:', error);
    console.error('❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

initTTSConfig();
```

运行初始化：
```bash
cd backend
node scripts/initTTSConfig.js
```

## 使用说明

### 1. 管理员配置 TTS

1. 登录管理后台（admin / admin123）
2. 进入"配置管理"
3. 选择"火山引擎 TTS"标签
4. 填写配置信息：
   - APP ID: 8594935941
   - Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
   - Secret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
   - 接口地址: https://openspeech.bytedance.com/api/v1/tts
   - 默认音色: 英文女声 (BV700_streaming)
   - 语言: en-US
5. 点击"保存配置"
6. 点击"测试连接"验证配置

### 2. 前端使用 TTS

学习页面会自动使用火山引擎 TTS：

```javascript
// 在 LearningPage.vue 中
import ttsService from '../services/tts';

// 播放单词发音
const playAudio = async (text) => {
  try {
    const response = await ttsService.synthesize(text);
    if (response.success && response.audioUrl) {
      const audio = new Audio(response.audioUrl);
      await audio.play();
    }
  } catch (error) {
    console.error('播放失败:', error);
    // 降级到浏览器 TTS
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};
```

### 3. 切换 TTS 提供商

可以在配置管理中切换：
- 火山引擎 TTS（默认，推荐）
- 谷歌 TTS（备用）
- 浏览器 TTS（降级方案）

## 安全特性

### 1. 加密存储
- 所有敏感配置使用 AES-256-CBC 加密
- 加密密钥存储在环境变量中
- 数据库中只存储加密后的数据

### 2. 脱敏显示
- Access Token 显示：sRWj********************
- Secret Key 显示：hLY8********************
- 只显示前4个字符，其余用星号替代

### 3. 权限控制
- 只有管理员可以查看和修改配置
- 所有操作记录在日志中
- API 调用需要认证

## 测试清单

### 配置测试
- [ ] 保存火山引擎配置
- [ ] 配置加密存储验证
- [ ] 配置脱敏显示验证
- [ ] 测试连接功能
- [ ] 配置重置功能

### TTS 功能测试
- [ ] 单词发音播放
- [ ] 音频缓存功能
- [ ] 错误降级处理
- [ ] 多次播放测试
- [ ] 不同音色测试

### 安全测试
- [ ] 非管理员无法访问配置
- [ ] 配置数据加密验证
- [ ] 敏感信息脱敏验证
- [ ] API 调用权限验证

## 故障排查

### 问题 1：TTS 合成失败
**检查：**
- APP ID 是否正确
- Access Token 是否有效
- Secret Key 是否正确
- 网络连接是否正常
- 接口地址是否正确

### 问题 2：配置保存失败
**检查：**
- 数据库连接是否正常
- 加密密钥是否配置
- 表单验证是否通过
- 后端日志错误信息

### 问题 3：音频无法播放
**检查：**
- TTS 配置是否正确
- 音频文件是否生成
- 浏览器是否支持音频播放
- 网络请求是否成功

## 相关文件

### 后端文件
- `backend/src/services/ConfigService.js` - 配置管理服务
- `backend/src/services/VolcengineTTSService.js` - 火山引擎 TTS 服务
- `backend/src/utils/encryption.js` - 加密工具
- `backend/scripts/initTTSConfig.js` - 配置初始化脚本

### 前端文件
- `frontend/src/views/admin/ConfigManagement.vue` - 配置管理页面
- `frontend/src/services/tts.js` - TTS 服务
- `frontend/src/views/LearningPage.vue` - 学习页面（使用 TTS）

## 注意事项

1. **凭证安全**：不要将凭证提交到版本控制系统
2. **加密密钥**：确保 ENCRYPTION_KEY 足够复杂且安全存储
3. **配额限制**：注意火山引擎 API 的调用配额
4. **错误处理**：实现降级方案，TTS 失败时使用浏览器 TTS
5. **缓存策略**：实现音频缓存，减少 API 调用次数

## 下一步工作

1. ✅ 创建加密工具类
2. ✅ 实现配置管理服务
3. ✅ 实现火山引擎 TTS 服务
4. ⚠️ 更新前端 TTS 调用
5. ⚠️ 实现音频缓存机制
6. ⚠️ 添加测试用例
7. ⚠️ 完善错误处理
