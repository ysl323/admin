# 火山引擎 TTS Token 认证更新

## 更新日期
2026-03-06

## 更新内容

### 1. API 端点更新
- **旧端点**: `https://openspeech.bytedance.com/api/v1/tts`
- **新端点**: `https://openspeech.bytedance.com/tts_middle_layer/tts`

### 2. 认证方式
使用 Token 认证方式（推荐），不需要 Secret Key。

**认证信息**:
- AppID: 2128862431
- Access Token: eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq
- 音色: BV001_streaming
- 集群: volcano_tts

**请求格式**:
```json
{
  "app": {
    "appid": "2128862431",
    "token": "eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq",
    "cluster": "volcano_tts"
  },
  "user": {
    "uid": "user_123456"
  },
  "audio": {
    "voice_type": "BV001_streaming",
    "encoding": "mp3",
    "speed_ratio": 1.0,
    "volume_ratio": 1.0,
    "pitch_ratio": 1.0
  },
  "request": {
    "reqid": "req_123456",
    "text": "Hello, this is a test.",
    "text_type": "plain",
    "operation": "query"
  }
}
```

**Authorization Header**:
```
Authorization: Bearer;eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq
```

### 3. 错误代码说明

| 错误代码 | 说明 | 解决方法 |
|---------|------|---------|
| 3000 | 认证失败：AppID 或 Access Token 不正确 | 请检查控制台配置 |
| 3001 | 访问被拒绝：请检查 Access Token 是否有效或已过期 | 请检查 Access Token 是否有效或已过期 |

### 4. 当前状态

**状态**: 配置已更新，但 Access Token 可能无效或已过期

**建议**: 
1. 登录 Volcengine 控制台
2. 验证 AppID 和 Access Token 是否正确
3. 检查 Access Token 是否已过期
4. 如有必要，重新生成 Access Token

### 5. 测试方法

使用以下命令测试 TTS 配置：

```bash
# Windows
powershell -ExecutionPolicy Bypass -File test-tts-session.ps1

# 或者使用浏览器访问前端界面
# http://localhost:5173/admin/config
```

### 6. 文件更新

- `my1/backend/src/services/TTSService.js` - 更新 API 端点和错误处理
- `my1/backend/src/services/AdminService.js` - 更新默认端点
- `my1/frontend/src/views/admin/ConfigManagement.vue` - 更新默认端点
- `my1/test-tts-session.ps1` - 更新测试脚本
