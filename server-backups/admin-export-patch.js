/**
 * 管理员导出功能补丁
 * 添加到 /var/www/english-learning/server/routes/admin.js
 */

// ==================== 导出功能 ====================

/**
 * 导出指定模块的数据
 * 格式：[{lesson, question, english, phonetic, chinese}]
 */
router.get('/export/module/:moduleId', checkPermission(PERMISSIONS.CONTENT), async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const module = await dbGet('SELECT * FROM modules WHERE id = ?', [moduleId]);
    if (!module) {
      return res.status(404).json({ success: false, message: '模块不存在' });
    }
    
    // 获取该模块下所有内容
    const contents = await dbAll(`
      SELECT lesson, question, english, chinese
      FROM content
      WHERE module_id = ?
      ORDER BY lesson ASC, question ASC
    `, [moduleId]);
    
    // 转换为导出格式（与导入格式一致）
    const exportData = contents.map(c => ({
      lesson: c.lesson,
      question: c.question,
      english: c.english,
      phonetic: '',  // 服务器数据库没有phonetic字段，导出为空
      chinese: c.chinese
    }));
    
    res.json({
      success: true,
      data: exportData,
      stats: {
        moduleName: module.title,
        words: exportData.length
      }
    });
  } catch (error) {
    console.error('导出模块数据错误:', error);
    res.status(500).json({ success: false, message: '导出失败' });
  }
});

/**
 * 导出指定课程的数据
 * 格式：[{lesson, question, english, phonetic, chinese}]
 */
router.get('/export/lesson/:moduleId/:lessonNumber', checkPermission(PERMISSIONS.CONTENT), async (req, res) => {
  try {
    const { moduleId, lessonNumber } = req.params;
    
    const module = await dbGet('SELECT * FROM modules WHERE id = ?', [moduleId]);
    if (!module) {
      return res.status(404).json({ success: false, message: '模块不存在' });
    }
    
    // 获取该课程下所有内容
    const contents = await dbAll(`
      SELECT lesson, question, english, chinese
      FROM content
      WHERE module_id = ? AND lesson = ?
      ORDER BY question ASC
    `, [moduleId, parseInt(lessonNumber, 10)]);
    
    // 转换为导出格式
    const exportData = contents.map(c => ({
      lesson: c.lesson,
      question: c.question,
      english: c.english,
      phonetic: '',
      chinese: c.chinese
    }));
    
    res.json({
      success: true,
      data: exportData,
      stats: {
        moduleName: module.title,
        lessonNumber: parseInt(lessonNumber, 10),
        words: exportData.length
      }
    });
  } catch (error) {
    console.error('导出课程数据错误:', error);
    res.status(500).json({ success: false, message: '导出失败' });
  }
});

/**
 * 导出所有模块为TXT ZIP
 * 每个模块一个文件夹，里面一个txt文件包含所有单词
 */
router.get('/export/txt-zip', checkPermission(PERMISSIONS.CONTENT), async (req, res) => {
  try {
    const archiver = require('archiver');
    
    // 获取所有模块
    const modules = await dbAll('SELECT * FROM modules ORDER BY id ASC');
    
    // 创建ZIP
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="modules-export-${new Date().toISOString().slice(0, 10)}.zip"`);
    
    archive.pipe(res);
    
    // 每个模块一个txt文件
    for (const module of modules) {
      const contents = await dbAll(`
        SELECT lesson, question, english, chinese
        FROM content
        WHERE module_id = ?
        ORDER BY lesson ASC, question ASC
      `, [module.id]);
      
      if (contents.length === 0) continue;
      
      // 转换为导出格式
      const exportData = contents.map(c => ({
        lesson: c.lesson,
        question: c.question,
        english: c.english,
        phonetic: '',
        chinese: c.chinese
      }));
      
      const txtContent = JSON.stringify(exportData, null, 2);
      archive.append(txtContent, { name: `${module.title}/${module.title}.txt` });
    }
    
    archive.finalize();
  } catch (error) {
    console.error('导出TXT ZIP错误:', error);
    res.status(500).json({ success: false, message: '导出失败' });
  }
});
