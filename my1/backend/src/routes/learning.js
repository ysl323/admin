import express from 'express';
import LearningService from '../services/LearningService.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/learning/categories
 * 获取所有分类
 * 需要登录
 */
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await LearningService.getAllCategories();
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    logger.error('获取分类列表接口错误:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败'
    });
  }
});

/**
 * GET /api/learning/categories/:id/lessons
 * 获取指定分类的所有课程
 * 需要登录
 */
router.get('/categories/:id/lessons', authMiddleware, async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    if (isNaN(categoryId)) {
      return res.status(400).json({
        success: false,
        message: '无效的分类ID'
      });
    }

    const lessons = await LearningService.getLessonsByCategory(categoryId);
    res.json({
      success: true,
      lessons
    });
  } catch (error) {
    logger.error(`获取分类 ${req.params.id} 的课程列表接口错误:`, error);
    
    if (error.message === '分类不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '获取课程列表失败'
    });
  }
});

/**
 * GET /api/learning/lessons/:id/words
 * 获取指定课程的所有单词
 * 需要登录
 */
router.get('/lessons/:id/words', authMiddleware, async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程ID'
      });
    }

    const result = await LearningService.getWordsByLesson(lessonId);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error(`获取课程 ${req.params.id} 的单词列表接口错误:`, error);
    
    if (error.message === '课程不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '获取单词列表失败'
    });
  }
});

export default router;


/**
 * POST /api/learning/check-answer
 * 检查用户答案是否正确
 * 需要登录
 */
router.post('/check-answer', authMiddleware, async (req, res) => {
  try {
    const { wordId, answer } = req.body;

    if (!wordId || answer === undefined || answer === null) {
      return res.status(400).json({
        success: false,
        message: '单词ID和答案不能为空'
      });
    }

    const result = await LearningService.checkAnswer(parseInt(wordId), answer);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('检查答案接口错误:', error);
    
    if (error.message === '单词不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '检查答案失败'
    });
  }
});
