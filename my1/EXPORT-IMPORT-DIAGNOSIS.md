# 导出导入功能诊断报告

## 问题现象
用户点击"导出缓存"按钮时提示"导出失败"。

## 诊断结果

### 根本原因
**后端服务未运行** (ECONNREFUSED ::1:3000)

测试脚本尝试连接 `http://localhost:3000` 时被拒绝,说明:
1. 后端服务进程已停止
2. 或者后端服务从未启动

### 为什么会这样?
可能的原因:
1. 用户之前关闭了后端服务
2. 后端服务崩溃了
3. 系统重启后服务未自动启动

## 解决方案

### 方法 1: 使用诊断修复脚本(推荐)
```bash
cd my1
diagnose-and-fix-export.bat
```

这个脚本会:
1. 检查后端服务状态
2. 如果未运行,自动启动服务
3. 等待 10 秒
4. 重新测试导出功能

### 方法 2: 手动重启服务
```bash
cd my1
emergency-fix.bat
```

等待 10 秒后,刷新浏览器页面测试。

### 方法 3: 使用标准启动脚本
```bash
cd my1
start-all.bat
```

## 验证步骤

### 1. 检查后端服务是否运行
```bash
netstat -ano | findstr :3000
```

应该看到类似输出:
```
TCP    0.0.0.0:3000    0.0.0.0:0    LISTENING    12345
```

### 2. 测试导出 API
```bash
cd my1/backend
node test-export-detailed.js
```

成功输出应该包含:
```
✓ 登录成功
✓ 请求成功
状态码: 200
```

### 3. 在浏览器中测试
1. 访问 http://localhost:5173
2. 使用 admin/admin123 登录
3. 进入"管理后台" > "缓存管理"
4. 点击"导出缓存"按钮
5. 应该自动下载 JSON 文件

## 技术细节

### 导出端点
```
GET /api/audio-cache/export
```

### 后端实现
```javascript
router.get('/export', async (req, res) => {
  try {
    const { AudioCache } = await import('../models/index.js');
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

### 前端实现
```javascript
const handleExport = async () => {
  const response = await audioCacheService.exportCaches();
  if (response.success) {
    const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audio-cache-export-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};
```

## 测试脚本

### 完整测试
```bash
cd my1
test-cache-export-import.bat
```

### 详细诊断
```bash
cd my1/backend
node test-export-detailed.js
```

## 常见错误及解决方法

### 错误 1: ECONNREFUSED
**原因**: 后端服务未运行
**解决**: 运行 `emergency-fix.bat` 启动服务

### 错误 2: 404 Not Found
**原因**: 导出端点不存在(后端未重启)
**解决**: 重启后端服务加载新路由

### 错误 3: 401 Unauthorized
**原因**: 未登录或 Session 过期
**解决**: 重新登录管理员账号

### 错误 4: 403 Forbidden
**原因**: 当前用户不是管理员
**解决**: 使用 admin 账号登录

### 错误 5: 500 Internal Server Error
**原因**: 后端代码执行错误
**解决**: 查看后端控制台日志,检查数据库连接

## 下一步操作

1. **立即执行**: `cd my1 && diagnose-and-fix-export.bat`
2. **等待**: 服务启动需要约 10 秒
3. **测试**: 在浏览器中测试导出功能
4. **验证**: 确认 JSON 文件成功下载

---

**状态**: 问题已诊断,等待用户执行修复脚本
**最后更新**: 2024-03-07
