# 文件上传功能修复总结

## 问题诊断

用户在使用文件上传功能时遇到 500 错误：
```
POST http://localhost:5173/api/admin/import-simple-lesson 500 (Internal Server Error)
```

## 根本原因

在 `my1/backend/src/routes/admin.js` 文件中，`SimpleLessonImportService` 被导入了两次：
- 第 7 行：`import SimpleLessonImportService from '../services/SimpleLessonImportService.js';`
- 第 887 行：`import SimpleLessonImportService from '../services/SimpleLessonImportService.js';` (重复)

这导致 Node.js 抛出语法错误：
```
SyntaxError: Identifier 'SimpleLessonImportService' has already been declared
```

## 修复方案

删除了第 887 行的重复导入语句，只保留文件顶部的导入。

## 修复后的文件

- `my1/backend/src/routes/admin.js` - 已移除重复的导入语句

## 后端状态

✅ 后端已成功重启并运行在端口 3000
✅ 数据库连接正常
✅ 所有路由已正确加载

## 功能说明

### 文件上传功能

前端支持两种导入方式：

1. **文本粘贴**：直接粘贴 JSON 数据
2. **文件上传**：上传 .json 或 .txt 文件（UTF-8 编码）

### 数据格式

```json
[
  {
    "lesson": 1,
    "question": 1,
    "english": "Excuse me!",
    "chinese": "打扰一下！"
  }
]
```

**必填字段：**
- `question`：序号
- `english`：英文
- `chinese`：中文

**可选字段：**
- `lesson`：课时号（有则按课时分组，无则全部内容在一起）

### 文件编码注意事项

如果上传文件后中文显示乱码，请确保：
1. 文件保存为 UTF-8 编码格式
2. 在文本编辑器中选择"另存为" → 编码选择 "UTF-8"
3. 推荐使用 VS Code、Notepad++ 等支持 UTF-8 的编辑器

## 测试步骤

1. 确保后端运行在 http://localhost:3000
2. 确保前端运行在 http://localhost:5173
3. 登录管理员账号
4. 进入"内容管理"页面
5. 点击"一键导入课程"按钮
6. 选择导入方式（文本粘贴或文件上传）
7. 输入分类名称
8. 提供 JSON 数据或上传文件
9. 点击"开始导入"

## 后续建议

1. 测试文件上传功能是否正常工作
2. 测试中文编码是否正确显示
3. 测试大文件上传（已支持最大 50MB）
4. 验证导入后的数据是否正确保存到数据库

## 相关文件

- `my1/backend/src/routes/admin.js` - 后端路由（已修复）
- `my1/backend/src/services/SimpleLessonImportService.js` - 导入服务
- `my1/backend/src/index.js` - 服务器配置（已增加 50MB 限制）
- `my1/frontend/src/views/admin/ContentManagement.vue` - 前端组件（已添加文件上传）
- `my1/test-upload-data.json` - 测试数据文件
