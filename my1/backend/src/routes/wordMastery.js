const express = require('express');
const router = express.Router();
const { WordMastery } = require('../models');
const { authenticateToken } = require('../middleware/auth');

// 中间件：认证
router.use(authenticateToken);

/**
 * @route   POST /api/word-mastery
 * @desc    标记单词为已掌握
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const { lessonId, wordId } = req.body;
    const userId = req.user.id;

    // 验证参数
    if (!lessonId || !wordId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：lessonId 和 wordId'
      });
    }

    // 标记单词为已掌握
    const mastery = await WordMastery.markAsMastered(userId, lessonId, wordId);

    res.json({
      success: true,
      message: '单词已标记为掌握',
      data: {
        userId,
        lessonId,
        wordId,
        masteredAt: mastery.masteredAt
      }
    });
  } catch (error) {
    console.error('标记单词为掌握失败:', error);
    res.status(500).json({
      success: false,
      message: '标记失败',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/word-mastery/:wordId
 * @desc    取消单词掌握状态
 * @access  Private
 */
router.delete('/:wordId', async (req, res) => {
  try {
    const { wordId } = req.params;
    const userId = req.user.id;

    // 验证参数
    if (!wordId || isNaN(wordId)) {
      return res.status(400).json({
        success: false,
        message: '无效的单词ID'
      });
    }

    // 取消掌握状态
    const success = await WordMastery.unmarkAsMastered(userId, parseInt(wordId));

    res.json({
      success: true,
      message: success ? '已取消掌握状态' : '该单词未被标记为掌握'
    });
  } catch (error) {
    console.error('取消单词掌握失败:', error);
    res.status(500).json({
      success: false,
      message: '取消失败',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/word-mastery/lesson/:lessonId
 * @desc    获取用户在指定课程的所有掌握单词
 * @access  Private
 */
router.get('/lesson/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    // 验证参数
    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程ID'
      });
    }

    // 获取课程的所有掌握单词
    const masteredWordIds = await WordMastery.getUserLessonMastery(userId, parseInt(lessonId));

    res.json({
      success: true,
      data: {
        lessonId: parseInt(lessonId),
        masteredWordIds,
        masteredCount: masteredWordIds.length
      }
    });
  } catch (error) {
    console.error('获取课程掌握状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/word-mastery/stats
 * @desc    获取用户的掌握统计信息
 * @access  Private
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // 获取用户的掌握统计
    const stats = await WordMastery.getUserMasteryStats(userId);

    res.json({
      success: true,
      data: {
        userId,
        stats
      }
    });
  } catch (error) {
    console.error('获取掌握统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/word-mastery/lesson/:lessonId/rate
 * @desc    获取课程的整体掌握率
 * @access  Private
 */
router.get('/lesson/:lessonId/rate', async (req, res) => {
  try {
    const { lessonId } = req.params;

    // 验证参数
    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程ID'
      });
    }

    // 获取课程掌握率
    const rate = await WordMastery.getWordMasteryRate(parseInt(lessonId));

    res.json({
      success: true,
      data: rate
    });
  } catch (error) {
    console.error('获取课程掌握率失败:', error);
    res.status(500).json({
      success: false,
      message: '获取失败',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/word-mastery/sync
 * @desc    批量同步掌握状态（离线数据同步）
 * @access  Private
 */
router.post('/sync', async (req, res) => {
  try {
    const { masteryData } = req.body;
    const userId = req.user.id;

    // 验证参数
    if (!Array.isArray(masteryData)) {
      return res.status(400).json({
        success: false,
        message: 'masteryData 必须是数组'
      });
    }

    const results = {
      synced: 0,
      failed: 0,
      errors: []
    };

    // 批量处理
    for (const item of masteryData) {
      try {
        const { lessonId, wordId, masteredAt } = item;

        if (!lessonId || !wordId) {
          results.failed++;
          results.errors.push({
            item,
            error: '缺少 lessonId 或 wordId'
          });
          continue;
        }

        // 标记为已掌握
        await WordMastery.markAsMastered(userId, lessonId, wordId);
        results.synced++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          item,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `同步完成：${results.synced} 个成功，${results.failed} 个失败`,
      data: results
    });
  } catch (error) {
    console.error('批量同步掌握状态失败:', error);
    res.status(500).json({
      success: false,
      message: '同步失败',
      error: error.message
    });
  }
});

module.exports = router;
