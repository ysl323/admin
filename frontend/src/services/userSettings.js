import api from './api';

/**
 * 用户设置API服务
 */
class UserSettingsService {
  /**
   * 获取用户设置
   * @returns {Promise<Object>} 用户设置
   */
  async getSettings() {
    try {
      const response = await api.get('/user-settings');
      return response.data?.settings || {};
    } catch (error) {
      console.warn('Failed to get settings from server:', error);
      return {};
    }
  }

  /**
   * 保存用户设置
   * @param {Object} settings - 用户设置
   * @returns {Promise<Object>} API响应
   */
  async saveSettings(settings) {
    try {
      return api.post('/user-settings', { settings });
    } catch (error) {
      console.warn('Failed to save settings to server:', error);
      throw error;
    }
  }

  /**
   * 本地存储键名
   */
  static LOCAL_KEY = 'user_settings';

  /**
   * 默认快捷键设置
   */
  static DEFAULT_SHORTCUTS = {
    previous: { keys: ['Alt', 'Left'], label: '上一题' },
    mastered: { keys: ['Alt', 'M'], label: '掌握' },
    play: { keys: ['Alt', 'P'], label: '播放' },
    next: { keys: ['Alt', 'Right'], label: '下一题' },
    showAnswer: { keys: ['Alt', 'A'], label: '显示答案' },
    restart: { keys: ['Alt', 'R'], label: '重新开始' }
  };

  /**
   * 从本地存储加载设置
   * @returns {Object} 用户设置
   */
  loadFromLocal() {
    try {
      const saved = localStorage.getItem(UserSettingsService.LOCAL_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        // 合并默认快捷键（确保新增的快捷键有默认值）
        settings.shortcuts = {
          ...UserSettingsService.DEFAULT_SHORTCUTS,
          ...(settings.shortcuts || {})
        };
        return settings;
      }
    } catch (error) {
      console.error('Failed to load settings from local:', error);
    }
    return {
      shortcuts: { ...UserSettingsService.DEFAULT_SHORTCUTS }
    };
  }

  /**
   * 保存设置到本地存储
   * @param {Object} settings - 用户设置
   */
  saveToLocal(settings) {
    try {
      localStorage.setItem(UserSettingsService.LOCAL_KEY, JSON.stringify(settings));
      console.log('Settings saved to local storage');
    } catch (error) {
      console.error('Failed to save settings to local:', error);
    }
  }

  /**
   * 同步设置到服务器
   * @param {Object} settings - 用户设置
   */
  async syncToServer(settings) {
    try {
      await this.saveSettings(settings);
      console.log('Settings synced to server');
    } catch (error) {
      console.warn('Failed to sync settings to server:', error);
    }
  }

  /**
   * 从服务器同步设置
   * @returns {Promise<Object>} 用户设置
   */
  async syncFromServer() {
    try {
      const serverSettings = await this.getSettings();
      const localSettings = this.loadFromLocal();
      
      // 服务器设置优先，但合并本地可能缺失的默认值
      const mergedSettings = {
        shortcuts: {
          ...UserSettingsService.DEFAULT_SHORTCUTS,
          ...(localSettings.shortcuts || {}),
          ...(serverSettings.shortcuts || {})
        }
      };
      
      this.saveToLocal(mergedSettings);
      return mergedSettings;
    } catch (error) {
      console.warn('Failed to sync from server, using local:', error);
      return this.loadFromLocal();
    }
  }

  /**
   * 重置为默认设置
   * @returns {Object} 默认设置
   */
  resetToDefault() {
    const defaultSettings = {
      shortcuts: { ...UserSettingsService.DEFAULT_SHORTCUTS }
    };
    this.saveToLocal(defaultSettings);
    return defaultSettings;
  }
}

export default new UserSettingsService();
