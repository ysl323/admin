import express from 'express';
import { WordMastery } from '../models/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { lessonId, wordId } = req.body;
    const userId = req.user.id;

    if (!lessonId || !wordId) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数：lessonId 和 wordId'
      });
    }

    const mastery = await WordMastery.markAsMastered(userId, lessonId, wordId);

    res.json({
      success: true,
      message: '单词已标记为掌握',
      data: { userId, lessonId, wordId, masteredAt: mastery.masteredAt }
    });
  } catch (error) {
    console.error('标记单词为掌握失败:', error);
    res.status(500).json({ success: false, message: '标记失败', error: error.message });
  }
});

router.delete('/:wordId', async (req, res) => {
  try {
    const { wordId } = req.params;
    const userId = req.user.id;

    if (!wordId || isNaN(wordId)) {
      return res.status(400).json({ success: false, message: '无效的单词ID' });
    }

    const success = await WordMastery.unmarkAsMastered(userId, parseInt(wordId));

    res.json({
      success: true,
      message: success ? '已取消掌握状态' : '该单词未被标记为掌握'
    });
  } catch (error) {
    console.error('取消单词掌握失败:', error);
    res.status(500).json({ success: false, message: '取消失败', error: error.message });
  }
});

router.get('/lesson/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({ success: false, message: '无效的课程ID' });
    }

    const masteredWordIds = await WordMastery.getUserLessonMastery(userId, parseInt(lessonId));

    res.json({
      success: true,
      data: { lessonId: parseInt(lessonId), masteredWordIds, masteredCount: masteredWordIds.length }
    });
  } catch (error) {
    console.error('获取课程掌握状态失败:', error);
    res.status(500).json({ success: false, message: '获取失败', error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await WordMastery.getUserMasteryStats(userId);

    res.json({ success: true, data: { userId, stats } });
  } catch (error) {
    console.error('获取掌握统计失败:', error);
    res.status(500).json({ success: false, message: '获取失败', error: error.message });
  }
});

router.get('/lesson/:lessonId/rate', async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({ success: false, message: '无效的课程ID' });
    }

    const rate = await WordMastery.getWordMasteryRate(parseInt(lessonId));

    res.json({ success: true, data: rate });
  } catch (error) {
    console.error('获取课程掌握率失败:', error);
    res.status(500).json({ success: false, message: '获取失败', error: error.message });
  }
});

router.post('/sync', async (req, res) => {
  try {
    const { masteryData } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(masteryData)) {
      return res.status(400).json({ success: false, message: 'masteryData 必须是数组' });
    }

    const results = { synced: 0, failed: 0, errors: [] };

    for (const item of masteryData) {
      try {
        const { lessonId, wordId } = item;

        if (!lessonId || !wordId) {
          results.failed++;
          results.errors.push({ item, error: '缺少 lessonId 或 wordId' });
          continue;
        }

        await WordMastery.markAsMastered(userId, lessonId, wordId);
        results.synced++;
      } catch (error) {
        results.failed++;
        results.errors.push({ item, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `同步完成：${results.synced} 个成功，${results.failed} 个失败`,
      data: results
    });
  } catch (error) {
    console.error('批量同步掌握状态失败:', error);
    res.status(500).json({ success: false, message: '同步失败', error: error.message });
  }
});

export default router;
