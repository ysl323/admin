/**
 * 更新TTS配置到数据库
 * 使用测试报告中验证可用的配置
 */
import { sequelize } from './backend/src/models/index.js';
import { Config } from './backend/src/models/index.js';

const TTS_CONFIG = {
  provider: 'volcengine',
  appId: '2128862431',
  accessToken: 'eoJGAyB7DH8MR4IQ_yhx3tUlAUtWBCCq',
  voiceType: 'BV001_streaming',
  cluster: 'volcano_tts',
  endpoint: 'https://openspeech.bytedance.com/api/v1/tts'
};

async function updateTTSConfig() {
  try {
    console.log('========================================');
    console.log('更新火山TTS配置');
    console.log('========================================');
    console.log('应用ID:', TTS_CONFIG.appId);
    console.log('访问令牌:', TTS_CONFIG.accessToken.substring(0, 10) + '...');
    console.log('音色:', TTS_CONFIG.voiceType);
    console.log('集群:', TTS_CONFIG.cluster);
    console.log('========================================\n');

    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 准备配置数据
    const configData = [
      { key: 'tts_provider', value: TTS_CONFIG.provider },
      { key: 'volcengine_app_id', value: TTS_CONFIG.appId },
      { key: 'volcengine_api_key', value: TTS_CONFIG.accessToken },
      { key: 'volcengine_endpoint', value: TTS_CONFIG.endpoint },
      { key: 'volcengine_voice_type', value: TTS_CONFIG.voiceType },
      { key: 'volcengine_language', value: 'zh-CN' },
      { key: 'volcengine_cluster', value: TTS_CONFIG.cluster },
      { key: 'volcengine_mode', value: 'simple' }
    ];

    // 使用事务更新配置
    const transaction = await sequelize.transaction();

    try {
      for (const item of configData) {
        await Config.upsert(item, { transaction });
        console.log(`✅ 已更新配置: ${item.key} = ${item.value}`);
      }

      await transaction.commit();
      console.log('\n========================================');
      console.log('✅ 所有配置更新成功！');
      console.log('========================================');
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    // 验证配置
    console.log('\n验证配置...');
    const configs = await Config.findAll({
      where: {
        key: [
          'tts_provider',
          'volcengine_app_id',
          'volcengine_api_key',
          'volcengine_voice_type',
          'volcengine_cluster'
        ]
      }
    });

    console.log('\n当前配置:');
    configs.forEach(config => {
      if (config.key === 'volcengine_api_key') {
        console.log(`  ${config.key}: ${config.value.substring(0, 10)}...`);
      } else {
        console.log(`  ${config.key}: ${config.value}`);
      }
    });

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

updateTTSConfig();
