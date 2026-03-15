# 导出功能 - 最终部署指南

## 当前状态

### ✅ 已完成（本地）
- 后端代码已更新（AdminService.js, admin.js）
- 前端代码已构建（frontend/dist）
- 所有功能已实现并测试通过

### ⚠️ 需要完成（服务器）
- 将更新后的代码部署到服务器 47.97.185.117

## 快速部署方法（选择一种）

### 方法1: PowerShell脚本（推荐）

在本地执行以下命令之一：

```powershell
# 方法A: 直接执行
powershell -ExecutionPolicy Bypass -File "e:\demo\my1\deploy-now-en.ps1"

# 方法B: 双击运行
双击文件: e:\demo\my1\start-deploy.bat
```

### 方法2: 使用批处理文件

```cmd
双击运行: e:\demo\my1\deploy.bat
```

### 方法3: 手动SSH部署（如果上述方法失败）

#### 步骤1: 连接服务器
打开SSH终端（PuTTY、MobaXterm、Windows Terminal等）：
```bash
ssh root@47.97.185.117
```

#### 步骤2: 复制粘贴完整命令

复制以下完整命令块（一次性粘贴到SSH终端）：

```bash
cd /root/my1-english-learning && mkdir -p backup-$(date +%Y%m%d) && cp backend/src/services/AdminService.js backup-$(date +%Y%m%d)/ && cp backend/src/routes/admin.js backup-$(date +%Y%m%d)/ && cd backend/src/services && head -n -1 AdminService.js > AdminService.js.tmp && cat >> AdminService.js.tmp << 'EOF'

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
      if (!category) { throw new Error('分类不存在'); }
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
      if (!lesson) { throw new Error('课程不存在'); }
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
echo "}" >> AdminService.js.tmp && echo "" >> AdminService.js.tmp && echo "export default new AdminService();" >> AdminService.js.tmp && mv AdminService.js.tmp AdminService.js && cd /root/my1-english-learning/backend/src/routes && head -n -1 admin.js > admin.js.tmp && cat >> admin.js.tmp << 'EOF2'

// ==================== 导出接口 ====================

router.get('/export/all', async (req, res) => {
  try {
    const result = await AdminService.exportAllData();
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('导出所有数据失败:', error);
    res.status(500).json({ success: false, message: '导出数据失败', error: error.message });
  }
});

router.get('/export/category/:categoryId', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId, 10);
    if (isNaN(categoryId)) {
      return res.status(400).json({ success: false, message: '无效的分类 ID' });
    }
    const result = await AdminService.exportCategoryData(categoryId);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('导出分类数据失败:', error);
    if (error.message === '分类不存在') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: '导出分类数据失败', error: error.message });
  }
});

router.get('/export/lesson/:lessonId', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.lessonId, 10);
    if (isNaN(lessonId)) {
      return res.status(400).json({ success: false, message: '无效的课程 ID' });
    }
    const result = await AdminService.exportLessonData(lessonId);
    res.json({ success: true, ...result });
  } catch (error) {
    logger.error('导出课程数据失败:', error);
    if (error.message === '课程不存在') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: '导出课程数据失败', error: error.message });
  }
});

EOF2
echo "" >> admin.js.tmp && echo "export default router;" >> admin.js.tmp && mv admin.js.tmp admin.js && cd /root/my1-english-learning/backend && pm2 restart my1-backend && echo "========================================" && echo "Deployment Complete!" && echo "========================================" && echo "Frontend: http://47.97.185.117" && echo "Admin: http://47.97.185.117/admin" && echo "========================================"
```

### 方法4: 逐条命令执行

如果上述方法失败，请按顺序执行以下命令：

```bash
# 1. 备份
cd /root/my1-english-learning
mkdir -p backup-$(date +%Y%m%d)
cp backend/src/services/AdminService.js backup-$(date +%Y%m%d)/
cp backend/src/routes/admin.js backup-$(date +%Y%m%d)/

# 2. 更新 AdminService.js
cd backend/src/services
nano AdminService.js
# 在最后一行之前添加导出函数（见 e:\demo\my1\SOURCE-CODE.txt）

# 3. 更新 admin.js
cd /root/my1-english-learning/backend/src/routes
nano admin.js
# 在最后一行之前添加导出路由（见 e:\demo\my1\SOURCE-CODE.txt）

# 4. 重启服务
cd /root/my1-english-learning/backend
pm2 restart my1-backend

# 5. 验证
pm2 logs my1-backend --lines 20
```

## 验证部署

### 1. 检查API

在浏览器访问:
```
http://47.97.185.117/api/admin/export/all
```

- ✅ 成功: 返回JSON数据
- ❌ 失败: 返回404（说明后端未更新）

### 2. 测试前端

1. 访问: http://47.97.185.117/admin
2. 登录: admin / admin123
3. 点击"内容管理"
4. 确认看到"一键导出课程"按钮
5. 点击按钮测试导出

### 3. 检查服务状态

```bash
ssh root@47.97.185.117
pm2 list
pm2 logs my1-backend --lines 20
```

## 故障排除

### 问题1: 部署脚本执行失败

**解决方案**: 使用方法3（手动SSH部署）

### 问题2: PM2重启失败

**解决方案**:
```bash
pm2 stop my1-backend
pm2 delete my1-backend
cd /root/my1-english-learning/backend
pm2 start index.js --name my1-backend
pm2 save
```

### 问题3: 导出API返回500错误

**解决方案**:
```bash
pm2 logs my1-backend --lines 100
# 检查具体错误信息
```

### 问题4: 前端按钮不显示

**解决方案**:
- 清除浏览器缓存（Ctrl + F5）
- 检查浏览器控制台是否有错误

### 问题5: 需要回滚

**解决方案**:
```bash
cd /root/my1-english-learning/backend/src/services
cp backup-$(date +%Y%m%d)/AdminService.js .
cd /root/my1-english-learning/backend/src/routes
cp backup-$(date +%Y%m%d)/admin.js .
cd /root/my1-english-learning/backend
pm2 restart my1-backend
```

## 导出功能说明

### 支持的导出

1. **导出所有课程**
   - 路由: `GET /api/admin/export/all`
   - 前端: "内容管理" → "一键导出课程"

2. **导出分类**
   - 路由: `GET /api/admin/export/category/:id`

3. **导出课程**
   - 路由: `GET /api/admin/export/lesson/:id`

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

## 完成清单

部署完成后，请确认：

- [ ] 后端服务正常运行（PM2 status正常）
- [ ] 导出API返回正确的JSON数据
- [ ] 前端显示"一键导出课程"按钮
- [ ] 点击按钮可以成功下载JSON文件
- [ ] 导入功能仍然正常工作

## 联系和支持

如果遇到问题，请提供以下信息：

1. 执行的部署方法
2. 错误信息（PM2日志或浏览器控制台）
3. 服务器状态（pm2 list输出）
4. 具体的失败步骤

## 附加资源

- 代码源文件: `e:\demo\my1\my1\backend\src\`
- 详细部署指南: `e:\demo\my1\SERVER-COMMANDS.md`
- 一键部署脚本: `e:\demo\my1\deploy-now-en.ps1`
- 批处理部署: `e:\demo\my1\deploy.bat`
