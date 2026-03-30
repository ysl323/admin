# 火山引擎 TTS 完整代码 - 供审查

## 问题说明

使用火山引擎 TTS API 时持续返回错误码 3001: "access denied"

凭据信息（刚重新生成的）:
- AppID: `2322585992`
- Access Token: `xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys`
- Secret Key: `MkJ8GxK_4PZcsuxBXSAZw1CkUa1JJh_F`

## 完整的 TTS 服务代码

### 文件: backend/src/services/TTSService.js

```javascript
import axios from 'axios';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import AdminService from './AdminService.js';

class TTSService {
  async testVolcengineTTS(text = 'Hello, this is a test.') {
    try {
      const config = await AdminService.getTTSConfig();
      const volcConfig = config.volcengine;

      if (!volcConfig.appId || !volcConfig.apiKey) {
        return {
          success: false,
          message: '火山引擎 TTS 配置不完整（需要 AppID 和 Access Token）'
        };
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const requestBody = {
        app: {
          appid: volcConfig.appId,
          token: 'access_token',
          cluster: volcConfig.cluster || 'volcano_tts'
        },
        user: {
          uid: 'test_user_' + timestamp
        },
        audio: {
          voice_type: volcConfig.voiceType || 'BV001_streaming',
          encoding: 'mp3',
          speed_ratio: 1.0,
          volume_ratio: 1.0,
          pitch_ratio: 1.0
        },
        request: {
          reqid: `test_${timestamp}_${Math.random().toString(36).substring(7)}`,
          text: text,
          text_type: 'plain',
          operation: 'query'
        }
      };

      const headers = {
        'Content-Type': 'application/json'
      };

      if (volcConfig.apiSecret) {
        const bodyStr = JSON.stringify(requestBody);
        const signature = this.generateVolcengineSignature(volcConfig.apiSecret, bodyStr);
        headers['Authorization'] = `Bearer;${volcConfig.apiKey}`;
        headers['X-Signature'] = signature;
      } else {
        headers['Authorization'] = `Bearer;${volcConfig.apiKey}`;
      }

      const response = await axios.post(
        volcConfig.endpoint || 'https://openspeech.bytedance.com/tts_middle_layer/tts',
        requestBody,
        {
          headers,
          timeout: 10000
        }
      );

      if (response.data && response.data.code === 3000) {
        return {
          success: true,
          message: '火山引擎 TTS 配置测试成功',
          data: {
            reqid: response.data.reqid,
            hasAudio: !!response.data.data
          }
        };
      } else {
        return {
          success: false,
          message: `火山引擎 TTS 返回错误: ${response.data?.message || '未知错误'}`,
          code: response.data?.code
        };
      }
    } catch (error) {
      logger.error('火山引擎 TTS 测试异常:', error);
      return {
        success: false,
        message: `测试失败: ${error.message}`
      };
    }
  }

  generateVolcengineSignature(secret, body) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    return hmac.digest('hex');
  }

  async getVolcengineAudio(text) {
    try {
      const config = await AdminService.getTTSConfig();
      const volcConfig = config.volcengine;

      const timestamp = Math.floor(Date.now() / 1000);
      const requestBody = {
        app: {
          appid: volcConfig.appId,
          token: 'access_token',
          cluster: volcConfig.cluster || 'volcano_tts'
        },
        user: {
          uid: 'user_' + timestamp
        },
        audio: {
          voice_type: volcConfig.voiceType || 'BV001_streaming',
          encoding: 'mp3',
          speed_ratio: 1.0,
          volume_ratio: 1.0,
          pitch_ratio: 1.0
        },
        request: {
          reqid: `req_${timestamp}`,
          text: text,
          text_type: 'plain',
          operation: 'query',
          with_frontend: 1,
          frontend_type: 'unitTson'
        }
      };

      const response = await axios.post(
        volcConfig.endpoint || 'https://openspeech.bytedance.com/tts_middle_layer/tts',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer;${volcConfig.apiKey}`
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.code === 3000 && response.data.data) {
        return Buffer.from(response.data.data, 'base64');
      } else {
        const errorMsg = `获取音频失败: code=${response.data?.code}, message=${response.data?.message}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      logger.error('获取火山引擎音频失败:', error);
      throw error;
    }
  }
}

export default new TTSService();
```

## 独立测试脚本

### 文件: backend/test-tts-standalone.js

```javascript
import axios from 'axios';
import crypto from 'crypto';

// 使用最新的凭据
const CONFIG = {
  appId: '2322585992',
  accessToken: 'xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys',
  secretKey: 'MkJ8GxK_4PZcsuxBXSAZw1CkUa1JJh_F',
  endpoint: 'https://openspeech.bytedance.com/tts_middle_layer/tts',
  cluster: 'volcano_tts',
  voiceType: 'BV001_streaming'
};

function generateSignature(secret, body) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  return hmac.digest('hex');
}

async function testTTS() {
  const text = 'Hello, this is a test.';
  const timestamp = Math.floor(Date.now() / 1000);

  const requestBody = {
    app: {
      appid: CONFIG.appId,
      token: 'access_token',
      cluster: CONFIG.cluster
    },
    user: {
      uid: `test_user_${timestamp}`
    },
    audio: {
      voice_type: CONFIG.voiceType,
      encoding: 'mp3',
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0
    },
    request: {
      reqid: `test_${timestamp}`,
      text: text,
      text_type: 'plain',
      operation: 'query'
    }
  };

  console.log('请求配置:');
  console.log('  AppID:', CONFIG.appId);
  console.log('  Endpoint:', CONFIG.endpoint);
  console.log('  Cluster:', CONFIG.cluster);
  console.log('  Voice Type:', CONFIG.voiceType);
  console.log('\n请求体:', JSON.stringify(requestBody, null, 2));

  // 测试1: Token 认证
  console.log('\n[测试 1] Token 认证:');
  try {
    const response1 = await axios.post(CONFIG.endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer;${CONFIG.accessToken}`
      },
      timeout: 10000
    });

    console.log('响应:', response1.data);
    if (response1.data.code === 3000) {
      console.log('✓ 成功!');
      return;
    }
  } catch (error) {
    console.log('✗ 失败:', error.response?.data || error.message);
  }

  // 测试2: 签名认证
  console.log('\n[测试 2] 签名认证:');
  try {
    const bodyStr = JSON.stringify(requestBody);
    const signature = generateSignature(CONFIG.secretKey, bodyStr);

    const response2 = await axios.post(CONFIG.endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer;${CONFIG.accessToken}`,
        'X-Signature': signature
      },
      timeout: 10000
    });

    console.log('响应:', response2.data);
    if (response2.data.code === 3000) {
      console.log('✓ 成功!');
      return;
    }
  } catch (error) {
    console.log('✗ 失败:', error.response?.data || error.message);
  }
}

testTTS();
```

## 实际的 API 请求示例

### 请求

```
POST https://openspeech.bytedance.com/tts_middle_layer/tts
Content-Type: application/json
Authorization: Bearer;xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys

{
  "app": {
    "appid": "2322585992",
    "token": "access_token",
    "cluster": "volcano_tts"
  },
  "user": {
    "uid": "test_user_1772814617"
  },
  "audio": {
    "voice_type": "BV001_streaming",
    "encoding": "mp3",
    "speed_ratio": 1.0,
    "volume_ratio": 1.0,
    "pitch_ratio": 1.0
  },
  "request": {
    "reqid": "test_1772814617",
    "text": "Hello, this is a test.",
    "text_type": "plain",
    "operation": "query"
  }
}
```

### 实际响应

```json
{
  "reqid": "test_1772814617",
  "code": 3001,
  "operation": "query",
  "message": "extract request resource id: get resource id: access denied",
  "addition": {}
}
```

## 问题

代码完全按照火山引擎官方文档实现，但持续返回 3001 错误。

请帮忙检查代码是否有问题，或者这是 API 配置/权限的问题？
