# 快速参考卡片

## 🚀 快速开始

### 启动服务

```bash
# 后端服务（已运行）
cd backend
npm start
# 运行在 http://localhost:3000

# 前端服务（已运行）
cd frontend
npm run dev
# 运行在 http://localhost:5173
```

### 管理员登录

- **URL:** http://localhost:5173
- **用户名:** `admin`
- **密码:** `admin123`

## 📦 一键导入课程

### 步骤

1. 登录管理员账户
2. 点击"进入后台"
3. 进入"内容管理" → "分类管理"
4. 点击"一键导入课程"
5. 填写分类名称
6. 粘贴 JSON 数据
7. 点击"开始导入"

### 数据格式

**有课时号（按课时分组）：**
```json
[
  {"lesson":1,"question":1,"english":"Hello","chinese":"你好"},
  {"lesson":2,"question":1,"english":"World","chinese":"世界"}
]
```

**无课时号（全部内容）：**
```json
[
  {"question":1,"english":"Hello","chinese":"你好"},
  {"question":2,"english":"World","chinese":"世界"}
]
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| lesson | 否 | 课时号 |
| question | 是 | 序号 |
| english | 是 | 英文 |
| chinese | 是 | 中文 |

## 🔊 TTS 配置测试

### 火山引擎配置

```
APP ID: 8594935941
Access Token: sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL
Secret Key: hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR
接口地址: https://openspeech.bytedance.com/api/v1/tts
默认音色: BV700_streaming
语言: en-US
```

### 测试步骤

1. 进入"配置管理"
2. 填写配置信息
3. 点击"保存配置"
4. 点击"测试配置"
5. 查看测试结果

## 📝 测试数据

### 文件位置

- `backend/new-concept-lesson1-3.json` - 有课时号（3课时，15句）
- `backend/new-concept-no-lesson.json` - 无课时号（4条内容）

### 快速测试

```bash
# 打开测试页面
open-test-page.bat

# 查看测试指南
test-all-features.md
```

## 🔧 常见问题

### 导入失败

- ✅ 检查 JSON 格式
- ✅ 确保字段名称正确
- ✅ 确保数据类型正确

### TTS 测试失败

- ✅ 检查配置完整性
- ✅ 检查 Token 和 Key
- ✅ 检查网络连接

### 音频不播放

- ✅ 当前使用浏览器 API
- ✅ 检查浏览器支持
- ✅ 后续集成火山引擎

## 📚 文档索引

### 实现文档

- **IMPLEMENTATION-COMPLETE.md** - 实现完成报告
- **FINAL-IMPLEMENTATION-GUIDE.md** - 最终实现指南
- **NEW-FEATURES-GUIDE.md** - 新功能使用指南

### 测试文档

- **test-all-features.md** - 完整功能测试指南
- **ADMIN-CONFIG-TEST-GUIDE.md** - 配置测试指南

### 配置文档

- **VOLCENGINE-TTS-CONFIG.md** - 火山引擎配置
- **TTS-INTEGRATION-GUIDE.md** - TTS 集成指南

## 🎯 下一步

1. ⏳ 在学习页面集成火山引擎 TTS
2. ⏳ 实现音频缓存机制
3. ⏳ 添加批量操作功能
4. ⏳ 优化用户体验

## 📞 技术支持

如有问题，请参考：

1. **FINAL-IMPLEMENTATION-GUIDE.md** - 详细实现指南
2. **test-all-features.md** - 测试步骤
3. **常见问题** - 解决方案

---

**更新时间：** 2026-03-06

**状态：** ✅ 所有功能已完成并可测试
