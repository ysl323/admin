# 火山引擎 TTS Token 状态报告

## 当前配置

已成功更新为文档中的凭据:

- **AppID**: `2128862431` ✓
- **Access Token**: `eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq` ✓
- **Endpoint**: `https://openspeech.bytedance.com/tts_middle_layer/tts` ✓
- **Voice Type**: `BV001_streaming` ✓
- **Cluster**: `volcano_tts` ✓

## 测试结果

### 错误信息
```
错误码: 3001
错误消息: extract request resource id: get resource id: access denied
```

### 可能的原因

#### 1. Token 已过期 ⚠️

**重要发现**:
- 文档中的验证日期: **2025-02-16**
- 当前系统时间: **2026-03-07**
- 时间差: **约1年**

火山引擎的 Access Token 通常有有效期限制(常见为1年)。如果 token 是在 2025-02-16 创建的,那么到 2026-03-07 很可能已经过期。

#### 2. 其他可能原因

- Token 权限不足
- AppID 与 Token 不匹配
- API 端点变更
- 账户状态异常

## 解决方案

### 方案 1: 获取新的 Access Token (推荐)

1. 登录火山引擎控制台
2. 进入 TTS 服务管理页面
3. 生成新的 Access Token
4. 更新系统配置

### 方案 2: 检查 Token 有效期

1. 在火山引擎控制台查看当前 token 的有效期
2. 如果未过期,检查其他配置项
3. 确认 AppID 和 Token 是否匹配

### 方案 3: 联系火山引擎技术支持

如果以上方案都无法解决,建议联系火山引擎技术支持团队。

## 已完成的工作

✓ 更新 AppID 为正确值 (`2128862431`)
✓ 更新 Access Token 为文档中的值
✓ 移除 Secret Key (Token 认证不需要)
✓ 确认使用 Token 认证方式
✓ 测试多种 Authorization header 格式
✓ 添加 `/api/tts/speak` 端点(匹配文档中的前端调用方式)

## 请求格式验证

当前请求格式与文档完全一致:

```json
{
  "app": {
    "appid": "2128862431",
    "token": "access_token",
    "cluster": "volcano_tts"
  },
  "user": {
    "uid": "test_user_xxx"
  },
  "audio": {
    "voice_type": "BV001_streaming",
    "encoding": "mp3",
    "speed_ratio": 1.0,
    "volume_ratio": 1.0,
    "pitch_ratio": 1.0
  },
  "request": {
    "reqid": "test_xxx",
    "text": "Hello, this is a test.",
    "text_type": "plain",
    "operation": "query"
  }
}
```

Authorization header: `Bearer;eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq`

## 下一步行动

**需要用户提供**:
1. 新的 Access Token (如果当前 token 已过期)
2. 或者确认当前 token 的有效期
3. 或者提供火山引擎控制台的截图以便进一步诊断

## 测试脚本

已创建以下测试脚本供调试使用:

- `backend/update-tts-credentials.js` - 更新凭据
- `backend/clear-secret-key.js` - 清除 Secret Key
- `backend/test-tts-updated.js` - 测试 TTS 配置
- `backend/test-tts-debug.js` - 详细调试信息
- `backend/test-auth-formats.js` - 测试不同认证格式

## 新增功能

✓ 添加了 `/api/tts/speak` 端点,支持前端直接通过 URL 播放音频:

```javascript
// 前端调用示例
var url = '/api/tts/speak?text=' + encodeURIComponent(text);
var audio = new Audio(url);
audio.volume = 1.5;
audio.play();
```

---

**更新时间**: 2026-03-07
**状态**: 等待用户提供新的 Access Token
