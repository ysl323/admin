Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Final Fix - Manual File Edit" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    Write-Host "`n[1/4] Connecting to server..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey
    Write-Host "Connected" -ForegroundColor Green

    # Restore clean backup
    Write-Host "`n[2/4] Restoring clean backup..." -ForegroundColor Yellow
    Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning && cp backup-20260315/AdminService.js backend/src/services/ && cp backup-20260315/admin.js backend/src/routes/ && echo 'Clean files restored'"

    # Use Python to edit files
    Write-Host "`n[3/4] Adding export functions using Python..." -ForegroundColor Gray

    $pythonScript = @'
import sys

# Read AdminService.js
with open('/root/english-learning/backend/src/services/AdminService.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the last line that is "export default new AdminService();"
last_line = -1
for i, line in enumerate(lines):
    if 'export default new AdminService' in line:
        last_line = i

if last_line > 0:
    # Insert export functions before the last line
    export_functions = '''

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

'''
    lines.insert(last_line, export_functions)

    # Write back
    with open('/root/english-learning/backend/src/services/AdminService.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print("AdminService.js updated")

# Read admin.js
with open('/root/english-learning/backend/src/routes/admin.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the last line that is "export default router;"
last_line = -1
for i, line in enumerate(lines):
    if 'export default router' in line:
        last_line = i

if last_line > 0:
    # Insert export routes before the last line
    export_routes = '''

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

'''
    lines.insert(last_line, export_routes)

    # Write back
    with open('/root/english-learning/backend/src/routes/admin.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print("admin.js updated")
'@

    # Upload and execute Python script
    Invoke-SSHCommand -SessionId $session.SessionId -Command "cat > /tmp/add_export.py << 'PYEOF'
$pythonScript
PYEOF"

    Invoke-SSHCommand -SessionId $session.SessionId -Command "python3 /tmp/add_export.py"

    Write-Host "Export functions added successfully" -ForegroundColor Green

    # Restart service
    Write-Host "`n[4/4] Restarting service..." -ForegroundColor Yellow
    Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/english-learning/backend && pm2 restart english-learning-backend"
    Write-Host "Service restarted" -ForegroundColor Green

    Remove-SSHSession -SessionId $session.SessionId

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nTest at: http://47.97.185.117/admin" -ForegroundColor Cyan
    Write-Host "Login: admin / admin123" -ForegroundColor Cyan

} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    if ($session) {
        Remove-SSHSession -SessionId $session.SessionId -ErrorAction SilentlyContinue
    }
}
