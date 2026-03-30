/**
 * 更新为新的火山引擎凭据
 */

import { Config } from './src/models/index.js';
import encryptionUtil from './src/utils/encryption.js';

async function updateCredentials() {
  try {
    console.log('=== 更新火山引擎 TTS 凭据 ===\n');
    
    // 新的凭据
    const newCredentials = {
      appId: '2322585992',
      accessToken: 'xBnUT-Z-cTY2OWrRLPFhvLw-zdMtmWys',
      secretKey: 'MkJ8GxK_4PZcsuxBXSAZw1CkUa1JJh_F',
      endpoint: 'https://openspeech.bytedance.com/tts_middle_layer/tts',
      voiceType: 'BV001_streaming',
      cluster: 'volcano_tts',
      mode: 'simple'
    };
    
    console.log('新凭据:');
    console.log('  AppID:', newCredentials.appId);
    console.log('  Access Token:', newCredentials.accessToken);
    console.log('  Secret Key:', newCredentials.secretKey);
    console.log('');
    
    // 更新配置
    console.log('更新配置...');
    
    const updates = [
      { key: 'volcengine_app_id', value: newCredentials.appId },
      { key: 'volcengine_api_key', value: encryptionUtil.encrypt(newCredentials.accessToken) },
      { key: 'volcengine_api_secret', value: encryptionUtil.encrypt(newCredentials.secretKey) },
      { key: 'volcengine_endpoint', value: newCredentials.endpoint },
      { key: 'volcengine_voice_type', value: newCredentials.voiceType },
      { key: 'volcengine_cluster', value: newCredentials.cluster },
      { key: 'volcengine_mode', value: newCredentials.mode },
      { key: 'tts_provider', value: 'volcengine' }
    ];
    
    for (const update of updates) {
      await Config.upsert(update);
      console.log(`  ✓ 更新 ${update.key}`);
    }
    
    console.log('');
    console.log('✓ 配置更新完成!');
    console.log('');
    console.log('注意: 由于提供了 Secret Key, 系统将使用签名认证方式');
    
    process.exit(0);
  } catch (error) {
    console.error('更新失败:', error);
    process.exit(1);
  }
}

updateCredentials();
