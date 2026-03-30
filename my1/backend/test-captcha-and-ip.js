/**
 * 测试验证码和IP记录功能
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 测试验证码功能
async function testCaptcha() {
  console.log('\n========== 测试验证码功能 ==========\n');
  
  try {
    // 1. 获取验证码
    console.log('1. 获取验证码...');
    const captchaResponse = await api.get('/captcha');
    console.log('验证码响应:', captchaResponse.data);
    
    const { captchaId, question } = captchaResponse.data;
    console.log(`验证码问题: ${question}`);
    
    // 2. 计算答案
    const match = question.match(/(\d+)\s*\+\s*(\d+)/);
    if (!match) {
      throw new Error('无法解析验证码问题');
    }
    const answer = parseInt(match[1]) + parseInt(match[2]);
    console.log(`计算答案: ${answer}`);
    
    // 3. 测试正确答案
    console.log('\n2. 测试正确答案...');
    const verifyResponse = await api.post('/captcha/verify', {
      captchaId,
      answer
    });
    console.log('验证结果:', verifyResponse.data);
    
    // 4. 获取新验证码测试错误答案
    console.log('\n3. 测试错误答案...');
    const captcha2Response = await api.get('/captcha');
    const { captchaId: captchaId2 } = captcha2Response.data;
    
    const wrongVerifyResponse = await api.post('/captcha/verify', {
      captchaId: captchaId2,
      answer: 999
    });
    console.log('错误答案验证结果:', wrongVerifyResponse.data);
    
    // 5. 测试过期验证码
    console.log('\n4. 测试过期验证码...');
    const expiredVerifyResponse = await api.post('/captcha/verify', {
      captchaId: 'invalid-id',
      answer: 10
    });
    console.log('过期验证码验证结果:', expiredVerifyResponse.data);
    
    console.log('\n✅ 验证码功能测试完成\n');
    return true;
  } catch (error) {
    console.error('❌ 验证码测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试注册时IP记录
async function testRegisterWithIP() {
  console.log('\n========== 测试注册IP记录 ==========\n');
  
  try {
    // 1. 获取验证码
    console.log('1. 获取验证码...');
    const captchaResponse = await api.get('/captcha');
    const { captchaId, question } = captchaResponse.data;
    
    // 计算答案
    const match = question.match(/(\d+)\s*\+\s*(\d+)/);
    const answer = parseInt(match[1]) + parseInt(match[2]);
    
    // 2. 注册新用户
    const testUsername = `testuser_${Date.now()}`;
    console.log(`\n2. 注册用户: ${testUsername}`);
    
    const registerResponse = await api.post('/auth/register', {
      username: testUsername,
      password: 'test123456',
      captchaId,
      captchaAnswer: answer
    });
    
    console.log('注册响应:', registerResponse.data);
    
    if (registerResponse.data.success) {
      console.log('✅ 注册成功');
      return testUsername;
    } else {
      console.log('❌ 注册失败');
      return null;
    }
  } catch (error) {
    console.error('❌ 注册测试失败:', error.response?.data || error.message);
    return null;
  }
}

// 测试登录时IP记录
async function testLoginWithIP(username) {
  console.log('\n========== 测试登录IP记录 ==========\n');
  
  try {
    console.log(`1. 登录用户: ${username}`);
    
    const loginResponse = await api.post('/auth/login', {
      username,
      password: 'test123456'
    });
    
    console.log('登录响应:', loginResponse.data);
    
    if (loginResponse.data.success) {
      console.log('✅ 登录成功');
      return true;
    } else {
      console.log('❌ 登录失败');
      return false;
    }
  } catch (error) {
    console.error('❌ 登录测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 测试管理员查看用户IP
async function testAdminViewUserIP() {
  console.log('\n========== 测试管理员查看用户IP ==========\n');
  
  try {
    // 1. 使用管理员账号登录
    console.log('1. 管理员登录...');
    const loginResponse = await api.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ 管理员登录失败');
      return false;
    }
    
    console.log('✅ 管理员登录成功');
    
    // 2. 获取用户列表
    console.log('\n2. 获取用户列表...');
    const usersResponse = await api.get('/admin/users');
    
    if (usersResponse.data.success) {
      const users = usersResponse.data.users;
      console.log(`\n找到 ${users.length} 个用户\n`);
      
      // 显示前5个用户的IP信息
      console.log('用户IP信息:');
      console.log('─'.repeat(100));
      console.log('ID\t用户名\t\t注册IP\t\t\t最后登录IP');
      console.log('─'.repeat(100));
      
      users.slice(0, 5).forEach(user => {
        console.log(
          `${user.id}\t${user.username.padEnd(15)}\t${(user.registerIp || '-').padEnd(20)}\t${user.lastLoginIp || '-'}`
        );
      });
      
      console.log('─'.repeat(100));
      
      // 检查是否有IP字段
      const hasRegisterIp = users.some(u => u.registerIp && u.registerIp !== '-');
      const hasLastLoginIp = users.some(u => u.lastLoginIp && u.lastLoginIp !== '-');
      
      if (hasRegisterIp || hasLastLoginIp) {
        console.log('\n✅ IP字段正常显示');
      } else {
        console.log('\n⚠️  警告: 所有用户的IP字段都为空');
      }
      
      return true;
    } else {
      console.log('❌ 获取用户列表失败');
      return false;
    }
  } catch (error) {
    console.error('❌ 管理员查看用户IP测试失败:', error.response?.data || error.message);
    return false;
  }
}

// 主测试函数
async function runTests() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     验证码和IP记录功能测试                              ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    // 测试1: 验证码功能
    const captchaOk = await testCaptcha();
    
    if (!captchaOk) {
      console.log('\n❌ 验证码测试失败，停止后续测试');
      return;
    }
    
    // 测试2: 注册时IP记录
    const testUsername = await testRegisterWithIP();
    
    if (!testUsername) {
      console.log('\n⚠️  注册测试失败，跳过登录测试');
    } else {
      // 测试3: 登录时IP记录
      await testLoginWithIP(testUsername);
    }
    
    // 测试4: 管理员查看用户IP
    await testAdminViewUserIP();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     所有测试完成                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
runTests();
