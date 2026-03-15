/**
 * 初始化 TTS 配置脚本
 * 配置火山引擎 TTS 和谷歌 TTS
 */

import { sequelize } from './src/config/database.js';
import Config from './src/models/Config.js';
import crypto from 'crypto';

// 加密工具
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

async function initTTSConfig() {
  try {
    console.log('🚀 开始初始化 TTS 配置...\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 火山引擎 TTS 配置
    const volcengineConfig = [
      { key: 'tts_provider', value: 'volcengine' },
      { key: 'volcengine_app_id', value: '8594935941' },
      { key: 'volcengine_api_key', value: encrypt('sRWjJ3dvQhY4ZnyqYgdj331lQ2WkNPL') },
      { key: 'volcengine_api_secret', value: encrypt('hLY8jzW6WNguVHyZovHBPMkXt_4ZLdFR') },
      { key: 'volcengine_endpoint', value: 'https://openspeech.bytedance.com/api/v1/tts' },
      { key: 'volcengine_voice_type', value: 'BV001_streaming' },
      { key: 'volcengine_language', value: 'en-US' },
      { key: 'volcengine_cluster', value: 'volcano_tts' },
      { key: 'volcengine_mode', value: 'simple' }
    ];

    console.log('📝 保存火山引擎 TTS 配置...');
    for (const config of volcengineConfig) {
      await Config.upsert(config);
      console.log(`  ✓ ${config.key}`);
    }
    console.log('✅ 火山引擎 TTS 配置完成\n');

    // 谷歌 TTS 配置（使用空值，需要用户自己配置 API Key）
    const googleConfig = [
      { key: 'google_api_key', value: '' },
      { key: 'google_language_code', value: 'en-US' },
      { key: 'google_voice_name', value: 'en-US-Wavenet-D' },
      { key: 'google_speaking_rate', value: '1.0' }
    ];

    console.log('📝 保存谷歌 TTS 配置...');
    for (const config of googleConfig) {
      await Config.upsert(config);
      console.log(`  ✓ ${config.key}`);
    }
    console.log('✅ 谷歌 TTS 配置完成\n');

    // 显示配置摘要
    console.log('📊 配置摘要:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 火山引擎 TTS (默认提供商)');
    console.log('   APP ID: 8594935941');
    console.log('   Access Token: sRWj**** (已加密)');
    console.log('   Secret Key: hLY8**** (已加密)');
    console.log('   Endpoint: https://openspeech.bytedance.com/api/v1/tts');
    console.log('   Voice Type: BV001_streaming');
    console.log('   Language: en-US');
    console.log('');
    console.log('🌐 谷歌 TTS (备用提供商)');
    console.log('   API Key: (未配置 - 需要在管理后台设置)');
    console.log('   Language: en-US');
    console.log('   Voice: en-US-Wavenet-D');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ TTS 配置初始化完成！');
    console.log('');
    console.log('📌 下一步:');
    console.log('   1. 重启后端服务: pm2 restart english-learning-backend');
    console.log('   2. 访问管理后台测试 TTS 功能');
    console.log('   3. 如需使用谷歌 TTS，请在管理后台配置 API Key');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    console.error('');
    console.error('错误详情:', error.message);
    console.error('');
    console.error('请检查:');
    console.error('  1. 数据库文件是否存在');
    console.error('  2. 数据库连接配置是否正确');
    console.error('  3. Config 表是否已创建');
    console.error('');
    process.exit(1);
  }
}

// 运行初始化
initTTSConfig();
