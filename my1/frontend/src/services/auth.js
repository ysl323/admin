/**
 * 认证服务
 */

import api from './api';

export default {
  /**
   * 用户登录
   */
  async login(username, password) {
    return await api.post('/auth/login', { username, password });
  },

  /**
   * 用户注册
   */
  async register(username, password, captchaId, captchaAnswer) {
    return await api.post('/auth/register', { username, password, captchaId, captchaAnswer });
  },

  /**
   * 退出登录
   */
  async logout() {
    return await api.post('/auth/logout');
  },

  /**
   * 检查认证状态
   */
  async checkAuth() {
    return await api.get('/auth/check');
  }
};
