# 火山引擎 TTS 诊断报告

## 问题描述

使用文档中提供的凭据调用火山引擎 TTS API 时,持续返回错误码 3001:
```
"message": "extract request resource id: get resource id: access denied"
```

## 已完成的修复

### 1. 修复响应码判断错误 ✓

**问题**: 代码中判断成功的响应码为 0,但根据火山引擎官方文档,成功的响应码应该是 3000。

**修复**: 
```javascript
// 修复前
if (response.data.code === 0) { // 错误!

// 修复后  
if (response.data.code === 3000) { // 正确!
```

**参考**: 火山引擎官方文档示例代码
```go
if code != 3000 {
    fmt.Printf("code fail [code:%d]\n", code)
    return nil, errors.New("resp code fail")
}
```

### 2. 更新凭据到正确值 ✓

- AppID: `2128862431` ✓
- Access Token: `eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq` ✓
- Endpoint: `https://openspeech.bytedance.com/tts_middle_layer/tts` ✓
- Cluster: `volcano_tts` ✓
- Voice Type: `BV001_streaming` ✓

### 3. 移除 Secret Key ✓

Token 认证方式不需要 Secret Key,已从数据库中删除。

### 4. 添加 /api/tts/speak 端点 ✓

根据用户文档,添加了直接返回音频流的端点,匹配前端调用方式。

## 当前状态

### 请求格式

完全按照官方文档格式:

```json
{
  "app": {
    "appid": "2128862431",
    "token": "access_token",
    "cluster": "volcano_tts"
  },
  "user": {
    "uid": "uid"
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

### 请求头

```
Content-Type: application/json
Authorization: Bearer;eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq
```

### 响应

```json
{
  "reqid": "test_xxx",
  "code": 3001,
  "operation": "query",
  "message": "extract request resource id: get resource id: access denied",
  "addition": {}
}
```

## 可能的原因

### 1. Access Token 已过期或无效

**症状**: 错误码 3001 - "access denied"

**可能性**: 高

**原因**:
- 文档验证日期: 2025-02-16
- 当前系统时间: 2026-03-07
- 时间差: 约1年

火山引擎 Access Token 通常有有效期限制。

### 2. AppID 与 Access Token 不匹配

**可能性**: 中

**原因**: 如果 AppID 和 Token 不是同一个应用生成的,会导致认证失败。

### 3. 应用权限配置问题

**可能性**: 中

**原因**: 该应用可能没有开通 TTS 服务权限,或者权限已被撤销。

### 4. Cluster 配置错误

**可能性**: 低

**原因**: 不同的应用可能分配到不同的 cluster,需要确认正确的 cluster 值。

## 解决方案

### 方案 1: 重新获取 Access Token (推荐)

1. 登录火山引擎控制台: https://console.volcengine.com/
2. 进入"音频技术" -> "语音合成"
3. 选择应用 (AppID: 2128862431)
4. 重新生成 Access Token
5. 更新系统配置

### 方案 2: 验证应用配置

1. 确认 AppID `2128862431` 对应的应用状态正常
2. 确认该应用已开通 TTS 服务
3. 确认 Cluster 值为 `volcano_tts`
4. 确认 Voice Type `BV001_streaming` 可用

### 方案 3: 使用测试工具验证

使用火山引擎提供的测试工具或 Postman 直接测试 API,排除代码问题。

## 测试脚本

已创建以下测试脚本:

1. `backend/update-tts-credentials.js` - 更新凭据
2. `backend/test-tts-updated.js` - 测试配置
3. `backend/test-exact-doc-format.js` - 完全按照官方文档格式测试
4. `backend/test-voice-field.js` - 测试不同字段名

## 下一步

**需要用户操作**:

1. 登录火山引擎控制台
2. 检查 AppID `2128862431` 的状态
3. 如果 Access Token 已过期,重新生成
4. 提供新的 Access Token

或者:

如果您那边测试正常,请提供:
1. 您使用的完整请求示例(包括所有字段)
2. 您使用的 Authorization header 格式
3. 成功响应的示例

这样我可以对比找出差异。

---

**更新时间**: 2026-03-07  
**状态**: 等待用户提供新的 Access Token 或测试详情
