import express from 'express';
import archiver from 'archiver';
import UserService from '../services/UserService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import dailyTasks from '../jobs/dailyTasks.js';
import logger from '../utils/logger.js';
import SimpleLessonImportService from '../services/SimpleLessonImportService.js';

const router = express.Router();

// 所有管理员路由都需要认证和管理员权限
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/admin/users
 * 获取所有用户列表
 */
router.get('/users', async (req, res) => {
  try {
    const users = await UserService.getAllUsers();

    res.json({
      success: true,
      users
    });
  } catch (error) {
    logger.error('获取用户列表失败:', error);

    res.status(500).json({
      success: false,
      message: '获取用户列表失败'
    });
  }
});

/**
 * GET /api/admin/users/:id
 * 获取用户详情
 */
router.get('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户 ID'
      });
    }

    const user = await UserService.getUserById(userId);

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error('获取用户详情失败:', error);

    if (error.message === '用户不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '获取用户详情失败'
    });
  }
});

/**
 * PUT /api/admin/users/:id/update-username
 * 修改用户名
 */
router.put('/users/:id/update-username', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { newUsername } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户 ID'
      });
    }

    if (!newUsername || newUsername.trim().length < 3 || newUsername.trim().length > 20) {
      return res.status(400).json({
        success: false,
        message: '用户名长度必须为 3-20 个字符'
      });
    }

    const result = await UserService.updateUsername(userId, newUsername.trim());

    res.json(result);
  } catch (error) {
    logger.error('修改用户名失败:', error);

    if (error.message === '用户不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('已存在')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '修改用户名失败'
    });
  }
});

/**
 * PUT /api/admin/users/:id/reset-password
 * 重置用户密码
 */
router.put('/users/:id/reset-password', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户 ID'
      });
    }

    const result = await UserService.resetPassword(userId, newPassword);

    res.json(result);
  } catch (error) {
    logger.error('重置密码失败:', error);

    if (error.message === '用户不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('密码')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '重置密码失败'
    });
  }
});

/**
 * PUT /api/admin/users/:id/add-days
 * 增加用户访问天数
 */
router.put('/users/:id/add-days', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { days } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户 ID'
      });
    }

    if (!days || isNaN(days) || days <= 0) {
      return res.status(400).json({
        success: false,
        message: '天数必须是大于 0 的数字'
      });
    }

    const result = await UserService.updateAccessDays(userId, parseInt(days, 10));

    res.json(result);
  } catch (error) {
    logger.error('增加访问天数失败:', error);

    if (error.message === '用户不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '增加访问天数失败'
    });
  }
});

/**
 * PUT /api/admin/users/:id/toggle-status
 * 切换用户账号状态（启用/禁用）
 */
router.put('/users/:id/toggle-status', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户 ID'
      });
    }

    const result = await UserService.toggleUserStatus(userId);

    res.json(result);
  } catch (error) {
    logger.error('切换用户状态失败:', error);

    if (error.message === '用户不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('管理员')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '切换用户状态失败'
    });
  }
});

/**
 * GET /api/admin/stats
 * 获取用户统计信息
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await UserService.getUserStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('获取统计信息失败:', error);

    res.status(500).json({
      success: false,
      message: '获取统计信息失败'
    });
  }
});

/**
 * POST /api/admin/users
 * 创建新用户
 */
router.post('/users', async (req, res) => {
  try {
    const { username, password, accessDays, isAdmin, isSuperAdmin } = req.body;

    const result = await UserService.createUser({
      username,
      password,
      accessDays,
      isAdmin,
      isSuperAdmin
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('创建用户失败:', error);

    if (error.message.includes('用户名')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '创建用户失败'
    });
  }
});

/**
 * PUT /api/admin/users/:id/permissions
 * 更新用户权限
 */
router.put('/users/:id/permissions', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { isAdmin, isSuperAdmin, accessDays } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户 ID'
      });
    }

    const result = await UserService.updatePermissions(userId, {
      isAdmin,
      isSuperAdmin,
      accessDays
    });

    res.json(result);
  } catch (error) {
    logger.error('更新用户权限失败:', error);

    if (error.message === '用户不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '更新用户权限失败'
    });
  }
});

/**
 * POST /api/admin/tasks/decrement-days
 * 手动触发每日天数递减任务（用于测试）
 */
router.post('/tasks/decrement-days', async (req, res) => {
  try {
    const result = await dailyTasks.triggerDecrementTask();

    res.json({
      success: true,
      message: '任务执行成功',
      result
    });
  } catch (error) {
    logger.error('手动触发任务失败:', error);

    res.status(500).json({
      success: false,
      message: '任务执行失败'
    });
  }
});

/**
 * GET /api/admin/tasks/status
 * 获取定时任务状态
 */
router.get('/tasks/status', (req, res) => {
  try {
    const tasks = dailyTasks.getTasksStatus();

    res.json({
      success: true,
      tasks
    });
  } catch (error) {
    logger.error('获取任务状态失败:', error);

    res.status(500).json({
      success: false,
      message: '获取任务状态失败'
    });
  }
});

// ==================== 内容管理接口 ====================

import AdminService from '../services/AdminService.js';
import { Category, Lesson, Word } from '../models/index.js';

/**
 * GET /api/admin/categories
 * 获取所有分类（带课程数量）
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await AdminService.getAllCategories();

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    logger.error('获取分类列表失败:', error);

    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
});

/**
 * POST /api/admin/categories
 * 创建分类
 */
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }

    const category = await AdminService.createCategory(name.trim());

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      category
    });
  } catch (error) {
    logger.error('创建分类失败:', error);

    if (error.message === '分类名称已存在') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '创建分类失败'
    });
  }
});

/**
 * PUT /api/admin/categories/:id
 * 更新分类
 */
router.put('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的分类ID'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }

    const category = await AdminService.updateCategory(id, name.trim());

    res.json({
      success: true,
      message: '分类更新成功',
      category
    });
  } catch (error) {
    logger.error(`更新分类 ${req.params.id} 失败:`, error);

    if (error.message === '分类不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === '分类名称已存在') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '更新分类失败'
    });
  }
});

/**
 * DELETE /api/admin/categories/:id
 * 删除分类（级联删除所有课程和单词）
 */
router.delete('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的分类ID'
      });
    }

    const result = await AdminService.deleteCategory(id);

    res.json({
      success: true,
      message: '分类删除成功',
      ...result
    });
  } catch (error) {
    logger.error(`删除分类 ${req.params.id} 失败:`, error);

    if (error.message === '分类不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '删除分类失败'
    });
  }
});

/**
 * GET /api/admin/lessons
 * 获取所有课程（带分类名称和单词数量）
 */
router.get('/lessons', async (req, res) => {
  try {
    const lessons = await AdminService.getAllLessons();

    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    logger.error('获取课程列表失败:', error);

    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
});

/**
 * POST /api/admin/lessons
 * 创建课程
 */
router.post('/lessons', async (req, res) => {
  try {
    const { categoryId, lessonNumber } = req.body;

    if (!categoryId || !lessonNumber) {
      return res.status(400).json({
        success: false,
        message: '分类ID和课程编号不能为空'
      });
    }

    const lesson = await AdminService.createLesson(
      parseInt(categoryId),
      parseInt(lessonNumber)
    );

    res.status(201).json({
      success: true,
      message: '课程创建成功',
      lesson
    });
  } catch (error) {
    logger.error('创建课程失败:', error);

    if (error.message === '分类不存在' || error.message === '该分类下的课程编号已存在') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '创建课程失败'
    });
  }
});

/**
 * PUT /api/admin/lessons/:id
 * 更新课程
 */
router.put('/lessons/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { lessonNumber } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程ID'
      });
    }

    if (!lessonNumber) {
      return res.status(400).json({
        success: false,
        message: '课程编号不能为空'
      });
    }

    const lesson = await AdminService.updateLesson(id, parseInt(lessonNumber));

    res.json({
      success: true,
      message: '课程更新成功',
      lesson
    });
  } catch (error) {
    logger.error(`更新课程 ${req.params.id} 失败:`, error);

    if (error.message === '课程不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === '该分类下的课程编号已存在') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '更新课程失败'
    });
  }
});

/**
 * DELETE /api/admin/lessons/:id
 * 删除课程（级联删除所有单词）
 */
router.delete('/lessons/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程ID'
      });
    }

    const result = await AdminService.deleteLesson(id);

    res.json({
      success: true,
      message: '课程删除成功',
      ...result
    });
  } catch (error) {
    logger.error(`删除课程 ${req.params.id} 失败:`, error);

    if (error.message === '课程不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '删除课程失败'
    });
  }
});


// ==================== 单词管理接口 ====================

/**
 * GET /api/admin/words
 * 获取所有单词（带课程和分类信息）
 */
router.get('/words', async (req, res) => {
  try {
    const words = await AdminService.getAllWords();

    res.json({
      success: true,
      words
    });
  } catch (error) {
    logger.error('获取单词列表失败:', error);

    res.status(500).json({
      success: false,
      message: '获取单词列表失败'
    });
  }
});

/**
 * POST /api/admin/words
 * 创建单词
 */
router.post('/words', async (req, res) => {
  try {
    const { lessonId, english, chinese, phonetic } = req.body;

    if (!lessonId || !english || !chinese) {
      return res.status(400).json({
        success: false,
        message: '课程ID、英文和中文不能为空'
      });
    }

    const word = await AdminService.createWord({
      lessonId: parseInt(lessonId),
      english: english.trim(),
      chinese: chinese.trim(),
      phonetic: phonetic ? phonetic.trim() : null
    });

    res.status(201).json({
      success: true,
      message: '单词创建成功',
      word
    });
  } catch (error) {
    logger.error('创建单词失败:', error);

    if (error.message === '课程不存在') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '创建单词失败'
    });
  }
});

/**
 * PUT /api/admin/words/:id
 * 更新单词
 */
router.put('/words/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { lessonId, english, chinese, phonetic } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的单词ID'
      });
    }

    const word = await AdminService.updateWord(id, {
      lessonId: lessonId ? parseInt(lessonId) : undefined,
      english: english ? english.trim() : undefined,
      chinese: chinese ? chinese.trim() : undefined,
      phonetic: phonetic !== undefined ? (phonetic ? phonetic.trim() : null) : undefined
    });

    res.json({
      success: true,
      message: '单词更新成功',
      word
    });
  } catch (error) {
    logger.error(`更新单词 ${req.params.id} 失败:`, error);

    if (error.message === '单词不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === '课程不存在') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '更新单词失败'
    });
  }
});

/**
 * DELETE /api/admin/words/:id
 * 删除单词
 */
router.delete('/words/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的单词ID'
      });
    }

    const result = await AdminService.deleteWord(id);

    res.json({
      success: true,
      message: '单词删除成功',
      ...result
    });
  } catch (error) {
    logger.error(`删除单词 ${req.params.id} 失败:`, error);

    if (error.message === '单词不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '删除单词失败'
    });
  }
});


// ==================== TTS 配置接口 ====================

/**
 * GET /api/admin/config/tts
 * 获取 TTS 配置
 */
router.get('/config/tts', async (req, res) => {
  try {
    const config = await AdminService.getTTSConfig();

    // 脱敏处理：只显示密钥的前4位和后4位
    const maskSensitive = (str) => {
      if (!str || str.length <= 8) return '****';
      return `${str.substring(0, 4)}****${str.substring(str.length - 4)}`;
    };

    const maskedConfig = {
      provider: config.provider,
      volcengine: {
        appId: config.volcengine.appId,
        apiKey: config.volcengine.apiKey ? maskSensitive(config.volcengine.apiKey) : '',
        endpoint: config.volcengine.endpoint,
        voiceType: config.volcengine.voiceType,
        language: config.volcengine.language,
        mode: config.volcengine.mode || 'simple'
      },
      google: {
        apiKey: config.google.apiKey ? maskSensitive(config.google.apiKey) : '',
        languageCode: config.google.languageCode,
        voiceName: config.google.voiceName,
        speakingRate: config.google.speakingRate
      }
    };

    res.json({
      success: true,
      config: maskedConfig
    });
  } catch (error) {
    logger.error('获取TTS配置失败:', error);

    res.status(500).json({
      success: false,
      message: '获取TTS配置失败'
    });
  }
});

/**
 * PUT /api/admin/config/tts
 * 保存 TTS 配置
 */
router.put('/config/tts', async (req, res) => {
  try {
    const { provider, config } = req.body;

    if (!provider || !config) {
      return res.status(400).json({
        success: false,
        message: '提供商和配置不能为空'
      });
    }

    if (provider !== 'volcengine' && provider !== 'google') {
      return res.status(400).json({
        success: false,
        message: '无效的TTS提供商'
      });
    }

    await AdminService.saveTTSConfig(provider, config);

    res.json({
      success: true,
      message: 'TTS配置保存成功'
    });
  } catch (error) {
    logger.error('保存TTS配置失败:', error);

    res.status(500).json({
      success: false,
      message: '保存TTS配置失败'
    });
  }
});


// ==================== JSON 批量导入 ====================

import multer from 'multer';
import ImportService from '../services/ImportService.js';
import fs from 'fs/promises';

// 配置 multer 文件上传
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传 JSON 文件'));
    }
  }
});

/**
 * POST /api/admin/import-json
 * JSON 批量导入
 * 需要管理员权限
 */
router.post('/import-json', upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传 JSON 文件'
      });
    }

    filePath = req.file.path;
    
    // 导入数据
    const result = await ImportService.importFromFile(filePath);
    
    res.json({
      success: true,
      message: 'JSON 导入成功',
      ...result
    });
  } catch (error) {
    logger.error('JSON 导入接口错误:', error);
    
    let message = 'JSON 导入失败';
    if (error.message.includes('JSON 格式验证失败')) {
      message = error.message;
    } else if (error.message === 'JSON 文件格式错误') {
      message = 'JSON 文件格式错误，请检查文件内容';
    }
    
    res.status(400).json({
      success: false,
      message
    });
  } finally {
    // 清理上传的临时文件
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        logger.error('删除临时文件失败:', error);
      }
    }
  }
});

/**
 * POST /api/admin/import-json-direct
 * 直接从请求体导入 JSON 数据（不需要文件上传）
 * 需要管理员权限
 */
router.post('/import-json-direct', async (req, res) => {
  try {
    const data = req.body;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({
        success: false,
        message: '请提供有效的 JSON 数据'
      });
    }
    
    // 导入数据
    const result = await ImportService.importFromJSON(data);
    
    res.json({
      success: true,
      message: 'JSON 导入成功',
      ...result
    });
  } catch (error) {
    logger.error('JSON 直接导入接口错误:', error);
    
    let message = 'JSON 导入失败';
    if (error.message.includes('JSON 格式验证失败')) {
      message = error.message;
    }
    
    res.status(400).json({
      success: false,
      message
    });
  }
});

/**
 * POST /api/admin/import-simple-lesson
 * 简化课程导入（新概念英语格式）
 * 格式：[{lesson?, question, english, chinese}]
 */
router.post('/import-simple-lesson', async (req, res) => {
  try {
    const { data, categoryName } = req.body;
    
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的 JSON 数组数据'
      });
    }
    
    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({
        success: false,
        message: '请提供分类名称'
      });
    }
    
    // 导入数据
    const result = await SimpleLessonImportService.importFromJSON(data, categoryName.trim());
    
    res.json({
      success: true,
      message: '课程导入成功',
      ...result
    });
  } catch (error) {
    logger.error('简化课程导入错误:', error);
    
    let message = '课程导入失败';
    if (error.message.includes('JSON 格式验证失败')) {
      message = error.message;
    }
    
    res.status(400).json({
      success: false,
      message
    });
  }
});

import TTSService from '../services/TTSService.js';

/**
 * POST /api/admin/test-tts
 * 测试 TTS 配置（实际调用 API）
 */
router.post('/test-tts', async (req, res) => {
  try {
    const { provider, text } = req.body;
    
    if (!provider) {
      return res.status(400).json({
        success: false,
        message: '请指定 TTS 提供商'
      });
    }
    
    const testText = text || 'Hello, this is a test.';
    let result;
    
    if (provider === 'volcengine') {
      result = await TTSService.testVolcengineTTS(testText);
    } else if (provider === 'google') {
      result = await TTSService.testGoogleTTS(testText);
    } else {
      return res.status(400).json({
        success: false,
        message: '无效的 TTS 提供商'
      });
    }
    
    res.json(result);
  } catch (error) {
    logger.error('测试 TTS 配置失败:', error);
    
    res.status(500).json({
      success: false,
      message: '测试 TTS 配置失败',
      error: error.message
    });
  }
});

// ==================== 导出接口 ====================

/**
 * GET /api/admin/export/txt-zip
 * 导出所有课程为TXT文件并打包成ZIP
 */
router.get('/export/txt-zip', async (req, res) => {
  try {
    const archive = await AdminService.exportAllAsTxtZip();
    
    res.attachment(`lessons-export-${new Date().toISOString().slice(0, 10)}.zip`);
    archive.pipe(res);
    archive.finalize();
  } catch (error) {
    logger.error('导出TXT ZIP失败:', error);
    res.status(500).json({
      success: false,
      message: '导出失败',
      error: error.message
    });
  }
});

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

// 一键导出所有课程为JSON打包（ZIP）
router.get('/export/all/txt', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Lesson,
        as: 'lessons',
        include: [{ model: Word, as: 'words', order: [['id', 'ASC']] }]
      }]
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="all-lessons-${new Date().toISOString().slice(0,10)}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const cat of categories) {
      // 一个分类一个文件，包含所有课程
      const allWords = [];
      for (const lesson of cat.lessons) {
        for (const w of lesson.words) {
          allWords.push({
            lesson: lesson.lessonNumber,
            question: w.id,
            english: w.english,
            chinese: w.chinese
          });
        }
      }
      const jsonStr = JSON.stringify(allWords, null, 2);
      archive.append(jsonStr, { name: `${cat.name}.txt` });
    }

    archive.finalize();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;


