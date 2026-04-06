import express from 'express';
import multer from 'multer';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import AudioCacheService from '../services/AudioCacheService.js';
import logger from '../utils/logger.js';
import { AudioCache } from '../models/index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 所有路由都需要管理员权限
router.use(authMiddleware);
router.use(adminMiddleware);

/**
 * GET /api/audio-cache/list
 * 获取缓存列表
 */
router.get('/list', async (req, res) => {
  try {
    const { search, provider, limit, offset, orderBy, order } = req.query;
    
    const result = await AudioCacheService.listCaches({
      search,
      provider,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
      orderBy: orderBy || 'createdAt',
      order: order || 'DESC'
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    logger.error('获取缓存列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取缓存列表失败'
    });
  }
});

/**
 * GET /api/audio-cache/statistics
 * 获取缓存统计信息
 */
router.get('/statistics', async (req, res) => {
  try {
    const stats = await AudioCacheService.getStatistics();

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
 * DELETE /api/audio-cache/:id
 * 删除单个缓存
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的缓存 ID'
      });
    }

    await AudioCacheService.deleteCache(id);

    res.json({
      success: true,
      message: '缓存删除成功'
    });
  } catch (error) {
    logger.error(`删除缓存失败: ${req.params.id}`, error);
    
    if (error.message === '缓存不存在') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '删除缓存失败'
    });
  }
});

/**
 * POST /api/audio-cache/batch-delete
 * 批量删除缓存
 */
router.post('/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的缓存 ID 列表'
      });
    }

    const results = await AudioCacheService.batchDeleteCaches(ids);

    res.json({
      success: true,
      message: `批量删除完成: 成功 ${results.success.length}, 失败 ${results.failed.length}`,
      results
    });
  } catch (error) {
    logger.error('批量删除缓存失败:', error);
    res.status(500).json({
      success: false,
      message: '批量删除缓存失败'
    });
  }
});

/**
 * POST /api/audio-cache/clear-all
 * 清空所有缓存
 */
router.post('/clear-all', async (req, res) => {
  try {
    const count = await AudioCacheService.clearAllCaches();

    res.json({
      success: true,
      message: `已清空所有缓存: ${count} 条记录`,
      count
    });
  } catch (error) {
    logger.error('清空缓存失败:', error);
    res.status(500).json({
      success: false,
      message: '清空缓存失败'
    });
  }
});

/**
 * GET /api/audio-cache/audio/:id
 * 获取缓存的音频文件(用于播放测试)
 */
router.get('/audio/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '无效的缓存 ID'
      });
    }

    const cache = await AudioCache.findByPk(id);
    
    if (!cache) {
      return res.status(404).json({
        success: false,
        message: '缓存不存在'
      });
    }

    const audioBuffer = await AudioCacheService.readCacheFile(cache);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(audioBuffer);
  } catch (error) {
    logger.error(`获取缓存音频失败: ${req.params.id}`, error);
    res.status(500).json({
      success: false,
      message: '获取音频失败'
    });
  }
});

/**
 * GET /api/audio-cache/export-files
 * 导出所有音频文件（ZIP格式）
 */
router.get('/export-files', async (req, res) => {
  try {
    const zipBuffer = await AudioCacheService.exportAllAudioFiles();
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="audio-cache-${Date.now()}.zip"`,
      'Content-Length': zipBuffer.length
    });

    res.send(zipBuffer);
  } catch (error) {
    logger.error('导出音频文件失败:', error);
    res.status(500).json({
      success: false,
      message: '导出音频文件失败'
    });
  }
});

/**
 * POST /api/audio-cache/import-files
 * 导入音频文件（ZIP格式）
 */
router.post('/import-files', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传 ZIP 文件'
      });
    }

    const result = await AudioCacheService.importAudioFiles(req.file.buffer);

    res.json({
      success: true,
      message: `导入完成: 成功 ${result.imported}, 跳过 ${result.skipped}, 失败 ${result.errors.length}`,
      result
    });
  } catch (error) {
    logger.error('导入音频文件失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '导入音频文件失败'
    });
  }
});

export default router;
