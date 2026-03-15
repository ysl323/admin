# 新功能使用指南

## 新增功能

### 1. 一键导入课程功能

#### 功能说明
- 支持新概念英语格式的 JSON 数据导入
- 自动识别是否有课时号（lesson 字段）
- 有课时号：自动按课时分组生成课程列表
- 无课时号：所有内容放在一个课程中

#### 数据格式

**必填字段：**
- `question` - 内容序号（数字）
- `english` - 英文内容
- `chinese` - 中文翻译

**可选字段：**
- `lesson` - 课时号（数字，有则按课时分组）

#### 示例数据

**有课时号（按课时分组）：**
```json
[
  {"lesson":1,"question":1,"english":"Excuse me!","chinese":"打扰一下！"},
  {"lesson":1,"question":2,"english":"Is this your handbag?","chinese":"这是你的手提包吗？"},
  {"lesson":2,"question":1,"english":"Good morning.","chinese":"早上好。"},
  {"lesson":2,"question":2,"english":"How are you today?","chinese":"你今天好吗？"}
]
```

**无课时号（全部内容）：**
```json
[
  {"question":1,"english":"新概念核心词汇","chinese":"excuse(打扰), handbag(手提包)"},
  {"question":2,"english":"核心句型","chinese":"Is this your…? 这是你的……吗？"}
]
```

#### 使用步骤

1. 登录管理员账户
2. 进入后台 → 内容管理 → 分类管理
3. 点击"一键导入课程"按钮
4. 填写分类名称（例如：新概念英语第一册）
5. 粘贴 JSON 数据
6. 点击"开始导入"
7. 等待导入完成

#### 测试数据

**测试文件 1：** `backend/new-concept-lesson1-3.json`
- 包含 3 个课时
- 每个课时 5 个句子
- 共 15 个句子

**测试文件 2：** `backend/new-concept-no-lesson.json`
- 无课时号
- 4 个核心内容
- 全部在一个课程中

### 2. TTS 配置测试功能

#### 功能说明
- 一键测试火山引擎 TTS 配置
- 一键测试谷歌 TTS 配置
- 验证配置是否完整
- 显示配置详情

#### 使用步骤

1. 登录管理员账户
2. 进入后台 → 配置管理
3. 填写 TTS 配置信息
4. 点击"测试配置"按钮
5. 查看测试结果

#### 火山引擎 TTS 配置

**正确的配置信息：**
```
APP ID: 8594935941
Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
Secret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
接口地址: https://openspeech.bytedance.com/api/v1/tts
默认音色: BV700_streaming (英文女声)
语言: en-US
```

**注意：**
- 字段名称已更正：API Key → Access Token，API Secret → Secret Key
- 这是火山引擎的标准术语

### 3. 配置字段名称修正

#### 修改内容
- ✅ "API Key" → "Access Token"
- ✅ "API Secret" → "Secret Key"
- ✅ 添加 AppID 示例提示
- ✅ 保持与火山引擎官方文档一致

## 完整测试流程

### 测试 1：导入有课时号的数据

1. 打开 `backend/new-concept-lesson1-3.json`
2. 复制全部内容
3. 进入后台 → 内容管理 → 分类管理
4. 点击"一键导入课程"
5. 分类名称：`新概念英语第一册`
6. 粘贴 JSON 数据
7. 点击"开始导入"
8. 验证结果：
   - 创建了 1 个分类
   - 创建了 3 个课程（第1课、第2课、第3课）
   - 创建了 15 个单词
   - 提示"按课时分组"

### 测试 2：导入无课时号的数据

1. 打开 `backend/new-concept-no-lesson.json`
2. 复制全部内容
3. 进入后台 → 内容管理 → 分类管理
4. 点击"一键导入课程"
5. 分类名称：`新概念核心知识点`
6. 粘贴 JSON 数据
7. 点击"开始导入"
8. 验证结果：
   - 创建了 1 个分类
   - 创建了 1 个课程（第1课）
   - 创建了 4 个单词
   - 提示"全部内容"

### 测试 3：测试火山引擎 TTS 配置

1. 进入后台 → 配置管理
2. 切换到"火山引擎 TTS"标签页
3. 填入配置信息：
   ```
   APP ID: 8594935941
   Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
   Secret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
   接口地址: https://openspeech.bytedance.com/api/v1/tts
   默认音色: 英文女声 (BV700_streaming)
   语言: 英文 (en-US)
   ```
4. 点击"保存配置"
5. 点击"测试配置"
6. 验证结果：
   - 显示"火山引擎 TTS 配置验证成功"
   - 显示配置详情

### 测试 4：测试谷歌 TTS 配置

1. 切换到"谷歌 TTS"标签页
2. 填入测试配置
3. 点击"保存配置"
4. 点击"测试配置"
5. 验证结果

## 技术实现

### 后端实现

**新增文件：**
- `backend/src/services/SimpleLessonImportService.js` - 简化导入服务

**新增路由：**
- `POST /api/admin/import-simple-lesson` - 简化课程导入
- `POST /api/admin/test-tts` - 测试 TTS 配置

**新增测试数据：**
- `backend/new-concept-lesson1-3.json` - 有课时号示例
- `backend/new-concept-no-lesson.json` - 无课时号示例

### 前端实现

**修改文件：**
- `frontend/src/views/admin/ContentManagement.vue` - 添加导入对话框
- `frontend/src/views/admin/ConfigManagement.vue` - 添加测试按钮，修正字段名称
- `frontend/src/services/admin.js` - 添加导入和测试方法

**新增功能：**
- 一键导入对话框
- JSON 数据验证
- 导入结果提示
- TTS 配置测试按钮

## 数据格式验证

### 有效格式

✅ **标准格式（有课时号）：**
```json
[
  {"lesson":1,"question":1,"english":"Hello","chinese":"你好"},
  {"lesson":1,"question":2,"english":"World","chinese":"世界"}
]
```

✅ **简化格式（无课时号）：**
```json
[
  {"question":1,"english":"Hello","chinese":"你好"},
  {"question":2,"english":"World","chinese":"世界"}
]
```

### 无效格式

❌ **缺少必填字段：**
```json
[
  {"lesson":1,"english":"Hello"}  // 缺少 question 和 chinese
]
```

❌ **字段名称错误：**
```json
[
  {"lesson":1,"question":1,"en":"Hello","cn":"你好"}  // 应该是 english 和 chinese
]
```

❌ **额外字段：**
```json
[
  {"lesson":1,"question":1,"english":"Hello","chinese":"你好","extra":"field"}  // 不允许额外字段
]
```

## 常见问题

### Q1: 导入失败，提示"JSON 格式错误"
**A:** 检查 JSON 格式是否正确，可以使用在线 JSON 验证工具验证。

### Q2: 导入成功但没有按课时分组
**A:** 检查数据中是否包含 `lesson` 字段，如果没有则会全部放在一个课程中。

### Q3: TTS 测试失败
**A:** 检查配置信息是否完整，特别是 APP ID、Access Token 和 Secret Key。

### Q4: 导入的单词顺序不对
**A:** 单词会按 `question` 字段从小到大排序，确保 question 值正确。

### Q5: 可以导入到已存在的分类吗？
**A:** 可以，如果分类已存在，会直接使用该分类；如果课程已存在，会在该课程下添加单词。

## 注意事项

1. **数据格式严格**
   - 只接受指定的 4 个字段
   - 字段名称必须完全匹配
   - 不允许额外字段

2. **课时号规则**
   - 有 lesson 字段：按课时分组
   - 无 lesson 字段：全部内容在第 1 课
   - lesson 必须是正整数

3. **内容排序**
   - 所有内容按 question 从小到大排序
   - 确保 question 值连续且唯一

4. **配置测试**
   - 测试只验证配置完整性
   - 不会实际调用 TTS API
   - 需要先保存配置才能测试

5. **导入结果**
   - 导入成功后会显示详细统计
   - 自动刷新分类、课程、单词列表
   - 可以立即查看导入的内容

## 下一步

1. ✅ 测试一键导入功能
2. ✅ 测试 TTS 配置功能
3. ⏳ 在学习页面集成火山引擎 TTS
4. ⏳ 实现音频缓存机制
5. ⏳ 添加批量操作功能

## 参考文档

- **COMPLETION-REPORT.md** - 之前功能完成报告
- **TTS-INTEGRATION-GUIDE.md** - TTS 集成指南
- **ADMIN-CONFIG-TEST-GUIDE.md** - 配置测试指南

---

**功能已完成，可以立即测试！** 🎉
