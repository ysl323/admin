import { Config } from './src/models/index.js';

async function checkTTSData() {
  try {
    console.log('检查数据库中的 TTS 配置原始数据...\n');
    
    const configs = await Config.findAll({
      where: {
        key: [
          'volcengine_app_id',
          'volcengine_api_key',
          'volcengine_api_secret',
          'volcengine_endpoint',
          'volcengine_voice_type',
          'volcengine_cluster'
        ]
      }
    });

    console.log('找到配置项:', configs.length);
    configs.forEach(config => {
      console.log(`\n${config.key}:`);
      console.log(`  值: ${config.value}`);
      console.log(`  长度: ${config.value ? config.value.length : 0}`);
      console.log(`  包含冒号: ${config.value ? config.value.includes(':') : false}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('检查失败:', error);
    process.exit(1);
  }
}

checkTTSData();
