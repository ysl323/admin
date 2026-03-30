import { sequelize } from './src/config/database.js';
import Config from './src/models/Config.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-encryption-key';

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0')),
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

async function updateToken() {
  try {
    console.log('🔄 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 在这里输入新的 Access Token
    const newAccessToken = process.argv[2];
    
    if (!newAccessToken) {
      console.error('');
      console.error('❌ 错误: 请提供新的 Access Token');
      console.error('');
      console.error('使用方法:');
      console.error('  node update-volcengine-token.js <新的Access Token>');
      console.error('');
      console.error('示例:');
      console.error('  node update-volcengine-token.js sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL');
      console.error('');
      console.error('📝 如何获取新 Token:');
      console.error('  1. 访问: https://console.volcengine.com/speech/service/8');
      console.error('  2. 登录你的火山引擎账号');
      console.error('  3. 找到 APP ID: 8594935941');
      console.error('  4. 生成新的 Access Token');
      console.error('  5. 复制 Token 并运行此脚本');
      console.error('');
      process.exit(1);
    }
    
    console.log('');
    console.log('🔐 正在加密并更新 Access Token...');
    
    await Config.upsert({
      key: 'volcengine_api_key',
      value: encrypt(newAccessToken)
    });
    
    console.log('✅ Acce