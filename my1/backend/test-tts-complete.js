import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testTTS() {
  try {
    console.log('=== 完整 TTS 测试 ===\n');
    
    // 1. 登录获取 session
    console.log('步骤 1: 登录...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      withCredentials: true,
      validateStatus: () => true
    });
    
    if (loginResponse.status !== 200) {
      console.error('❌ 登录失败:', loginResponse.status, loginResponse.data);
      process.exit(1);
    }
    
    const cookies = loginResponse.headers['set-cookie'];
    console.log('✅ 登录成功');
    console.log('Session Cookie:', cookies ? cookies[0].split(';')[0] : '无');
    
    // 2. 测试 TTS
    console.log('\n步骤 2: 测试 TTS API...');
    const ttsResponse = await axios.post(`${BASE_URL}/api/tts/speak`, {
      text: 'Hello, this is a test.'
    }, {
      headers: {
        'Cookie': cookies ? cookies.join('; ') : '',
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer',
      validateStatus: () => true,
      timeout: 10000
    });
    
    console.log('HTTP Status:', ttsResponse.status);
    console.log('Content-Type:', ttsResponse.headers['content-type']);
    
    if (ttsResponse.status === 200) {
      const audioSize = ttsResponse.data.length;
      console.log('音频大小:', audioSize, 'bytes');
      
      if (audioSize > 1000) {
        console.log('\n✅ TTS 测试成功！');
        console.log('音频数据已正确返回');
      } else {
        console.log('\n⚠️  返回的数据太小，可能不是音频');
        console.log('响应内容:', ttsResponse.data.toString().substring(0, 200));
      }
    } else {
      console.log('\n❌ TTS 测试失败');
      const responseText = ttsResponse.data.toString();
      console.log('响应:', responseText.substring(0, 500));
    }
    
    process.exit(ttsResponse.status === 200 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ 测试异常:', error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应:', error.response.data ? error.response.data.toString().substring(0, 500) : '无');
    }
    process.exit(1);
  }
}

testTTS();
