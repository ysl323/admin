import { User } from '../models/index.js';
import { Op } from 'sequelize';
import PasswordService from './PasswordService.js';
import logger from '../utils/logger.js';

/**
 * 用户服务类
 * 提供用户管理和访问权限控制功能
 */
class UserService {
  /**
   * 格式化IP地址显示
   * @param {string} ip - IP地址
   * @returns {string} 格式化后的IP
   */
  formatIp(ip) {
    if (!ip) return '-';
    // 将IPv6的localhost转换为更友好的显示
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
   * 检查用户访问权限
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 访问权限状态
   */
  async checkAccess(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        return {
          hasAccess: false,
          reason: '用户不存在',
          accessDays: 0
        };
      }

      if (!user.isActive) {
        return {
          hasAccess: false,
          reason: '账号已被禁用',
          accessDays: user.accessDays
        };
      }

      if (user.accessDays <= 0) {
        return {
          hasAccess: false,
          reason: '试用已到期，请联系管理员开通使用权限',
          accessDays: 0
        };
      }

      return {
        hasAccess: true,
        reason: '访问权限正常',
        accessDays: user.accessDays,
        expireDate: user.expireDate
      };
    } catch (error) {
      logger.error('检查访问权限失败:', error);
      throw error;
    }
  }

  /**
   * 每日递减访问天数（定时任务调用）
   * @returns {Promise<Object>} 递减结果
   */
  async decrementAccessDays() {
    try {
      logger.info('开始执行每日天数递减任务...');

      // 查找所有 accessDays > 0 的活跃用户
      const users = await User.findAll({
        where: {
          accessDays: {
            [Op.gt]: 0
          },
          isActive: true
        }
      });

      let decrementedCount = 0;
      let expiredCount = 0;

      // 逐个递减
      for (const user of users) {
        const oldDays = user.accessDays;
        user.accessDays = Math.max(0, user.accessDays - 1);
        await user.save();

        decrementedCount++;

        if (user.accessDays === 0) {
          expiredCount++;
          logger.info(`用户 ${user.username} 访问权限已到期`);
        }

        logger.debug(`用户 ${user.username}: ${oldDays} 天 -> ${user.accessDays} 天`);
      }

      const result = {
        success: true,
        decrementedCount,
        expiredCount,
        timestamp: new Date()
      };

      logger.info(
        `每日天数递减任务完成: 处理 ${decrementedCount} 个用户，${expiredCount} 个用户到期`
      );

      return result;
    } catch (error) {
      logger.error('每日天数递减任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有用户列表
   * @returns {Promise<Array>} 用户列表
   */
  async getAllUsers() {
    try {
      const users = await User.findAll({
        attributes: [
          'id',
          'username',
          'accessDays',
          'isActive',
          'isAdmin',
          'registerIp',
          'lastLoginIp',
          'createdAt',
          'updatedAt'
        ],
        order: [['createdAt', 'DESC']]
      });

      return users.map((user) => ({
        id: user.id,
        username: user.username,
        accessDays: user.accessDays,
        expireDate: user.expireDate,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        lastLoginIp: this.formatIp(user.lastLoginIp),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户详情
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 用户详情
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: [
          'id',
          'username',
          'accessDays',
          'isActive',
          'isAdmin',
          'createdAt',
          'updatedAt'
        ]
      });

      if (!user) {
        throw new Error('用户不存在');
      }

      return {
        id: user.id,
        username: user.username,
        accessDays: user.accessDays,
        expireDate: user.expireDate,
        isActive: user.isActive,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      logger.error('获取用户详情失败:', error);
      throw error;
    }
  }

  /**
   * 增加用户访问天数
   * @param {number} userId - 用户 ID
   * @param {number} days - 增加的天数
   * @returns {Promise<Object>} 更新结果
   */
  async updateAccessDays(userId, days) {
    try {
      if (!days || days <= 0) {
        throw new Error('天数必须大于 0');
      }

      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('用户不存在');
      }

      const oldDays = user.accessDays;
      user.accessDays = user.accessDays + days;
      await user.save();

      logger.info(`管理员增加用户 ${user.username} 访问天数: ${oldDays} -> ${user.accessDays}`);

      return {
        success: true,
        message: `成功增加 ${days} 天`,
        oldAccessDays: oldDays,
        newAccessDays: user.accessDays
      };
    } catch (error) {
      logger.error('增加访问天数失败:', error);
      throw error;
    }
  }

  /**
   * 修改用户名
   * @param {number} userId - 用户 ID
   * @param {string} newUsername - 新用户名
   * @returns {Promise<Object>} 修改结果
   */
  async updateUsername(userId, newUsername) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('用户不存在');
      }

      // 检查新用户名是否已存在
      const existingUser = await User.findOne({ where: { username: newUsername } });
      if (existingUser && existingUser.id !== userId) {
        throw new Error('用户名已存在');
      }

      const oldUsername = user.username;
      user.username = newUsername;
      await user.save();

      logger.info(`管理员修改用户名: ${oldUsername} -> ${newUsername}`);

      return {
        success: true,
        message: '用户名修改成功',
        user: {
          id: user.id,
          username: user.username
        }
      };
    } catch (error) {
      logger.error('修改用户名失败:', error);
      throw error;
    }
  }

  /**
   * 重置用户密码
   * @param {number} userId - 用户 ID
   * @param {string} newPassword - 新密码（可选，不提供则生成随机密码）
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(userId, newPassword = null) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('用户不存在');
      }

      // 如果没有提供新密码，生成随机密码
      if (!newPassword) {
        newPassword = PasswordService.generateRandomPassword(8);
      }

      // 验证密码规则
      PasswordService.validate(newPassword);

      // 加密新密码
      const passwordHash = await PasswordService.hash(newPassword);
      user.passwordHash = passwordHash;
      await user.save();

      logger.info(`管理员重置用户 ${user.username} 的密码`);

      return {
        success: true,
        message: '密码重置成功',
        newPassword: newPassword // 返回新密码（仅用于管理员通知用户）
      };
    } catch (error) {
      logger.error('重置密码失败:', error);
      throw error;
    }
  }

  /**
   * 切换用户账号状态（启用/禁用）
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object>} 切换结果
   */
  async toggleUserStatus(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('用户不存在');
      }

      // 不允许禁用管理员账号
      if (user.isAdmin) {
        throw new Error('不能禁用管理员账号');
      }

      user.isActive = !user.isActive;
      await user.save();

      const status = user.isActive ? '启用' : '禁用';
      logger.info(`管理员${status}用户 ${user.username}`);

      return {
        success: true,
        message: `账号已${status}`,
        isActive: user.isActive
      };
    } catch (error) {
      logger.error('切换用户状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getUserStats() {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const expiredUsers = await User.count({
        where: { accessDays: 0, isActive: true }
      });
      const adminUsers = await User.count({ where: { isAdmin: true } });

      return {
        totalUsers,
        activeUsers,
        expiredUsers,
        adminUsers
      };
    } catch (error) {
      logger.error('获取用户统计信息失败:', error);
      throw error;
    }
  }
}

export default new UserService();
