import express from 'express';
import TTSService from '../services/TTSService.js';
import AdminService from '../services/AdminService.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/tts/audio/:filename
 * 获取音频文件
 * 需要登录
 */
router.get('/audio/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;
    
    const audioData = await TTSService.getAudioFile(filename);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioData.length,
      'Cache-Control': 'public, max-age=31536000' // 缓存1年
    });
    
    res.send(audioData);
  } catch (error) {
    logger.error(`获取音频文件失败: ${req.params.filename}`, error);
    
    if (error.message === '音频文件不存在' || error.message === 'Invalid filename') {
      return res.status(404).json({
        success: false,
        message: '音频文件不存在'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '获取音频文件失败'
    });
  }
});

/**
 * POST /api/tts/synthesize
 * 合成语音（获取音频URL）
 * 需要登录
 */
router.post('/synthesize', authMiddleware, async (req, res) => {
  try {
    const { text, wordId } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: '文本不能为空'
      });
    }
    
    const audioUrl = await TTSService.getAudioUrl(text, wordId);
    
    res.json({
      success: true,
      audioUrl
    });
  } catch (error) {
    logger.error('合成语音失败:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || '合成语音失败'
    });
  }
});

/**
 * GET /api/tts/speak
 * 直接获取语音音频流（用于前端 Audio 标签）
 * 需要登录
 * 查询参数: text - 要转换的文本
 */
router.get('/speak', authMiddleware, async (req, res) => {
  try {
    const { text } = req.query;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: '文本不能为空'
      });
    }
    
    // 获取音频数据
    const audioBuffer = await TTSService.getVolcengineAudio(text);
    
    // 设置响应头
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400' // 缓存1天
    });
    
    // 返回音频流
    res.send(audioBuffer);
  } catch (error) {
    logger.error('获取语音失败:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || '获取语音失败'
    });
  }
});

/**
 * POST /api/tts/speak
 * 直接获取语音音频流（用于前端 Audio 标签）
 * 需要登录
 * 请求体: { text: string } - 要转换的文本
 */
router.post('/speak', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: '文本不能为空'
      });
    }
    
    // 获取音频数据
    const audioBuffer = await TTSService.getVolcengineAudio(text);
    
    // 设置响应头
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
      'Cache-Control': 'public, max-age=86400' // 缓存1天
    });
    
    // 返回音频流
    res.send(audioBuffer);
  } catch (error) {
    logger.error('获取语音失败:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || '获取语音失败'
    });
  }
});

// ==================== 管理员接口 ====================

/**
 * GET /api/tts/admin/config
 * 获取TTS配置
 * 需要管理员权限
 */
router.get('/admin/config', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = await AdminService.getTTSConfig();
    
    res.json({
      success: true,
      config
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
 * PUT /api/tts/admin/config
 * 保存TTS配置
 * 需要管理员权限
 */
router.put('/admin/config', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const config = req.body;
    
    await AdminService.saveTTSConfig(config);
    
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

/**
 * GET /api/tts/admin/files
 * 获取音频文件列表
 * 需要管理员权限
 */
router.get('/admin/files', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const files = await TTSService.listAudioFiles();
    
    res.json({
      success: true,
      files,
      total: files.length
    });
  } catch (error) {
    logger.error('获取音频文件列表失败:', error);
    
    res.status(500).json({
      success: false,
      message: '获取音频文件列表失败'
    });
  }
});

/**
 * DELETE /api/tts/admin/cache/:word
 * 删除指定单词的音频缓存
 * 需要管理员权限
 */
router.delete('/admin/cache/:word', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { word } = req.params;
    
    const success = await TTSService.deleteAudioCache(word);
    
    if (success) {
      res.json({
        success: true,
        message: '音频缓存删除成功'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '音频缓存删除失败'
      });
    }
  } catch (error) {
    logger.error(`删除音频缓存失败: ${req.params.word}`, error);
    
    res.status(500).json({
      success: false,
      message: '删除音频缓存失败'
    });
  }
});

/**
 * POST /api/tts/admin/cache/batch-delete
 * 批量删除音频缓存
 * 需要管理员权限
 */
router.post('/admin/cache/batch-delete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { words } = req.body;
    
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        message: '单词列表不能为空'
      });
    }
    
    const results = await TTSService.batchDeleteAudioCache(words);
    
    res.json({
      success: true,
      message: `批量删除完成: 成功 ${results.success.length}, 失败 ${results.failed.length}`,
      results
    });
  } catch (error) {
    logger.error('批量删除音频缓存失败:', error);
    
    res.status(500).json({
      success: false,
      message: '批量删除音频缓存失败'
    });
  }
});

export default router;
