# 导出缓存 500 错误修复指南

## 问题描述
前端点击"导出缓存"按钮时，持续返回 500 Internal Server Error。

## 诊断步骤

### 步骤1: 运行完整测试
```bash
test-export-complete.bat
```

这个脚本会测试：
1. 数据库查询是否正常
2. HTTP 请求是否能到达后端
3. 后端服务是否正在运行

### 步骤2: 根据测试结果采取行动

#### 情况A: 看到"无法连接到后端服务器"
**原因**: 后端服务未运行

**解决方案**:
```bash
cd my1\backend
npm start
```

等待看到 "服务器运行在端口 3000" 后再测试。

#### 情况B: 看到"500错误"
**原因**: 后端代码执行时出错

**解决方案**:
1. 查看后端控制台的错误日志（红色错误信息）
2. 确保后端已经完全重启：
   - 在后端控制台按 Ctrl+C 停止
   - 等待完全停止
   - 重新运行 `npm start`
   - 等待看到 "数据库同步完成" 和 "服务器运行在端口 3000"

3. 如果仍然有错误，可能是模型导入问题，运行：
```bash
cd my1\backend
node test-export-direct.js
```

#### 情况C: 看到"401错误"
**原因**: 认证失败（这实际上说明路由工作正常）

**解决方案**:
1. 在前端重新登录管理员账号
2. 确保使用管理员账号（admin / admin123）
3. 清除浏览器缓存和 Cookie
4. 重新登录后再测试

#### 情况D: 数据库查询成功，但HTTP请求失败
**原因**: 路由注册或中间件问题

**解决方案**:
1. 检查 `my1/backend/src/index.js` 中是否有这一行：
   ```javascript
   app.use('/api/audio-cache', audioCacheRoutes);
   ```

2. 检查导入语句：
   ```javascript
   import audioCacheRoutes from './routes/audioCache.js';
   ```

3. 完全重启后端服务

## 最可能的原因

根据之前的对话历史，**最可能的原因是后端没有真正重启**。

### 正确的重启步骤：

1. **停止后端**:
   - 找到运行后端的命令行窗口
   - 按 `Ctrl+C`
   - 等待进程完全停止（看到命令提示符）

2. **启动后端**:
   ```bash
   cd my1\backend
   npm start
   ```

3. **等待启动完成**:
   - 看到 "数据库连接成功"
   - 看到 "数据库同步完成"
   - 看到 "服务器运行在端口 3000"

4. **测试**:
   - 在浏览器中访问: http://localhost:3000/health
   - 应该看到: `{"status":"ok","timestamp":"..."}`

## 验证修复

修复后，按以下步骤验证：

1. 确保后端正在运行
2. 在浏览器中登录管理员账号
3. 进入"缓存管理"页面
4. 点击"导出缓存"按钮
5. 应该自动下载一个 JSON 文件

## 代码检查清单

如果上述步骤都无效，检查以下代码：

### ✓ 后端路由 (`my1/backend/src/routes/audioCache.js`)
```javascript
router.get('/export', async (req, res) => {
  try {
    const caches = await AudioCache.findAll({
      attributes: ['text', 'provider', 'voiceType', 'cacheKey', 'filePath', 'fileSize'],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: caches.length,
      data: caches
    });
  } catch (error) {
    logger.error('导出缓存失败:', error);
    res.status(500).json({
      success: false,
      message: '导出缓存失败'
    });
  }
});
```

### ✓ 模型导出 (`my1/backend/src/models/index.js`)
```javascript
export { sequelize, User, Category, Lesson, Word, Config, AudioCache };
```

### ✓ 路由注册 (`my1/backend/src/index.js`)
```javascript
import audioCacheRoutes from './routes/audioCache.js';
// ...
app.use('/api/audio-cache', audioCacheRoutes);
```

### ✓ 前端服务 (`my1/frontend/src/services/audioCache.js`)
```javascript
async exportCaches() {
  return await api.get('/audio-cache/export');
}
```

## 紧急修复脚本

如果需要强制重启后端：

```bash
# 查找占用端口3000的进程
netstat -ano | findstr :3000

# 记下PID（最后一列的数字）
# 然后杀死进程（替换 <PID> 为实际的进程ID）
taskkill /F /PID <PID>

# 重新启动后端
cd my1\backend
npm start
```

## 联系支持

如果以上所有步骤都无法解决问题，请提供：
1. 后端控制台的完整错误日志
2. `test-export-complete.bat` 的输出结果
3. 浏览器控制台的完整错误信息
