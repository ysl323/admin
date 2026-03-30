import { Config } from './src/models/index.js';

async function fixEndpoint() {
  try {
    console.log('修复 TTS Endpoint\n');
    
    const correctEndpoint = 'https://openspeech.bytedance.com/api/v1/tts';
    
    console.log('当前 endpoint:');
    const current = await Config.findOne({
      where: { key: 'volcengine_endpoint' }
    });
    console.log('  ', current?.value || '未设置');
    
    console.log('\n更新为正确的 endpoint:');
    console.log('  ', correctEndpoint);
    
    await Config.upsert({
      key: 'volcengine_endpoint',
      value: correctEndpoint
    });
    
    console.log('\n✅ Endpoint 已更新！');
    console.log('请重启后端服务：pm2 restart english-learning-backend');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 修复失败:', error);
    process.exit(1);
  }
}

fixEndpoint();
