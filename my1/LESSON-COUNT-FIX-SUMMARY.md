# 课程数量显示修复总结

## 问题描述

前端学习分类页面显示所有分类的课程数量都是 0。

## 根本原因

数据库表结构错误：`lessons` 表的 `category_id` 和 `lesson_number` 字段被错误地设置为 `UNIQUE` 约束。

### 错误的表结构
```sql
CREATE TABLE `lessons` (
  `id` INTEGER PRIMARY KEY, 
  `category_id` INTEGER NOT NULL UNIQUE,  -- ❌ 错误：不应该是 UNIQUE
  `lesson_number` INTEGER NOT NULL UNIQUE, -- ❌ 错误：不应该是 UNIQUE
  ...
)
```

这导致：
1. 每个分类只能有一个课程（因为 `category_id` 是 UNIQUE）
2. 整个系统只能有一个课程编号为 1 的课程（因为 `lesson_number` 是 UNIQUE）
3. 导入数据时出现 `SQLITE_CONSTRAINT: UNIQUE constraint failed` 错误

## 解决方案

### 1. 修复表结构

创建并运行 `fix-lessons-table.js` 脚本：
- 备份现有数据
- 删除旧的 `lessons` 和 `words` 表
- 使用正确的模型定义重新创建表
- 恢复备份的数据

### 2. 正确的表结构

```sql
CREATE TABLE `lessons` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT, 
  `category_id` INTEGER NOT NULL,  -- ✓ 正确：允许多个课程属于同一分类
  `lesson_number` INTEGER NOT NULL, -- ✓ 正确：允许多个分类有相同的课程编号
  `created_at` DATETIME NOT NULL, 
  `updated_at` DATETIME NOT NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
)
```

### 3. 复合唯一索引

正确的约束应该是：同一个分类下的课程编号不能重复
```sql
CREATE UNIQUE INDEX `lessons_category_id_lesson_number` 
ON `lessons` (`category_id`, `lesson_number`)
```

## 修复步骤

```bash
# 1. 进入后端目录
cd my1/backend

# 2. 运行修复脚本
node fix-lessons-table.js

# 3. 导入示例数据
.\import-sample-data.bat

# 4. 验证数据
node check-data.js
```

## 修复结果

### 修复前
```
分类数量: 8
所有分类的课程数量: 0
```

### 修复后
```
分类数量: 8

分类: Programming Basics
  课程数量: 3
    课程 1: 10 个单词
    课程 2: 10 个单词
    课程 3: 10 个单词

分类: Web Development
  课程数量: 2
    课程 1: 5 个单词
    课程 2: 5 个单词
```

## 相关文件

- `my1/backend/fix-lessons-table.js` - 表结构修复脚本
- `my1/backend/src/models/Lesson.js` - Lesson 模型定义（正确）
- `my1/backend/import-sample-data.bat` - 示例数据导入脚本
- `my1/backend/check-data.js` - 数据验证脚本
- `my1/backend/test-import-debug.js` - 导入调试脚本
- `my1/backend/check-table-structure.js` - 表结构检查脚本
- `my1/backend/check-autoindex.js` - 自动索引检查脚本

## 技术细节

### Sequelize 模型定义

正确的 Lesson 模型定义（已存在于代码中）：

```javascript
const Lesson = sequelize.define('Lesson', {
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  lessonNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'lesson_number'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['category_id', 'lesson_number']  // 复合唯一索引
    }
  ]
});
```

### 为什么会出现这个问题？

可能的原因：
1. 数据库迁移过程中的错误
2. 早期版本的模型定义有误
3. 手动修改数据库结构时的失误

### 预防措施

1. 使用 Sequelize 的 `sync()` 方法时要小心，建议使用迁移工具
2. 定期检查数据库表结构是否与模型定义一致
3. 在生产环境中使用数据库迁移工具（如 Sequelize CLI）而不是 `sync()`

## 测试验证

### 1. 前端测试
访问 http://localhost:5173/categories，应该看到：
- Programming Basics: 3 个课程
- Web Development: 2 个课程

### 2. API 测试
```bash
# 获取所有分类
curl http://localhost:3000/api/learning/categories \
  -H "Authorization: Bearer <token>"

# 获取 Programming Basics 的课程
curl http://localhost:3000/api/learning/categories/5/lessons \
  -H "Authorization: Bearer <token>"
```

## 状态

✅ 已修复
✅ 数据已导入
✅ 前端应该能正确显示课程数量

---

修复时间: 2026-03-07
修复人员: Kiro AI Assistant
