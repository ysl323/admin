/**
 * 完整的验证码功能测试
 */

import axios from 'axios';

// 测试配置
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║     验证码功能完整测试                                  ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

async function testBackendCaptcha() {
  console.log('[测试 1/5] 测试后端验证码API...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/captcha`);
    if (response.data.success) {
      console.log('✅ 后端验证码API正常');
      console.log(`   验证码ID: ${response.data.captchaId}`);
      console.log(`   问题: ${response.data.question}`);
      return response.data;
    } else {
      console.log('❌ 后端验证码API返回失败');
      return null;
    }
  } catch (error) {
    console.log('❌ 后端验证码API请求失败:', error.message);
    return null;
  }
}

async function testFrontendProxy() {
  console.log('\n[测试 2/5] 测试前端代理...');
  try {
    const response = await axios.get(`${FRONTEND_URL}/api/captcha`);
    if (response.data.success) {
      console.log('✅ 前端代理正常');
      console.log(`   验证码ID: ${response.data.captchaId}`);
      console.log(`   问题: ${response.data.question}`);
      return response.data;
    } else {
      console.log('❌ 前端代理返回失败');
      return null;
    }
  } catch (error) {
    console.log('❌ 前端代理请求失败:', error.message);
    return null;
  }
}

async function testCaptchaVerify(captchaId, answer) {
  console.log('\n[测试 3/5] 测试验证码验证...');
  try {
    const response = await axios.post(`${BACKEND_URL}/api/captcha/verify`, {
      captchaId,
      answer
    });
    
    if (response.data.success) {
      console.log('✅ 验证码验证成功');
    } else {
      console.log('❌ 验证码验证失败:', response.data.message);
    }
    return response.data;
  } catch (error) {
    console.log('❌ 验证码验证请求失败:', error.message);
    return null;
  }
}

async function testRegisterWithCaptcha() {
  console.log('\n[测试 4/5] 测试注册流程（包含验证码）...');
  
  try {
    // 1. 获取验证码
    const captchaResponse = await axios.get(`${BACKEND_URL}/api/captcha`);
    if (!captchaResponse.data.success) {
      console.log('❌ 获取验证码失败');
      return;
    }
    
    const { captchaId, question } = captchaResponse.data;
    console.log(`   获取验证码: ${question}`);
    
    // 2. 计算答案
    const match = question.match(/(\d+)\s*\+\s*(\d+)/);
    if (!match) {
      console.log('❌ 无法解析验证码问题');
      return;
    }
    const answer = parseInt(match[1]) + parseInt(match[2]);
    console.log(`   计算答案: ${answer}`);
    
    // 3. 注册（使用随机用户名避免冲突）
    const username = `testuser_${Date.now()}`;
    const password = 'test123456';
    
    const registerResponse = await axios.post(`${BACKEND_URL}/api/auth/register`, {
      username,
      password,
      captchaId,
      captchaAnswer: answer
    });
    
    if (registerResponse.data.success) {
      console.log('✅ 注册成功');
      console.log(`   用户名: ${username}`);
    } else {
      console.log('❌ 注册失败:', registerResponse.data.message);
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ 注册请求失败:', error.response.data.message || error.message);
    } else {
      console.log('❌ 注册请求失败:', error.message);
    }
  }
}

async function testCORS() {
  console.log('\n[测试 5/5] 测试CORS配置...');
  try {
    const response = await axios.get(`${BACKEND_URL}/api/captcha`, {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    
    const corsHeader = response.headers['access-control-allow-origin'];
    if (corsHeader) {
      console.log('✅ CORS配置正常');
      console.log(`   允许的源: ${corsHeader}`);
    } else {
      console.log('⚠️  未找到CORS头，可能会有跨域问题');
    }
  } catch (error) {
    console.log('❌ CORS测试失败:', error.message);
  }
}

async function runAllTests() {
  try {
    // 测试1: 后端验证码API
    const backendCaptcha = await testBackendCaptcha();
    if (!backendCaptcha) {
      console.log('\n❌ 后端验证码API失败，停止测试');
      return;
    }
    
    // 测试2: 前端代理
    const frontendCaptcha = await testFrontendProxy();
    if (!frontendCaptcha) {
      console.log('\n⚠️  前端代理失败，但继续测试');
    }
    
    // 测试3: 验证码验证
    const question = backendCaptcha.question;
    const match = question.match(/(\d+)\s*\+\s*(\d+)/);
    if (match) {
      const correctAnswer = parseInt(match[1]) + parseInt(match[2]);
      await testCaptchaVerify(backendCaptcha.captchaId, correctAnswer);
    }
    
    // 测试4: 完整注册流程
    await testRegisterWithCaptcha();
    
    // 测试5: CORS
    await testCORS();
    
    console.log('\n════════════════════════════════════════════════════════');
    console.log('\n✅ 测试完成！\n');
    console.log('如果所有测试都通过，但浏览器仍显示"获取验证码失败"：');
    console.log('  1. 清除浏览器缓存 (Ctrl + Shift + Delete)');
    console.log('  2. 强制刷新页面 (Ctrl + F5)');
    console.log('  3. 打开开发者工具 (F12) 查看 Console 和 Network');
    console.log('  4. 检查是否有 JavaScript 错误');
    console.log('\n访问注册页面: http://localhost:5173/register\n');
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
runAllTests();
