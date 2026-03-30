/**
 * 测试更新后的火山引擎 TTS 配置
 */

import TTSService from './src/services/TTSService.js';

async function testTTS() {
  try {
    console.log('=== 测试火山引擎 TTS（更新后的凭据）===\n');
    
    const testText = 'Hello, this is a test.';
    console.log(`测试文本: "${testText}"\n`);
    
    console.log('发送请求...');
    const result = await TTSService.testVolcengineTTS(testText);
    
    console.log('\n测试结果:');
    console.log('  Success:', result.success);
    console.log('  Message:', result.message);
    
    if (result.code) {
      console.log('  Code:', result.code);
    }
    
    if (result.data) {
      console.log('  Data:', JSON.stringify(result.data, null, 2));
    }
    
    if (result.details) {
      console.log('  Details:', JSON.stringify(result.details, null, 2));
    }
    
    if (result.success) {
      console.log('\n✓ TTS 配置测试成功!');
    } else {
      console.log('\n✗ TTS 配置测试失败');
    }
    
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('\n测试异常:', error.message);
    process.exit(1);
  }
}

testTTS();
