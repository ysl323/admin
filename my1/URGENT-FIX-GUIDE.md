# 紧急修复指南

## 🚨 当前问题

根据用户反馈，有两个严重问题：

1. **TTS API 404错误** - POST `/api/tts/speak` 返回404
2. **返回按钮导致空页面** - categoryId为NaN

---

## ✅ 已完成的修复

### 1. 前端数据读取修复
- **文件**: `frontend/src/views/LearningPage.vue`
- **问题**: 前端期望 `response.categoryId`，但后端返回 `response.lesson.categoryId`
- **修复**: 添加兼容性读取，支持两种数据结构
- **状态**: ✅ 已修复

### 2. 后端POST路由添加
- **文件**: `backend/src/routes/tts.js`
- **问题**: 只有GET `/speak`，没有POST `/speak`
- **修复**: 添加了POST路由
- **状态**: ✅ 已修复（需要重启后端）

---

## 🔧 立即执行的步骤

### 步骤1：重启后端服务（必须！）

**重要**: 后端代码已修改，但需要重启才能生效！

```bash
# 方法1：使用stop-all.bat和start-all.bat
cd my1
stop-all.bat
start-all.bat

# 方法2：手动重启
# 1. 找到运行后端的终端窗口
# 2. 按 Ctrl+C 停止
# 3. 运行: cd backend && npm start
```

### 步骤2：清除浏览器缓存

```bash
# 在浏览器中：
# 1. 按 F12 打开开发者工具
# 2. 右键点击刷新按钮
# 3. 选择"清空缓存并硬性重新加载"
```

### 步骤3：测试修复

```bash
# 运行测试脚本
cd my1/backend
node test-api-endpoints.js
```

---

## 🧪 验证步骤

### 验证1：检查后端路由

1. 打开后端终端
2. 查看启动日志，应该看到：
   ```
   Server is running on port 3000
   ```

3. 测试POST /speak路由：
   ```bash
   # 在新终端运行
   curl -X POST http://localhost:3000/api/tts/speak \
     -H "Content-Type: application/json" \
     -d "{\"text\":\"test\"}"
   ```

   **预期结果**: 
   - 如果未登录：返回401错误（这是正常的）
   - 如果返回404：说明后端没有重启

### 验证2：检查前端功能

1. 打开浏览器：http://localhost:5173
2. 登录系统
3. 进入任意课程学习页面
4. 打开浏览器开发者工具（F12）
5. 切换到"网络"标签
6. 点击播放按钮

**预期结果**:
- ✅ 看到 POST `/api/tts/speak` 请求
- ✅ 状态码为 200（不是404）
- ✅ 听到声音

### 验证3：检查返回按钮

1. 在学习页面
2. 点击"返回课程"按钮
3. 查看浏览器控制台

**预期结果**:
- ✅ 没有 "NaN" 错误
- ✅ 正确返回到课程列表页面
- ✅ 课程列表正常显示

---

## 🐛 如果还有问题

### 问题A：TTS还是404

**可能原因**: 后端没有重启

**解决方案**:
1. 确认后端已完全停止
2. 重新启动后端
3. 查看后端日志确认启动成功
4. 清除浏览器缓存

### 问题B：返回按钮还是NaN

**可能原因**: 前端没有重新编译

**解决方案**:
1. Vite应该自动热更新
2. 如果没有，手动刷新浏览器（Ctrl+F5）
3. 查看浏览器控制台是否有错误

### 问题C：数据结构不匹配

**检查方法**:
```bash
# 测试API返回的数据结构
curl http://localhost:3000/api/learning/lessons/1/words
```

**预期返回**:
```json
{
  "success": true,
  "lesson": {
    "id": 1,
    "lessonNumber": 1,
    "categoryName": "...",
    "categoryId": 1
  },
  "words": [...]
}
```

---

## 📝 修复的文件清单

### 后端
1. ✅ `backend/src/routes/tts.js` - 添加POST /speak路由

### 前端
1. ✅ `frontend/src/views/LearningPage.vue` - 修复数据读取逻辑

### 测试工具
1. ✅ `backend/test-api-endpoints.js` - API端点测试脚本

---

## ⚡ 快速命令

```bash
# 1. 停止所有服务
cd my1
stop-all.bat

# 2. 启动所有服务
start-all.bat

# 3. 测试API
cd backend
node test-api-endpoints.js

# 4. 打开浏览器测试
# 访问 http://localhost:5173
```

---

## 📞 需要帮助？

如果问题仍然存在：

1. 检查后端日志（运行后端的终端窗口）
2. 检查浏览器控制台（F12）
3. 运行测试脚本查看详细错误
4. 提供错误日志和截图

---

## ✨ 预期结果

修复完成后：
- ✅ TTS播放正常，有声音
- ✅ 没有404错误
- ✅ 返回按钮正常工作
- ✅ 课程列表正常显示
- ✅ 所有导航功能正常

---

**最后更新**: 2026-03-07  
**状态**: 🔧 等待后端重启验证
