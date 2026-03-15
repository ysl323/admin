Import-Module Posh-SSH

$serverIP = "47.97.185.117"
$username = "root"
$password = "Admin88868"

$securePassword = ConvertTo-SecureString $password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($username, $securePassword)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Auto Deploy Export Feature" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    Write-Host "`n[1/5] Connecting to server..." -ForegroundColor Yellow
    $session = New-SSHSession -ComputerName $serverIP -Credential $credential -AcceptKey -ErrorAction Stop
    Write-Host "Connected successfully" -ForegroundColor Green

    # Backup
    Write-Host "`n[2/5] Backing up existing files..." -ForegroundColor Yellow
    $backupResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/my1-english-learning && mkdir -p backup-20260315 && cp backend/src/services/AdminService.js backup-20260315/ && cp backend/src/routes/admin.js backup-20260315/ && echo 'Backup done'"
    Write-Host $backupResult.Output -ForegroundColor Green

    # Read the export functions code
    $exportServiceCode = @"

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

"@

    $exportRoutesCode = @"

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

"@

    # Update AdminService.js
    Write-Host "`n[3/5] Updating AdminService.js..." -ForegroundColor Yellow
    $updateServiceCmd = @"
cd /root/my1-english-learning/backend/src/services
head -n -1 AdminService.js > AdminService.js.tmp
cat >> AdminService.js.tmp << 'EOF'
$exportServiceCode
EOF
echo '}' >> AdminService.js.tmp
echo '' >> AdminService.js.tmp
echo 'export default new AdminService();' >> AdminService.js.tmp
mv AdminService.js.tmp AdminService.js
echo 'AdminService.js updated'
"@
    $serviceResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $updateServiceCmd
    Write-Host $serviceResult.Output -ForegroundColor Green

    # Update admin.js
    Write-Host "`n[4/5] Updating admin.js..." -ForegroundColor Yellow
    $updateRoutesCmd = @"
cd /root/my1-english-learning/backend/src/routes
head -n -1 admin.js > admin.js.tmp
cat >> admin.js.tmp << 'EOF'
$exportRoutesCode
EOF
echo '' >> admin.js.tmp
echo 'export default router;' >> admin.js.tmp
mv admin.js.tmp admin.js
echo 'admin.js updated'
"@
    $routesResult = Invoke-SSHCommand -SessionId $session.SessionId -Command $updateRoutesCmd
    Write-Host $routesResult.Output -ForegroundColor Green

    # Restart service
    Write-Host "`n[5/5] Restarting backend service..." -ForegroundColor Yellow
    $restartResult = Invoke-SSHCommand -SessionId $session.SessionId -Command "cd /root/my1-english-learning/backend && pm2 restart my1-backend"
    Write-Host $restartResult.Output -ForegroundColor Green

    # Disconnect
    Remove-SSHSession -SessionId $session.SessionId | Out-Null

    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nTest the export feature:" -ForegroundColor White
    Write-Host "  http://47.97.185.117/admin" -ForegroundColor Cyan
    Write-Host "`nLogin:" -ForegroundColor White
    Write-Host "  Username: admin" -ForegroundColor Cyan
    Write-Host "  Password: admin123" -ForegroundColor Cyan

} catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Deployment failed. Please check the error message above." -ForegroundColor Red
}
