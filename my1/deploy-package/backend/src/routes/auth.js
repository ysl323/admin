import express from 'express';
import AuthService from '../services/AuthService.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, captchaId, captchaAnswer } = req.body;

    // 获取用户IP
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const result = await AuthService.register(username, password, captchaId, captchaAnswer, ip);

    res.status(201).json(result);
  } catch (error) {
    logger.error('注册接口错误:', error);

    // 根据错误类型返回不同的状态码
    if (error.message.includes('已存在')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('验证码')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.message.includes('密码') || error.message.includes('用户名')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 获取用户IP
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const result = await AuthService.login(username, password, ip);

    // 登录成功，创建 session
    req.session.userId = result.user.id;
    req.session.isAdmin = result.user.isAdmin;

    res.json(result);
  } catch (error) {
    logger.error('登录接口错误:', error);

    // 统一返回错误信息，不暴露具体原因（安全考虑）
    if (
      error.message.includes('用户名或密码错误') ||
      error.message.includes('禁用') ||
      error.message.includes('到期')
    ) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

/**
 * POST /api/auth/logout
 * 用户退出登录
 */
router.post('/logout', async (req, res) => {
  try {
    await AuthService.logout(req.session);

    res.json({
      success: true,
      message: '退出登录成功'
    });
  } catch (error) {
    logger.error('退出登录接口错误:', error);

    res.status(500).json({
      success: false,
      message: '退出登录失败'
    });
  }
});

/**
 * GET /api/auth/check
 * 检查认证状态
 */
router.get('/check', authMiddleware, async (req, res) => {
  try {
    // authMiddleware 已经验证了用户，直接返回用户信息
    res.json({
      authenticated: true,
      user: req.user
    });
  } catch (error) {
    logger.error('检查认证状态接口错误:', error);

    res.status(500).json({
      success: false,
      message: '检查认证状态失败'
    });
  }
});

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    logger.error('获取用户信息接口错误:', error);

    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

export default router;
