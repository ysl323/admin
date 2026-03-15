# 导出功能部署状态

## 当前状态

### ✅ 已完成的工作

1. **前端代码** - 已构建完成
   - 文件位置: `e:\demo\my1\my1\frontend\dist`
   - 包含"一键导出课程"按钮
   - 已添加导出功能到 `ContentManagement.vue`

2. **后端代码** - 已更新完成
   - `AdminService.js` - 已添加3个导出方法
     - `exportAllData()` - 导出所有数据
     - `exportCategoryData()` - 导出分类数据
     - `exportLessonData()` - 导出课程数据
   - `admin.js` - 已添加3个导出路由
     - `GET /api/admin/export/all`
     - `GET /api/admin/export/category/:categoryId`
     - `GET /api/admin/export/lesson/:lessonId`

3. **测试验证**
   - 服务器运行正常: http://47.97.185.117
   - 登录功能正常
   - 导出API返回404（说明后端代码未部署）

### ⚠️ 需要完成的部署步骤

由于网络限制无法自动部署，需要手动在服务器上执行以下操作：

## 方法1: 最简单的部署方式（推荐）

在您的本地电脑上打开一个SSH终端（如PuTTY、MobaXterm或Windows Terminal），然后执行以下命令：

### 步骤1: 连接到服务器
```bash
ssh root@47.97.185.117
```

### 步骤2: 备份现有代码
```bash
cd /root/my1-english-learning
mkdir -p backup-$(date +%Y%m%d)
cp -r backend/src/services/AdminService.js backup-$(date +%Y%m%d)/
cp -r backend/src/routes/admin.js backup-$(date +%Y%m%d)/
```

### 步骤3: 下载并执行更新脚本
```bash
# 下载更新脚本（从本地上传）
# 或者使用 wget 从服务器上下载（如果脚本已上传到服务器）

# 方法A: 如果您在本地上传了脚本
cd /root/my1-english-learning
bash server-side-update.sh

# 方法B: 如果脚本未上传，手动执行以下命令
# 见方法2
```

### 步骤4: 验证部署
```bash
# 检查PM2状态
pm2 list

# 查看日志
pm2 logs my1-backend --lines 20

# 测试API（需要先登录获取session）
curl -X GET http://47.97.185.117/api/admin/export/all
```

## 方法2: 手动编辑文件（如果脚本无法执行）

### 步骤1: 编辑 AdminService.js
```bash
cd /root/my1-english-learning
nano backend/src/services/AdminService.js
```

滚动到文件末尾，在 `export default new AdminService();` 之前添加以下代码：

```javascript
  // ==================== 导出功能 ====================

  async exportAllData() {
    try {
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

      const exportData = categories.map(category => ({
        name: category.name,
        lessons: category.lessons.map(lesson => ({
          lesson: lesson.lessonNumber,
          words: lesson.words.map(word => ({
            question: word.id,
            english: word.english,
            chinese: word.chinese
          }))
        }))
      }));

      const stats = {
        categories: categories.length,
        lessons: categories.reduce((sum, cat) => sum + cat.lessons.length, 0),
        words: categories.reduce((sum, cat) =>
          sum + cat.lessons.reduce((s, l) => s + l.words.length, 0), 0)
      };

      logger.info(`导出数据: ${stats.categories} 分类, ${stats.lessons} 课程, ${stats.words} 单词`);

      return { data: exportData, stats };
    } catch (error) {
      logger.error('导出数据失败:', error);
      throw error;
    }
  }

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

      return { data: exportData, stats };
    } catch (error) {
      logger.error(`导出分类 ${categoryId} 失败:`, error);
      throw error;
    }
  }

  async exportLessonData(lessonId) {
    try {
      const lesson = await Lesson.findByPk(lessonId, {
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] },
          { model: Word, as: 'words', order: [['id', 'ASC']] }
        ]
      });

      if (!lesson) {
        throw new Error('课程不存在');
      }

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

      return { data: exportData, stats };
    } catch (error) {
      logger.error(`导出课程 ${lessonId} 失败:`, error);
      throw error;
    }
  }
```

保存并退出（Ctrl+X，然后 Y，然后 Enter）

### 步骤2: 编辑 admin.js
```bash
nano backend/src/routes/admin.js
```

滚动到文件末尾，在 `export default router;` 之前添加以下代码：

```javascript
// ==================== 导出接口 ====================

router.get('/export/all', async (req, res) => {
  try {
    const result = await AdminService.exportAllData();
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('导出所有数据失败:', error);
    res.status(500).json({
      success: false,
      message: '导出数据失败',
      error: error.message
    });
  }
});

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
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('导出分类数据失败:', error);
    if (error.message === '分类不存在') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: '导出分类数据失败',
      error: error.message
    });
  }
});

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
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('导出课程数据失败:', error);
    if (error.message === '课程不存在') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: '导出课程数据失败',
      error: error.message
    });
  }
});
```

保存并退出（Ctrl+X，然后 Y，然后 Enter）

### 步骤3: 重启服务
```bash
cd backend
pm2 restart my1-backend
```

### 步骤4: 验证
```bash
pm2 logs my1-backend --lines 20
```

## 验证部署成功

### 1. 检查API
在浏览器中访问: http://47.97.185.117/api/admin/export/all
（应该返回JSON数据而不是404）

### 2. 测试前端导出功能
1. 访问: http://47.97.185.117/admin
2. 登录: admin / admin123
3. 点击"内容管理"
4. 点击"一键导出课程"按钮
5. 应该自动下载一个JSON文件

## 故障排除

### 如果重启失败
```bash
pm2 list
pm2 logs my1-backend --lines 50
pm2 restart my1-backend
```

### 如果前端没有更新
按 Ctrl + F5 强制刷新浏览器

### 如果导入功能有问题
```bash
pm2 logs my1-backend --lines 100
```

## 完成后

部署完成后，您就可以使用以下功能：

✅ 一键导出所有课程
✅ 导出指定分类
✅ 导出指定课程
✅ 导入功能（已存在，无需修改）

导出的数据格式为JSON，可以直接用于导入或备份。
