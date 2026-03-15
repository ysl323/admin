/**
 * 详细诊断导出功能失败的原因
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
let sessionCookie = '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true
});

api.interceptors.request.use(config => {
  if (sessionCookie) {
    config.headers.Cookie = sessionCookie;
  }
  return config;
});

api.interceptors.response.use(
  response => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie && setCookie.length > 0) {
      sessionCookie = setCookie[0].split(';')[0];
    }
    return response;
  },
  error => {
    return Promise.reject(error);
  }
);

async function login() {
  console.log('步骤 1: 登录管理员账号...');
  try {
    const response = await api.post('/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✓ 登录成功');
    console.log('Session Cookie:', sessionCookie);
    return true;
  } catch (error) {
    console.error('✗ 登录失败:', error.message);
    return false;
  }
}

async function testExportEndpoint() {
  console.log('\n步骤 2: 测试导出端点...');
  
  try {
    console.log('发送请求: GET /api/audio-cache/export');
    console.log('Cookie:', sessionCookie);
    
    const response = await api.get('/api/audio-cache/export');
    
    console.log('\n✓ 请求成功');
    console.log('状态码:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\n✗ 请求失败');
    console.error('错误类型:', error.constructor.name);
    
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应头:', JSON.stringify(error.response.headers, null, 2));
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
      
      // 检查具体错误
      if (error.response.status === 404) {
        console.error('\n原因: 导出端点不存在');
        console.error('说明: 后端服务可能未重启，新的路由未加载');
      } else if (error.response.status === 401) {
        console.error('\n原因: 未授权');
        console.error('说明: Session 可能已过期或未正确传递');
      } else if (error.response.status === 403) {
        console.error('\n原因: 权限不足');
        console.error('说明: 当前用户不是管理员');
      } else if (error.response.status === 500) {
        console.error('\n原因: 服务器内部错误');
        console.error('说明: 后端代码执行出错');
      }
    } else if (error.request) {
      console.error('请求已发送但未收到响应');
      console.error('说明: 后端服务可能未运行');
    } else {
      console.error('请求配置错误:', error.message);
    }
    
    return null;
  }
}

async function checkBackendLogs() {
  console.log('\n步骤 3: 检查后端日志...');
  console.log('请查看后端控制台输出，查找相关错误信息');
}

async function diagnose() {
  console.log('========================================');
  console.log('导出功能详细诊断');
  console.log('========================================\n');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('\n诊断终止: 登录失败');
    return;
  }
  
  const exportData = await testExportEndpoint();
  
  await checkBackendLogs();
  
  console.log('\n========================================');
  console.log('诊断总结');
  console.log('========================================\n');
  
  if (exportData) {
    console.log('✓ 导出功能正常');
    console.log(`  导出了 ${exportData.count} 条记录`);
  } else {
    console.log('✗ 导出功能失败');
    console.log('\n可能的解决方案:');
    console.log('1. 重启后端服务: cd my1 && emergency-fix.bat');
    console.log('2. 检查路由是否正确注册');
    console.log('3. 查看后端控制台的错误日志');
  }
}

diagnose().catch(error => {
  console.error('\n诊断过程出错:', error);
});
