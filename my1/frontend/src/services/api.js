/**
 * API 服务层
 * 配置 Axios 实例和拦截器
 */

import axios from 'axios';

// 创建 Axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // 发送 cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加 token 或其他请求头
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未登录，跳转到登录页
          console.error('未登录，请先登录');
          window.location.href = '/login';
          break;
        case 403:
          console.error('没有权限访问');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('请求失败:', data.message || '未知错误');
      }
      
      return Promise.reject(data || error);
    } else if (error.request) {
      console.error('网络错误，请检查网络连接');
      return Promise.reject({ message: '网络错误' });
    } else {
      console.error('请求配置错误:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;
