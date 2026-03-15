# 手动部署导出功能指南

## 概述
由于网络限制，需要手动在服务器上部署导出功能。

## 需要修改的文件

### 1. 后端服务文件
文件: `/root/my1-english-learning/backend/src/services/AdminService.js`

在文件末尾、`export default new AdminService();` 之前添加以下代码:

```javascript
  // ==================== 导出功能 ====================

  /**
   * 导出所有课程数据（JSON格式）
   * @returns {Promise<Object>} 导出的数据
   */
  async exportAllData() {
    try {
      // 获取所有分类
      const categories = await Category.findAll({
        order: [['id', 'ASC']],
        include: [{
          model: Lesson,
          as: 'lessons',
          order: [['lessonNumber', 'ASC']],
          include: [{
            model: Word,
            as: 'words',
            order: [['id', 'ASC']]
          }]
        }]
      });

      // 转换为导出格式
      const exportData = categories.map(category => ({
        name: category.name,
        lessons: category.lessons.map(lesson => ({
          lesson: lesson.lessonNumber,
          words: lesson.words.map(word => ({
            question: word.id, // 使用word ID作为question
            english: word.english,
            chinese: word.chinese
          }))
        }))
      }));

      // 统计信息
      const stats = {
        categories: categories.length,
        lessons: categories.reduce((sum, cat) => sum + cat.lessons.length, 0),
        words: categories.reduce((sum, cat) =>
          sum + cat.lessons.reduce((s, l) => s + l.words.length, 0), 0)
      };

      logger.info(`导出数据: ${stats.categories} 分类, ${stats.lessons} 课程, ${stats.words} 单词`);

      return {
        data: exportData,
        stats
      };
    } catch (error) {
      logger.error('导出数据失败:', error);
      throw error;
    }
  }

  /**
   * 导出指定分类的数据
   * @param {number} categoryId - 分类ID
   * @returns {Promise<Object>} 导出的数据
   */
  async exportCategoryData(categoryId) {
    try {
      const category = await Category.findByPk(categoryId, {
        include: [{
          model: Lesson,
          as: 'lessons',
          order: [['lessonNumber', 'ASC']],
          include: [{
            model: Word,
            as: 'words',
            order: [['id', 'ASC']]
          }]
        }]
      });

      if (!category) {
        throw new Error('分类不存在');
      }

      // 转换为导出格式
      const exportData = {
        name: category.name,
        lessons: category.lessons.map(lesson => ({
          lesson: lesson.lessonNumber,
          words: lesson.words.map(word => ({
            question: word.id,
            english: word.english,
            chinese: word.chinese
          }))
        }))
      };

      const stats = {
        categoryName: category.name,
        lessons: category.lessons.length,
        words: category.lessons.reduce((sum, l) => sum + l.words.length, 0)
      };

      logger.info(`导出分类 ${categoryId}: ${stats.lessons} 课程, ${stats.words} 单词`);

      return {
        data: exportData,
        stats
      };
    } catch (error) {
      logger.error(`导出分类 ${categoryId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 导出指定课程的数据
   * @param {number} lessonId - 课程ID
   * @returns {Promise<Object>} 导出的数据
   */
  async exportLessonData(lessonId) {
    try {
      const lesson = await Lesson.findByPk(lessonId, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: Word,
            as: 'words',
            order: [['id', 'ASC']]
          }
        ]
      });

      if (!lesson) {
        throw new Error('课程不存在');
      }

      // 转换为导出格式（简化版本）
      const exportData = lesson.words.map(word => ({
        lesson: lesson.lessonNumber,
        question: word.id,
        english: word.english,
        chinese: word.chinese
      }));

      const stats = {
        categoryName: lesson.category.name,
        lessonNumber: lesson.lessonNumber,
        words: lesson.words.length
      };

      logger.info(`导出课程 ${lessonId}: ${stats.words} 单词`);

      return {
        data: exportData,
        stats
      };
    } catch (error) {
      logger.error(`导出课程 ${lessonId} 失败:`, error);
      throw error;
    }
  }
```

### 2. 后端路由文件
文件: `/root/my1-english-learning/backend/src/routes/admin.js`

在文件末尾、`export default router;` 之前添加以下代码:

```javascript
// ==================== 导出接口 ====================

/**
 * GET /api/admin/export/all
 * 导出所有课程数据
 */
router.get('/export/all', async (req, res) => {
  try {
    const result = await AdminService.exportAllData();

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('导出所有数据失败:', error);

    res.status(500).json({
      success: false,
      message: '导出数据失败',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/export/category/:categoryId
 * 导出指定分类的数据
 */
router.get('/export/category/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: '无效的分类 ID'
      });
    }

    const result = await AdminService.exportCategoryData(categoryId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('导出分类数据失败:', error);

    if (error.message === '分类不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '导出分类数据失败',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/export/lesson/:lessonId
 * 导出指定课程的数据
 */
router.get('/export/lesson/:lessonId', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);

    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程 ID'
      });
    }

    const result = await AdminService.exportLessonData(lessonId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('导出课程数据失败:', error);

    if (error.message === '课程不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '导出课程数据失败',
      error: error.message
    });
  }
});
```

### 3. 前端部署
前端代码已经构建完成，需要将 `frontend/dist` 目录的内容复制到服务器的 `/root/my1-english-learning/public` 目录。

## 部署步骤

### 方法1: 使用SSH手动部署（推荐）

```bash
# 1. 连接到服务器
ssh root@47.97.185.117

# 2. 备份现有代码
cd /root/my1-english-learning
mkdir -p backup-$(date +%Y%m%d)
cp -r public backup-$(date +%Y%m%d)/
cp -r backend/src backup-$(date +%Y%m%d)/

# 3. 编辑后端服务文件
nano backend/src/services/AdminService.js
# 或使用 vim
vi backend/src/services/AdminService.js
# 在文件末尾、export default new AdminService(); 之前添加导出功能代码

# 4. 编辑后端路由文件
nano backend/src/routes/admin.js
# 或使用 vim
vi backend/src/routes/admin.js
# 在文件末尾、export default router; 之前添加导出路由代码

# 5. 重启后端服务
cd backend
pm2 restart my1-backend

# 6. 验证服务状态
pm2 logs my1-backend --lines 20

# 7. 测试导出API（可选）
curl -X GET http://47.97.185.117/api/admin/export/all \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

### 方法2: 使用SCP上传文件（如果本地已构建）

```bash
# 1. 上传前端
cd e:\demo\my1\my1\frontend\dist
scp -r . root@47.97.185.117:/root/my1-english-learning/public/

# 2. 上传后端文件（需要先在本地准备好）
scp e:\demo\my1\my1\backend\src\services\AdminService.js root@47.97.185.117:/root/my1-english-learning/backend/src/services/
scp e:\demo\my1\my1\backend\src\routes\admin.js root@47.97.185.117:/root/my1-english-learning/backend/src/routes/

# 3. 重启服务
ssh root@47.97.185.117 "cd /root/my1-english-learning/backend && pm2 restart my1-backend"
```

## 验证部署

### 1. 检查API是否可用
使用浏览器访问:
- http://47.97.185.117/api/admin/export/all (需要先登录)
- http://47.97.185.117/admin (登录后在内容管理页面查看"一键导出课程"按钮)

### 2. 测试导出功能
1. 访问 http://47.97.185.117/admin
2. 登录（admin / admin123）
3. 进入"内容管理"
4. 点击"一键导出课程"按钮
5. 检查是否自动下载JSON文件

## 故障排除

### 如果重启服务失败
```bash
# 检查PM2状态
pm2 list

# 查看日志
pm2 logs my1-backend --lines 50

# 如果进程不存在，重新启动
pm2 start index.js --name my1-backend
pm2 save
```

### 如果前端没有更新
确保已清空浏览器缓存（Ctrl + F5）

### 如果导入功能有问题
检查后端日志中的错误信息:
```bash
pm2 logs my1-backend --lines 100
```

## 导出功能说明

### 支持的导出接口
- `GET /api/admin/export/all` - 导出所有课程数据
- `GET /api/admin/export/category/:categoryId` - 导出指定分类数据
- `GET /api/admin/export/lesson/:lessonId` - 导出指定课程数据

### 导出数据格式
```json
{
  "success": true,
  "data": [
    {
      "name": "分类名称",
      "lessons": [
        {
          "lesson": 1,
          "words": [
            {
              "question": 1,
              "english": "hello",
              "chinese": "你好"
            }
          ]
        }
      ]
    }
  ],
  "stats": {
    "categories": 1,
    "lessons": 1,
    "words": 1
  }
}
```

## 完成

部署完成后，您就可以使用一键导出功能了！
