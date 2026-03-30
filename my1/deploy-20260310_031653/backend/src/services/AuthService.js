import { User } from '../models/index.js';
import PasswordService from './PasswordService.js';
import logger from '../utils/logger.js';
import { captchaStore } from '../routes/captcha.js';

/**
 * 认证服务类
 * 提供用户注册、登录、退出等功能
 */
class AuthService {
  /**
   * 格式化IP地址
   * @param {string} ip - IP地址
   * @returns {string} 格式化后的IP
   */
  formatIp(ip) {
    if (!ip) return null;
    // 将IPv6的localhost转换为IPv4
    if (ip === '::1' || ip === '::ffff:127.0.0.1') {
      return '127.0.0.1';
    }
    // 移除IPv6前缀
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} captchaId - 验证码ID
   * @param {string} captchaAnswer - 验证码答案
   * @param {string} ip - 注册IP
   * @returns {Promise<Object>} 注册结果
   */
  async register(username, password, captchaId, captchaAnswer, ip) {
    try {
      // 格式化IP
      const formattedIp = this.formatIp(ip);
      // 1. 验证输入
      if (!username || !password) {
        throw new Error('用户名和密码不能为空');
      }

      // 2. 验证验证码
      if (!captchaId || captchaAnswer === undefined) {
        throw new Error('请输入验证码');
      }

      const stored = captchaStore.get(captchaId);
      if (!stored) {
        throw new Error('验证码已过期，请刷新');
      }

      if (parseInt(captchaAnswer) !== stored.answer) {
        captchaStore.delete(captchaId);
        throw new Error('验证码错误');
      }

      // 验证通过，删除验证码
      captchaStore.delete(captchaId);

      // 去除首尾空格
      username = username.trim();

      if (username.length === 0) {
        throw new Error('用户名不能为空');
      }

      // 3. 验证密码规则
      PasswordService.validate(password);

      // 4. 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 5. 加密密码
      const passwordHash = await PasswordService.hash(password);

      // 6. 创建用户（自动赋予 3 天试用期）
      const user = await User.create({
        username,
        passwordHash,
        accessDays: 3, // 自动赠送 3 天
        isActive: true,
        isAdmin: false,
        registerIp: formattedIp,
        lastLoginIp: formattedIp  // 注册时也记录为最后登录IP
      });

      logger.info(`用户注册成功: ${username}, IP: ${formattedIp}`);

      return {
        success: true,
        message: '注册成功',
        user: {
          id: user.id,
          username: user.username,
          accessDays: user.accessDays
        }
      };
    } catch (error) {
      logger.error('用户注册失败:', error);
      throw error;
    }
  }

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @param {string} ip - 登录IP
   * @returns {Promise<Object>} 登录结果
   */
  async login(username, password, ip) {
    try {
      // 格式化IP
      const formattedIp = this.formatIp(ip);
      
      // 1. 验证输入
      if (!username || !password) {
        throw new Error('用户名和密码不能为空');
      }

      // 去除首尾空格
      username = username.trim();

      // 2. 查找用户
      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new Error('用户名或密码错误');
      }

      // 3. 验证密码
      const isPasswordValid = await PasswordService.verify(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('用户名或密码错误');
      }

      // 4. 检查账号状态
      if (!user.isActive) {
        throw new Error('账号已被禁用，请联系管理员');
      }

      // 5. 检查访问权限
      if (user.accessDays <= 0) {
        throw new Error('试用已到期，请联系管理员开通使用权限');
      }

      // 6. 更新最后登录IP
      await user.update({ lastLoginIp: formattedIp });

      logger.info(`用户登录成功: ${username}, IP: ${formattedIp}`);

      return {
        success: true,
        message: '登录成功',
        user: {
          id: user.id,
          username: user.username,
          accessDays: user.accessDays,
          isAdmin: user.isAdmin,
          isActive: user.isActive
        }
      };
    } catch (error) {
      logger.error('用户登录失败:', error);
      throw error;
    }
  }

  /**
   * 用户退出登录
   * @param {Object} session - Express session 对象
   * @returns {Promise<Object>} 退出结果
   */
  async logout(session) {
    return new Promise((resolve, reject) => {
      if (!session) {
        return resolve({ success: true, message: '已退出登录' });
      }

      session.destroy((err) => {
        if (err) {
          logger.error('退出登录失败:', err);
          return reject(new Error('退出登录失败'));
        }

        logger.info('用户退出登录');
        resolve({ success: true, message: '退出登录成功' });
      });
    });
  }

  /**
   * 检查认证状态
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 用户信息
   */
  async checkAuth(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('用户不存在');
      }

      if (!user.isActive) {
        throw new Error('账号已被禁用');
      }

      if (user.accessDays <= 0) {
        throw new Error('试用已到期');
      }

      return {
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          accessDays: user.accessDays,
          isAdmin: user.isAdmin,
          isActive: user.isActive
        }
      };
    } catch (error) {
      logger.error('检查认证状态失败:', error);
      throw error;
    }
  }

  /**
   * 检查管理员权限
   * @param {number} userId - 用户 ID
   * @returns {Promise<boolean>} 是否为管理员
   */
  async checkAdmin(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return false;
      }

      return user.isAdmin === true;
    } catch (error) {
      logger.error('检查管理员权限失败:', error);
      return false;
    }
  }
}

export default new AuthService();
