/**
 * 更新火山引擎 TTS 凭据到正确的值
 * 根据用户文档中的已验证凭据
 */

import { Config, sequelize } from './src/models/index.js';
import encryptionUtil from './src/utils/encryption.js';

async function updateCredentials() {
  try {
    console.log('=== 更新火山引擎 TTS 凭据 ===\n');
    
    // 正确的凭据（来自用户文档）
    const correctCredentials = {
      appId: '2128862431',
      accessToken: 'eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq',
      endpoint: 'https://openspeech.bytedance.com/tts_middle_layer/tts',
      voiceType: 'BV001_streaming',
      cluster: 'volcano_tts',
      mode: 'simple'
    };
    
    console.log('正确的凭据:');
    console.log('  AppID:', correctCredentials.appId);
    console.log('  Access Token:', correctCredentials.accessToken);
    console.log('  Endpoint:', correctCredentials.endpoint);
    console.log('  Voice Type:', correctCredentials.voiceType);
    console.log('  Cluster:', correctCredentials.cluster);
    console.log('  Mode:', correctCredentials.mode);
    console.log('');
    
    // 查询当前配置
    console.log('1. 查询当前配置...');
    const currentConfigs = await Config.findAll({
      where: {
        key: [
          'volcengine_app_id',
          'volcengine_api_key',
          'volcengine_endpoint',
          'volcengine_voice_type',
          'volcengine_cluster',
          'volcengine_mode'
        ]
      }
    });
    
    console.log('当前配置:');
    for (const config of currentConfigs) {
      let value = config.value;
      if (config.key === 'volcengine_api_key' && value) {
        try {
          value = encryptionUtil.decrypt(value);
        } catch (e) {
          value = '[解密失败]';
        }
      }
      console.log(`  ${config.key}: ${value}`);
    }
    console.log('');
    
    // 更新配置
    console.log('2. 更新配置...');
    
    const updates = [
      { key: 'volcengine_app_id', value: correctCredentials.appId },
      { key: 'volcengine_api_key', value: encryptionUtil.encrypt(correctCredentials.accessToken) },
      { key: 'volcengine_endpoint', value: correctCredentials.endpoint },
      { key: 'volcengine_voice_type', value: correctCredentials.voiceType },
      { key: 'volcengine_cluster', value: correctCredentials.cluster },
      { key: 'volcengine_mode', value: correctCredentials.mode },
      { key: 'tts_provider', value: 'volcengine' }
    ];
    
    for (const update of updates) {
      await Config.upsert(update);
      console.log(`  ✓ 更新 ${update.key}`);
    }
    
    console.log('');
    console.log('3. 验证更新后的配置...');
    
    const updatedConfigs = await Config.findAll({
      where: {
        key: [
          'volcengine_app_id',
          'volcengine_api_key',
          'volcengine_endpoint',
          'volcengine_voice_type',
          'volcengine_cluster',
          'volcengine_mode'
        ]
      }
    });
    
    console.log('更新后的配置:');
    for (const config of updatedConfigs) {
      let value = config.value;
      if (config.key === 'volcengine_api_key' && value) {
        try {
          const decrypted = encryptionUtil.decrypt(value);
          value = `${decrypted.substring(0, 4)}****${decrypted.substring(decrypted.length - 4)}`;
        } catch (e) {
          value = '[解密失败]';
        }
      }
      console.log(`  ${config.key}: ${value}`);
    }
    
    console.log('');
    console.log('=== 更新完成 ===');
    
    process.exit(0);
  } catch (error) {
    console.error('更新失败:', error);
    process.exit(1);
  }
}

updateCredentials();
