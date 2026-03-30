# 验证文件上传功能

## 快速验证步骤

### 1. 确认后端运行正常

后端应该已经在运行，检查是否有以下输出：
```
✅ Session 存储: Memory (开发环境)
info: 数据库连接成功
info: 服务器运行在端口 3000
info: 环境: development
info: 数据库: sqlite
info: ✅ 定时任务已启动
```

如果后端没有运行，执行：
```bash
cd my1/backend
npm start
```

### 2. 确认前端运行正常

前端应该运行在 http://localhost:5173

如果前端没有运行，执行：
```bash
cd my1/frontend
npm run dev
```

### 3. 测试文件上传功能

#### 方式一：使用前端界面测试

1. 打开浏览器访问 http://localhost:5173
2. 使用管理员账号登录（参考 ADMIN-ACCOUNT-INFO.md）
3. 进入"内容管理"页面
4. 点击"一键导入课程"按钮
5. 选择"上传 JSON 文件"
6. 点击"选择文件"，选择 `test-upload-data.json`
7. 输入分类名称：`测试分类`
8. 点击"开始导入"
9. 应该看到成功提示：`导入成功！分类：测试分类，课程：2 个，单词：5 个（按课时分组）`

#### 方式二：使用文本粘贴测试

1. 打开浏览器访问 http://localhost:5173
2. 使用管理员账号登录
3. 进入"内容管理"页面
4. 点击"一键导入课程"按钮
5. 选择"粘贴 JSON 数据"
6. 复制以下内容粘贴到文本框：
```json
[
  {"lesson": 1, "question": 1, "english": "Hello", "chinese": "你好"},
  {"lesson": 1, "question": 2, "english": "Goodbye", "chinese": "再见"},
  {"lesson": 2, "question": 1, "english": "Thank you", "chinese": "谢谢"}
]
```
7. 输入分类名称：`测试分类2`
8. 点击"开始导入"
9. 应该看到成功提示

### 4. 验证导入结果

1. 在"内容管理"页面，点击刚创建的分类
2. 应该看到对应的课程列表
3. 点击课程，应该看到对应的单词列表
4. 验证中文是否正确显示（没有乱码）

## 常见问题

### 问题 1：中文显示乱码

**原因**：文件编码不是 UTF-8

**解决方案**：
1. 使用文本编辑器（如 VS Code、Notepad++）打开文件
2. 选择"另存为"
3. 编码选择 "UTF-8"（不是 UTF-8 with BOM）
4. 保存后重新上传

### 问题 2：提示 "request entity too large"

**原因**：文件太大

**解决方案**：
- 当前已支持最大 50MB 的文件
- 如果文件超过 50MB，请分批导入

### 问题 3：提示 "JSON 格式错误"

**原因**：JSON 格式不正确

**解决方案**：
1. 使用 JSON 验证工具检查格式（如 jsonlint.com）
2. 确保所有字段都有引号
3. 确保数组和对象的括号匹配
4. 确保没有多余的逗号

### 问题 4：提示 500 错误

**原因**：后端服务异常

**解决方案**：
1. 检查后端是否正常运行
2. 查看后端控制台的错误日志
3. 重启后端服务

## 测试数据文件

项目中已包含测试数据文件：`my1/test-upload-data.json`

内容示例：
```json
[
  {"lesson": 1, "question": 1, "english": "Excuse me!", "chinese": "打扰一下！"},
  {"lesson": 1, "question": 2, "english": "Yes?", "chinese": "什么事？"},
  {"lesson": 1, "question": 3, "english": "Is this your handbag?", "chinese": "这是你的手提包吗？"},
  {"lesson": 2, "question": 1, "english": "Good morning.", "chinese": "早上好。"},
  {"lesson": 2, "question": 2, "english": "Hi, Helen.", "chinese": "嗨，海伦。"}
]
```

## 成功标志

✅ 文件上传成功
✅ 中文正确显示（无乱码）
✅ 数据正确导入到数据库
✅ 可以在内容管理页面查看导入的数据
✅ 课程按 lesson 字段正确分组

## 下一步

如果所有测试都通过，文件上传功能已经完全正常工作！

您可以：
1. 导入真实的课程数据
2. 测试其他管理功能
3. 继续开发其他功能
