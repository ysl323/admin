import { sequelize } from './src/config/database.js';
import Config from './src/models/Config.js';
import crypto from 'crypto';

// 使用正确的加密密钥
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

async function fixTTSConfig() {
  try {
    console.log('连接数据库...');
    await sequelize.authenticate();
    console.log('✓ 数据库连接成功');
    
    // ✅ 使用文档中验证成功的配置
    const correctConfig = {
      appId: '2128862431',  // ✅ 已验证可用的APP ID
      accessToken: 'eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq',  // ✅ 已验证可用的Access Token
      secretKey: '',  // 不使用Secret Key，使用Token认证
      endpoint: 'https://openspeech.bytedance.com/api/v1/tts',  // ✅ 正确的端点
      voiceType: 'BV001_streaming',
      language: 'en-US',
      cluster: 'volcano_tts',
      mode: 'simple'
    };
    
    console.log('\n更新火山引擎TTS配置...');
    console.log('APP ID:', correctConfig.appId);
    console.log('Access Token:', correctConfig.accessToken.substring(0, 10) + '...');
    console.log('Secret Key:', correctConfig.secretKey.substring(0, 10) + '...');
    
    // 更新配置
    await Config.upsert({ key: 'tts_provider', value: 'volcengine' });
    await Config.upsert({ key: 'volcengine_app_id', value: correctConfig.appId });
    await Config.upsert({ key: 'volcengine_api_key', value: encrypt(correctConfig.accessToken) });
    await Config.upsert({ key: 'volcengine_api_secret', value: '' });  // 不使用Secret Key
    await Config.upsert({ key: 'volcengine_endpoint', value: correctConfig.endpoint });
    await Config.upsert({ key: 'volcengine_voice_type', value: correctConfig.voiceType });
    await Config.upsert({ key: 'volcengine_language', value: correctConfig.language });
    await Config.upsert({ key: 'volcengine_cluster', value: correctConfig.cluster });
    await Config.upsert({ key: 'volcengine_mode', value: correctConfig.mode });
    
    console.log('✓ 配置更新成功');
    
    // 验证配置
    console.log('\n验证配置...');
    const configs = await Config.findAll({
      where: {
        key: [
          'tts_provider',
          'volcengine_app_id',
          'volcengine_endpoint',
          'volcengine_voice_type',
          'volcengine_language',
          'volcengine_cluster',
          'volcengine_mode'
        ]
      }
    });
    
    console.log('\n当前配置:');
    configs.forEach(config => {
      console.log(`  ${config.key}: ${config.value}`);
    });
    
    console.log('\n✅ 修复完成!');
    console.log('\n下一步:');
    console.log('  1. 重启后端: pm2 restart english-learning-backend');
    console.log('  2. 测试TTS功能');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

fixTTSConfig();
