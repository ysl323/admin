import crypto from 'crypto';

/**
 * 加密解密工具类
 * 使用 AES-256-CBC 算法加密敏感配置
 */
class EncryptionUtil {
  constructor() {
    // 从环境变量获取加密密钥，如果没有则使用默认密钥（生产环境必须设置）
    this.secretKey = process.env.ENCRYPTION_KEY || 'default-secret-key-change-in-production-32bytes';
    // 确保密钥长度为32字节
    this.key = crypto.createHash('sha256').update(this.secretKey).digest();
    this.algorithm = 'aes-256-cbc';
  }

  /**
   * 加密文本
   * @param {string} text - 要加密的文本
   * @returns {string} 加密后的文本（格式：iv:encryptedData）
   */
  encrypt(text) {
    if (!text) return '';
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 返回格式：iv:encryptedData
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * 解密文本
   * @param {string} encryptedText - 加密的文本（格式：iv:encryptedData）
   * @returns {string} 解密后的文本
   */
  decrypt(encryptedText) {
    if (!encryptedText) return '';
    
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted text format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedData = parts[1];
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

export default new EncryptionUtil();
