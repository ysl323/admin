/**
 * 更新为正确的火山引擎 TTS 配置
 */

import { Config } from './src/models/index.js';
import encryptionUtil from './src/utils/encryption.js';

async function updateConfig() {
  try {
    console.log('更新火山引擎 TTS 配置为正确的值...\n');

    // 正确的配置
    const correctConfig = {
      appId: '2128862431',
      accessToken: 'eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq',
      endpoint: 'https://openspeech.bytedance.com/api/v1/tts',  // 正确的端点
      voiceType: 'BV001_streaming',
      cluster: 'volcano_tts'
    };

    // 更新配置
    await Config.upsert({
      key: 'volcengine_app_id',
      value: correctConfig.appId
    });

    await Config.upsert({
      key: 'volcengine_api_key',
      value: encryptionUtil.encrypt(correctConfig.accessToken)
    });

    await Config.upsert({
      key: 'volcengine_endpoint',
      value: correctConfig.endpoint
    });

    await Config.upsert({
      key: 'volcengine_voice_type',
      value: correctConfig.voiceType
    });

    await Config.upsert({
      key: 'volcengine_cluster',
      value: correctConfig.cluster
    });

    // 清除 Secret Key (Token 认证不需要)
    await Config.destroy({
      where: { key: 'volcengine_api_secret' }
    });

    console.log('✅ 配置更新成功！\n');
    console.log('新配置:');
    console.log('  AppID:', correctConfig.appId);
    console.log('  Access Token:', correctConfig.accessToken);
    console.log('  Endpoint:', correctConfig.endpoint);
    console.log('  Voice Type:', correctConfig.voiceType);
    console.log('  Cluster:', correctConfig.cluster);
    console.log('\n关键修复:');
    console.log('  1. ✅ API端点改为: /api/v1/tts');
    console.log('  2. ✅ token字段使用真实的 access_token');
    console.log('  3. ✅ 使用已验证可用的凭据');

    process.exit(0);
  } catch (error) {
    console.error('❌ 更新配置失败:', error);
    process.exit(1);
  }
}

updateConfig();
