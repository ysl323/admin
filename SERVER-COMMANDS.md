# 服务器端更新命令 - 逐条执行

## 准备工作
```bash
# 连接到服务器
ssh root@47.97.185.117
```

## 执行以下命令（按顺序）

### 1. 备份现有代码
```bash
cd /root/my1-english-learning
mkdir -p backup-$(date +%Y%m%d)
cp backend/src/services/AdminService.js backup-$(date +%Y%m%d)/
cp backend/src/routes/admin.js backup-$(date +%Y%m%d)/
echo "Backup completed"
```

### 2. 更新 AdminService.js

创建临时文件并追加内容：

```bash
cd /root/my1-english-learning/backend/src/services

# 备份并准备更新
cp AdminService.js AdminService.js.old

# 在最后一行之前插入导出功能
head -n -1 AdminService.js > AdminService.js.tmp

# 追加导出函数
cat >> AdminService.js.tmp << 'EOF'

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

EOF

# 恢复最后一行
echo "}" >> AdminService.js.tmp
echo "" >> AdminService.js.tmp
echo "export default new AdminService();" >> AdminService.js.tmp

# 替换原文件
mv AdminService.js.tmp AdminService.js

echo "AdminService.js updated"
```

### 3. 更新 admin.js (路由)

```bash
cd /root/my1-english-learning/backend/src/routes

# 备份
cp admin.js admin.js.old

# 在最后一行之前插入导出路由
head -n -1 admin.js > admin.js.tmp

# 追加导出路由
cat >> admin.js.tmp << 'EOF'

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

EOF

# 恢复最后一行
echo "" >> admin.js.tmp
echo "export default router;" >> admin.js.tmp

# 替换原文件
mv admin.js.tmp admin.js

echo "admin.js updated"
```

### 4. 重启服务

```bash
cd /root/my1-english-learning/backend
pm2 restart my1-backend

# 等待服务启动
sleep 3

# 检查服务状态
pm2 list | grep my1-backend

# 查看最新日志
pm2 logs my1-backend --lines 20
```

### 5. 验证更新

```bash
# 测试导出API（需要先登录获取session）
curl -X GET http://47.97.185.117/api/admin/export/all

# 或者在浏览器访问
# http://47.97.185.117/api/admin/export/all
```

## 完成

更新完成后：
1. 访问 http://47.97.185.117/admin
2. 登录：admin / admin123
3. 进入"内容管理"
4. 点击"一键导出课程"按钮
5. 查看是否自动下载JSON文件

## 如果出错

```bash
# 恢复备份
cd /root/my1-english-learning/backend/src/services
mv AdminService.js.old AdminService.js

cd /root/my1-english-learning/backend/src/routes
mv admin.js.old admin.js

# 重启服务
cd /root/my1-english-learning/backend
pm2 restart my1-backend
```
