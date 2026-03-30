# 火山引擎 TTS 模式切换和测试功能指南

## 功能概述

### 新增功能

1. **模式切换功能** ✅
   - 简单模式：只需填写核心密钥（AppID、Access Token、Secret Key）
   - 复杂模式：可自定义接口地址、音色、语言等高级参数

2. **带文本输入的测试功能** ✅
   - 点击"测试配置"按钮弹出对话框
   - 输入自定义测试文本
   - 实际调用 TTS API 生成语音
   - 返回详细的测试结果

## 使用指南

### 一、简单模式配置

**适用场景：** 快速配置，使用默认参数

**步骤：**

1. 登录管理员账户
2. 进入"配置管理" → "火山引擎 TTS"
3. 选择"简单模式"
4. 填写核心配置：
   ```
   AppID: 8594935941
   Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
   Secret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
   ```
5. 点击"保存配置"

**默认参数：**
- 接口地址：`https://openspeech.bytedance.com/api/v1/tts`
- 默认音色：`BV700_streaming` (英文女声)
- 语言：`en-US`

### 二、复杂模式配置

**适用场景：** 需要自定义高级参数

**步骤：**

1. 登录管理员账户
2. 进入"配置管理" → "火山引擎 TTS"
3. 选择"复杂模式"
4. 填写核心配置：
   ```
   AppID: 8594935941
   Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
   Secret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
   ```
5. 自定义高级配置：
   - **接口地址**：可修改为其他端点
   - **默认音色**：选择不同的音色
     - 通用女声 (BV001_streaming)
     - 通用男声 (BV002_streaming)
     - 英文女声 (BV700_streaming)
     - 英文男声 (BV701_streaming)
   - **语言**：选择中文或英文
6. 点击"保存配置"

### 三、测试配置

**步骤：**

1. 配置完成后，点击"测试配置"按钮
2. 在弹出的对话框中输入测试文本
   - 默认文本：`Hello, this is a test.`
   - 可自定义任何文本
3. 点击"开始测试"
4. 等待测试结果

**测试结果：**

✅ **成功：** 显示"配置测试成功！语音生成正常"
- 说明配置正确
- TTS API 调用成功
- 可以正常生成语音

❌ **失败：** 显示具体错误信息
- "火山引擎 TTS 配置不完整" - 检查必填字段
- "API 调用失败: 401" - 检查 Access Token 和 Secret Key
- "网络请求失败" - 检查网络连接和接口地址

## 模式对比

| 特性 | 简单模式 | 复杂模式 |
|------|---------|---------|
| 必填字段 | AppID、Access Token、Secret Key | AppID、Access Token、Secret Key |
| 接口地址 | 默认（不可修改） | 可自定义 |
| 音色选择 | 默认英文女声 | 可选择 4 种音色 |
| 语言设置 | 默认英文 | 可选择中文/英文 |
| 适用场景 | 快速配置 | 精细化配置 |

## 配置项说明

### 核心配置（两种模式都需要）

| 字段 | 说明 | 示例 | 必填 |
|------|------|------|------|
| AppID | 应用 ID | 8594935941 | 是 |
| Access Token | 访问令牌 | sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL | 是 |
| Secret Key | 密钥 | hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR | 是 |

### 高级配置（仅复杂模式）

| 字段 | 说明 | 默认值 | 可选值 |
|------|------|--------|--------|
| 接口地址 | API 端点 | https://openspeech.bytedance.com/api/v1/tts | 自定义 URL |
| 默认音色 | 语音类型 | BV700_streaming | BV001/BV002/BV700/BV701 |
| 语言 | 语言代码 | en-US | zh-CN / en-US |

## 测试功能说明

### 测试流程

1. **验证配置完整性**
   - 检查必填字段是否填写
   - 验证字段格式是否正确

2. **构建测试请求**
   - 使用用户输入的测试文本
   - 根据配置模式使用相应参数
   - 生成 HMAC-SHA256 签名

3. **调用 TTS API**
   - 发送 HTTP POST 请求
   - 传递配置参数和测试文本
   - 等待 API 响应

4. **验证响应**
   - 检查响应状态码
   - 验证音频数据是否存在
   - 返回测试结果

### 测试文本建议

**英文测试：**
```
Hello, this is a test.
Excuse me!
Good morning.
```

**中文测试：**
```
你好，这是一个测试。
打扰一下！
早上好。
```

**混合测试：**
```
Hello 你好, this is a test 测试.
```

## 常见问题

### Q1: 简单模式和复杂模式可以切换吗？

**A:** 可以随时切换。切换到简单模式时，高级参数会自动使用默认值。

### Q2: 切换模式后需要重新保存配置吗？

**A:** 是的，切换模式后需要点击"保存配置"按钮保存更改。

### Q3: 测试失败但配置看起来正确怎么办？

**A:** 
1. 检查 Access Token 和 Secret Key 是否有多余空格
2. 确认配置信息来自火山引擎控制台
3. 检查网络连接是否正常
4. 尝试使用简单的测试文本（如 "Hello"）

### Q4: 测试成功后还需要做什么？

**A:** 测试成功说明配置正确，可以在学习页面正常使用 TTS 功能了。

### Q5: 可以测试多次吗？

**A:** 可以，每次测试都会实际调用 API，建议适度测试以避免 API 配额消耗。

## 技术实现

### 前端实现

**文件：** `frontend/src/views/admin/ConfigManagement.vue`

**新增功能：**
1. 模式切换单选框
2. 条件渲染高级配置字段
3. 测试对话框组件
4. 测试文本输入框

**关键代码：**
```vue
<!-- 模式切换 -->
<el-radio-group v-model="volcengineMode">
  <el-radio label="simple">简单模式</el-radio>
  <el-radio label="advanced">复杂模式</el-radio>
</el-radio-group>

<!-- 条件渲染 -->
<template v-if="volcengineMode === 'advanced'">
  <!-- 高级配置字段 -->
</template>

<!-- 测试对话框 -->
<el-dialog v-model="volcengineTestDialog">
  <el-input v-model="volcengineTestText" type="textarea" />
</el-dialog>
```

### 后端实现

**文件：** `backend/src/services/AdminService.js`

**新增功能：**
1. 保存模式信息到数据库
2. 加载模式信息
3. 支持自定义测试文本

**关键代码：**
```javascript
// 保存模式
{ key: 'volcengine_mode', value: config.mode || 'simple' }

// 加载模式
mode: configMap.volcengine_mode || 'simple'
```

**文件：** `backend/src/routes/admin.js`

**更新功能：**
```javascript
// 接收测试文本参数
const { provider, text } = req.body;
const testText = text || 'Hello, this is a test.';

// 调用测试服务
result = await TTSService.testVolcengineTTS(testText);
```

## 测试清单

### 简单模式测试

- [ ] 切换到简单模式
- [ ] 填写核心配置
- [ ] 保存配置成功
- [ ] 点击测试配置
- [ ] 输入测试文本
- [ ] 测试成功

### 复杂模式测试

- [ ] 切换到复杂模式
- [ ] 填写核心配置
- [ ] 自定义接口地址
- [ ] 选择不同音色
- [ ] 选择语言
- [ ] 保存配置成功
- [ ] 点击测试配置
- [ ] 输入测试文本
- [ ] 测试成功

### 模式切换测试

- [ ] 从简单模式切换到复杂模式
- [ ] 高级配置字段显示
- [ ] 从复杂模式切换到简单模式
- [ ] 高级配置字段隐藏
- [ ] 切换后保存配置
- [ ] 刷新页面后模式保持

### 测试功能测试

- [ ] 使用默认测试文本
- [ ] 使用自定义英文文本
- [ ] 使用自定义中文文本
- [ ] 使用空文本（应提示错误）
- [ ] 测试成功后对话框关闭
- [ ] 测试失败显示错误信息

## 下一步

1. ✅ 模式切换功能已完成
2. ✅ 测试功能已完成
3. ⏳ 在学习页面集成火山引擎 TTS
4. ⏳ 实现音频缓存机制
5. ⏳ 添加音频播放功能

## 参考文档

- **FINAL-IMPLEMENTATION-GUIDE.md** - 最终实现指南
- **VOLCENGINE-TTS-CONFIG.md** - 火山引擎 TTS 配置文档
- **TTS-INTEGRATION-GUIDE.md** - TTS 集成指南

---

**更新时间：** 2026-03-06

**状态：** ✅ 功能已完成并可测试
