import express from 'express';
import UserSetting from '../models/UserSetting.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// 中间件：认证
router.use(authMiddleware);

/**
 * @route   GET /api/user-settings
 * @desc    获取用户设置
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const settings = await UserSetting.getUserSettings(userId);
    
    res.json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    console.error('获取用户设置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取设置失败',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/user-settings
 * @desc    保存用户设置
 * @access  Private
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: '无效的设置数据'
      });
    }
    
    await UserSetting.saveUserSettings(userId, settings);
    
    res.json({
      success: true,
      message: '设置已保存'
    });
  } catch (error) {
    console.error('保存用户设置失败:', error);
    res.status(500).json({
      success: false,
      message: '保存设置失败',
      error: error.message
    });
  }
});

export default router;
