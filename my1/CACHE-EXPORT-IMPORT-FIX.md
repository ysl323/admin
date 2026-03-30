# 缓存导出导入功能修复指南

## 问题描述
用户点击"导出缓存"按钮时提示导出失败。

## 根本原因
**后端服务未重启**，新添加的导出/导入 API 端点未加载。

## 解决方案

### 1. 重启后端服务（必须执行）

```bash
cd my1
emergency-fix.bat
```

等待 10 秒，确保服务完全启动。

### 2. 验证功能

#### 步骤 1：登录管理员账号
- 访问：http://localhost:5173
- 账号：admin
- 密码：admin123

#### 步骤 2：进入缓存管理页面
- 点击顶部导航栏的"管理后台"
- 点击左侧菜单的"缓存管理"

#### 步骤 3：测试导出功能
- 点击"导出缓存"按钮
- 应该自动下载一个 JSON 文件（格式：`audio-cache-export-{timestamp}.json`）
- 文件包含所有缓存记录的元数据（不包含音频文件本身）

#### 步骤 4：测试导入功能
- 点击"导入缓存"按钮
- 选择之前导出的 JSON 文件
- 系统会自动导入记录（跳过已存在的记录）
- 显示成功导入的记录数量

## 技术实现

### 后端 API

#### 导出端点
```
GET /api/audio-cache/export
```

返回格式：
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "text": "Hello World",
      "provider": "volcengine",
      "voiceType": "zh_female_tianmeixiaoyuan_moon_bigtts",
      "cacheKey": "abc123...",
      "filePath": "audio_cache/abc123.mp3",
      "fileSize": 12345
    }
  ]
}
```

#### 导入端点
```
POST /api/audio-cache/import
Content-Type: application/json

[
  {
    "text": "Hello World",
    "provider": "volcengine",
    "voiceType": "zh_female_tianmeixiaoyuan_moon_bigtts",
    "cacheKey": "abc123...",
    "filePath": "audio_cache/abc123.mp3",
    "fileSize": 12345
  }
]
```

返回格式：
```json
{
  "success": true,
  "message": "成功导入 5 条缓存记录",
  "imported": 5
}
```

### 前端实现

#### 导出逻辑
```javascript
const handleExport = async () => {
  const response = await audioCacheService.exportCaches();
  if (response.success) {
    // 创建 Blob 并下载
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

#### 导入逻辑
```javascript
const handleImport = () => {
  fileInputRef.value?.click(); // 触发文件选择
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  const text = await file.text();
  const data = JSON.parse(text);
  
  const response = await audioCacheService.importCaches(data);
  if (response.success) {
    ElMessage.success(`成功导入 ${response.imported} 条缓存记录`);
    loadData();
    loadStatistics();
  }
};
```

## 注意事项

1. **导出的是元数据**：导出的 JSON 文件只包含缓存记录的元数据（文本、提供商、文件路径等），不包含实际的音频文件。

2. **导入时跳过重复**：导入时会检查 `cacheKey`，如果已存在则跳过，避免重复。

3. **需要管理员权限**：导出和导入功能都需要管理员权限，必须先登录 admin 账号。

4. **Session 认证**：使用 Session 认证（Cookie: `connect.sid`），不是 Bearer Token。

## 故障排查

### 问题 1：导出失败，提示 404
**原因**：后端服务未重启，新的 API 端点未加载。
**解决**：执行 `cd my1 && emergency-fix.bat` 重启服务。

### 问题 2：导出失败，提示 401
**原因**：未登录或 Session 过期。
**解决**：重新登录管理员账号（admin/admin123）。

### 问题 3：导出失败，提示 403
**原因**：当前用户不是管理员。
**解决**：使用 admin 账号登录。

### 问题 4：导入失败，提示格式错误
**原因**：JSON 文件格式不正确。
**解决**：确保使用系统导出的 JSON 文件，或手动检查格式是否符合要求。

### 问题 5：导入成功但记录数为 0
**原因**：所有记录的 `cacheKey` 都已存在。
**解决**：这是正常行为，系统会跳过已存在的记录。

## 文件清单

### 后端文件
- `my1/backend/src/routes/audioCache.js` - 添加了导出/导入路由

### 前端文件
- `my1/frontend/src/views/admin/CacheManagement.vue` - 添加了导出/导入按钮和逻辑
- `my1/frontend/src/services/audioCache.js` - 添加了导出/导入服务方法

### 测试脚本
- `my1/test-export-cache.bat` - 导出功能测试指南
- `my1/backend/test-export-api.js` - API 端点测试脚本

## 下一步

1. 执行 `cd my1 && emergency-fix.bat` 重启服务
2. 等待 10 秒
3. 刷新浏览器页面（Ctrl+F5 强制刷新）
4. 测试导出和导入功能

---

**最后更新**：2024-03-07
**状态**：等待用户重启服务并测试
