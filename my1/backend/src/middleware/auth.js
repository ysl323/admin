import { User } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * 认证中间件
 * 检查用户是否已登录
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // 检查 session 中是否有 userId
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 查找用户
    const user = await User.findByPk(req.session.userId);

    if (!user) {
      // 用户不存在，清除 session
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查账号状态
    if (!user.isActive) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: '账号已被禁用'
      });
    }

    // 检查访问权限
    if (user.accessDays <= 0) {
      return res.status(403).json({
        success: false,
        message: '试用已到期，请联系管理员开通使用权限'
      });
    }

    // 将用户信息附加到 request 对象
    req.user = {
      id: user.id,
      username: user.username,
      accessDays: user.accessDays,
      isAdmin: user.isAdmin,
      isActive: user.isActive
    };

    next();
  } catch (error) {
    logger.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 管理员权限中间件
 * 检查用户是否为管理员
 * 必须在 authMiddleware 之后使用
 */
export const adminMiddleware = async (req, res, next) => {
  try {
    // 检查是否已通过认证
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    // 检查是否为管理员
    if (!req.user.isAdmin) {
      logger.warn(`非管理员尝试访问管理接口: ${req.user.username}`);
      return res.status(403).json({
        success: false,
        message: '权限不足，仅管理员可访问'
      });
    }

    next();
  } catch (error) {
    logger.error('管理员权限中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

/**
 * 可选认证中间件
 * 如果用户已登录则附加用户信息，否则继续
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    if (req.session && req.session.userId) {
      const user = await User.findByPk(req.session.userId);

      if (user && user.isActive) {
        req.user = {
          id: user.id,
          username: user.username,
          accessDays: user.accessDays,
          isAdmin: user.isAdmin,
          isActive: user.isActive
        };
      }
    }

    next();
  } catch (error) {
    logger.error('可选认证中间件错误:', error);
    next(); // 即使出错也继续
  }
};
