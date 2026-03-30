/**
 * 清除 Secret Key 配置
 * Token 认证不需要 Secret Key
 */

import { Config } from './src/models/index.js';

async function clearSecretKey() {
  try {
    console.log('=== 清除 Secret Key 配置 ===\n');
    
    // 查询当前的 Secret Key
    const secretKeyConfig = await Config.findOne({
      where: { key: 'volcengine_api_secret' }
    });
    
    if (secretKeyConfig) {
      console.log('找到 Secret Key 配置，正在删除...');
      await secretKeyConfig.destroy();
      console.log('✓ Secret Key 已删除');
    } else {
      console.log('未找到 Secret Key 配置');
    }
    
    console.log('\n=== 完成 ===');
    process.exit(0);
  } catch (error) {
    console.error('操作失败:', error);
    process.exit(1);
  }
}

clearSecretKey();
