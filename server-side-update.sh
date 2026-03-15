#!/bin/bash
# 服务器端直接更新脚本 - 复制粘贴到SSH终端执行

set -e

APP_PATH="/root/my1-english-learning"

echo "=========================================="
echo "服务器端更新导出功能"
echo "=========================================="

# 1. 备份
echo ""
echo "[1/3] 备份现有代码..."
BACKUP_PATH="$APP_PATH/backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_PATH"
cp -r "$APP_PATH/backend/src/services/AdminService.js" "$BACKUP_PATH/" 2>/dev/null || true
cp -r "$APP_PATH/backend/src/routes/admin.js" "$BACKUP_PATH/" 2>/dev/null || true
echo "备份完成: $BACKUP_PATH"

# 2. 更新 AdminService.js
echo ""
echo "[2/3] 更新 AdminService.js..."

# 检查是否已有导出函数
if grep -q "async exportAllData" "$APP_PATH/backend/src/services/AdminService.js"; then
    echo "AdminService.js 已包含导出功能，跳过"
else
    # 在 export default new AdminService(); 之前插入导出功能
    BACKUP_FILE="$APP_PATH/backend/src/services/AdminService.js.bak"
    cp "$APP_PATH/backend/src/services/AdminService.js" "$BACKUP_FILE"

    # 使用 sed 在最后一行之前插入
    # 由于代码复杂，直接使用 cat 覆盖
    cat > /tmp/export_functions.txt << 'EOF'
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
            question: word.id,
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

EOF

    # 在最后一行之前插入
    head -n -1 "$APP_PATH/backend/src/services/AdminService.js" > /tmp/admin_service_temp.js
    cat /tmp/export_functions.txt >> /tmp/admin_service_temp.js
    echo "}" >> /tmp/admin_service_temp.js
    echo "" >> /tmp/admin_service_temp.js
    echo "export default new AdminService();" >> /tmp/admin_service_temp.js

    cp /tmp/admin_service_temp.js "$APP_PATH/backend/src/services/AdminService.js"
    echo "AdminService.js 更新完成"
fi

# 3. 更新 admin.js
echo ""
echo "[3/3] 更新 admin.js (路由)..."

if grep -q "/export/all" "$APP_PATH/backend/src/routes/admin.js"; then
    echo "admin.js 已包含导出路由，跳过"
else
    BACKUP_FILE="$APP_PATH/backend/src/routes/admin.js.bak"
    cp "$APP_PATH/backend/src/routes/admin.js" "$BACKUP_FILE"

    # 在最后一行之前插入导出路由
    cat > /tmp/export_routes.txt << 'EOF'

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

EOF

    head -n -1 "$APP_PATH/backend/src/routes/admin.js" > /tmp/admin_routes_temp.js
    cat /tmp/export_routes.txt >> /tmp/admin_routes_temp.js
    echo "" >> /tmp/admin_routes_temp.js
    echo "export default router;" >> /tmp/admin_routes_temp.js

    cp /tmp/admin_routes_temp.js "$APP_PATH/backend/src/routes/admin.js"
    echo "admin.js 更新完成"
fi

# 4. 重启服务
echo ""
echo "重启后端服务..."
cd "$APP_PATH/backend"
pm2 restart my1-backend

# 等待服务启动
sleep 3

# 检查服务状态
echo ""
echo "=========================================="
echo "更新完成！"
echo "=========================================="
echo ""
echo "PM2 状态:"
pm2 list | grep my1-backend
echo ""
echo "访问地址:"
echo "  - 前端: http://47.97.185.117"
echo "  - 管理后台: http://47.97.185.117/admin"
echo ""
echo "测试导出功能:"
echo "  1. 访问管理后台"
echo "  2. 登录 (admin / admin123)"
echo "  3. 进入内容管理"
echo "  4. 点击 '一键导出课程'"
echo ""
