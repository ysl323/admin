import { Config } from './src/models/index.js';

async function fixTTSToken() {
  try {
    console.log('修复 TTS 配置 - 使用明文存储 Access Token\n');
    
    // 用户验证过的正确配置
    const correctConfig = {
      appId: '2128862431',
      accessToken: 'eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq',
      voiceType: 'BV001_streaming',
      cluster: 'volcano_tts',
      endpoint: 'https://openspeech.bytedance.com/api/v1/tts'
    };

    console.log('更新配置到数据库（明文存储）...');
    
    // 直接存储明文，不加密
    await Config.upsert({
      key: 'volcengine_app_id',
      value: correctConfig.appId
    });
    
    await Config.upsert({
      key: 'volcengine_api_key',
      value: correctConfig.accessToken  // 明文存储
    });
    
    await Config.upsert({
      key: 'volcengine_api_secret',
      value: ''  // 清空，使用 Token 认证不需要
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
    
    await Config.upsert({
      key: 'volcengine_mode',
      value: 'simple'
    });
    
    await Config.upsert({
      key: 'tts_provider',
      value: 'volcengine'
    });

    console.log('\n✅ 配置更新成功！');
    console.log('\n当前配置:');
    console.log('  App ID:', correctConfig.appId);
    console.log('  Access Token:', correctConfig.accessToken);
    console.log('  Voice Type:', correctConfig.voiceType);
    console.log('  Cluster:', correctConfig.cluster);
    console.log('  Endpoint:', correctConfig.endpoint);
    
    console.log('\n验证配置...');
    const configs = await Config.findAll({
      where: {
        key: [
          'volcengine_app_id',
          'volcengine_api_key',
          'volcengine_endpoint',
          'volcengine_voice_type',
          'volcengine_cluster'
        ]
      }
    });
    
    console.log('\n数据库中的配置:');
    configs.forEach(config => {
      console.log(`  ${config.key}: ${config.value}`);
    });
    
    console.log('\n✅ 完成！请重启后端服务：pm2 restart english-learning-backend');
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

fixTTSToken();
