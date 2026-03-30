import bcrypt from 'bcryptjs';

/**
 * 密码服务类
 * 提供密码加密、验证和规则检查功能
 */
class PasswordService {
  constructor() {
    this.saltRounds = 10; // bcrypt 加密轮数
  }

  /**
   * 加密密码
   * @param {string} password - 明文密码
   * @returns {Promise<string>} 加密后的密码哈希
   */
  async hash(password) {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      return hash;
    } catch (error) {
      throw new Error(`密码加密失败: ${error.message}`);
    }
  }

  /**
   * 验证密码
   * @param {string} password - 明文密码
   * @param {string} hash - 密码哈希
   * @returns {Promise<boolean>} 密码是否匹配
   */
  async verify(password, hash) {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      throw new Error(`密码验证失败: ${error.message}`);
    }
  }

  /**
   * 验证密码规则
   * @param {string} password - 密码
   * @throws {Error} 如果密码不符合规则
   */
  validate(password) {
    // 规则：至少 6 个字符
    if (!password || password.length < 6) {
      throw new Error('密码长度至少为 6 个字符');
    }

    // 可选：添加更强的密码规则
    // if (!/[A-Z]/.test(password)) {
    //   throw new Error('密码必须包含至少一个大写字母');
    // }
    // if (!/[a-z]/.test(password)) {
    //   throw new Error('密码必须包含至少一个小写字母');
    // }
    // if (!/[0-9]/.test(password)) {
    //   throw new Error('密码必须包含至少一个数字');
    // }

    return true;
  }

  /**
   * 生成随机密码
   * @param {number} length - 密码长度
   * @returns {string} 随机密码
   */
  generateRandomPassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
}

export default new PasswordService();
