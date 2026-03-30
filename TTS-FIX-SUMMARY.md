# 火山引擎 TTS 问题修复总结

## 问题原因

我的代码有 **3个关键错误**:

### 1. ❌ API端点错误

```javascript
// 错误的代码
'https://openspeech.bytedance.com/tts_middle_layer/tts'

// 正确的代码
'https://openspeech.bytedance.com/api/v1/tts'
```

### 2. ❌ token字段写死了字符串

```javascript
// 错误的代码
app: {
  appid: volcConfig.appId,
  token: 'access_token',  // ❌ 这是字符串，不是真实的token!
  cluster: volcConfig.cluster
}

// 正确的代码
app: {
  appid: volcConfig.appId,
  token: volcConfig.apiKey,  // ✅ 使用真实的 access token
  cluster: volcConfig.cluster
}
```

### 3. ❌ 使用了错误的凭据

应该使用已验证可用的凭据:
- AppID: `2128862431`
- Access Token: `eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq`

## 修复内容

### 修改的文件

1. `backend/src/services/TTSService.js`
   - 修复 API 端点: `/api/v1/tts`
   - 修复 token 字段: 使用 `volcConfig.apiKey` 而不是字符串

2. `backend/src/services/AdminService.js`
   - 修复默认端点配置

3. 数据库配置
   - 更新为正确的 AppID 和 Access Token
   - 更新为正确的 API 端点

### 测试结果

```
✅ 成功！
API响应:
- 响应代码: 3000
- 响应消息: Success
- 音频大小: 46560 字节
```

## 正确的代码示例

```javascript
async getVolcengineAudio(text) {
  const config = await AdminService.getTTSConfig();
  const volcConfig = config.volcengine;

  const timestamp = Math.floor(Date.now() / 1000);
  const requestBody = {
    app: {
      appid: volcConfig.appId,
      token: volcConfig.apiKey,  // ✅ 使用真实的 access token
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
      operation: 'query'
    }
  };

  const response = await axios.post(
    volcConfig.endpoint || 'https://openspeech.bytedance.com/api/v1/tts',  // ✅ 正确的端点
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
    throw new Error(`获取音频失败: code=${response.data?.code}`);
  }
}
```

## 当前状态

✅ **已修复并验证成功**

- API 端点: `https://openspeech.bytedance.com/api/v1/tts`
- AppID: `2128862431`
- Access Token: `eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq`
- 测试结果: 成功返回 46KB 音频数据

## 感谢

非常感谢您的指正！这些错误确实是我的问题:
1. API 端点用错了
2. token 字段写死了字符串
3. 没有使用正确的凭据

现在已经全部修复，TTS 功能可以正常工作了！

---

**修复时间**: 2026-03-07  
**状态**: ✅ 已修复并验证成功
