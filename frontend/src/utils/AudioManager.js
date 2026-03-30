/**
 * 音频管理器
 * 处理音频播放、预加载等功能
 */

class AudioManager {
  constructor() {
    this.audio = new Audio();
    this.preloadCache = new Map(); // 预加载缓存
    this.isPlaying = false;
    this.playCount = 0;
    this.targetPlayCount = 1;
    
    // 监听播放结束事件
    this.audio.addEventListener('ended', () => {
      this.playCount++;
      
      if (this.playCount < this.targetPlayCount) {
        // 继续播放
        this.audio.currentTime = 0;
        this.audio.play().catch(error => {
          console.error('音频播放失败:', error);
        });
      } else {
        // 播放完成
        this.isPlaying = false;
        this.playCount = 0;
      }
    });
    
    // 监听播放错误
    this.audio.addEventListener('error', (error) => {
      console.error('音频加载错误:', error);
      this.isPlaying = false;
      this.playCount = 0;
    });
  }

  /**
   * 播放音频
   * @param {string} url - 音频 URL
   * @param {number} times - 播放次数，默认 1 次
   * @returns {Promise<void>}
   */
  async play(url, times = 1) {
    try {
      // 先停止当前播放（如果正在播放）
      if (this.isPlaying) {
        this.stop();
        // 等待一小段时间确保停止完成
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this.isPlaying = true;
      this.playCount = 0;
      this.targetPlayCount = times;
      
      // 设置音频源
      this.audio.src = url;
      
      // 开始播放
      await this.audio.play();
    } catch (error) {
      console.error('音频播放失败:', error);
      this.isPlaying = false;
      this.playCount = 0;
      throw error;
    }
  }

  /**
   * 停止播放
   */
  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
    this.playCount = 0;
  }

  /**
   * 预加载音频
   * @param {string} url - 音频 URL
   * @returns {Promise<void>}
   */
  async preload(url) {
    if (this.preloadCache.has(url)) {
      return; // 已经预加载过
    }

    try {
      const audio = new Audio();
      audio.src = url;
      
      // 等待音频元数据加载
      await new Promise((resolve, reject) => {
        audio.addEventListener('loadedmetadata', resolve);
        audio.addEventListener('error', reject);
        audio.load();
      });
      
      // 缓存音频对象
      this.preloadCache.set(url, audio);
      
      // 限制缓存大小（最多 10 个）
      if (this.preloadCache.size > 10) {
        const firstKey = this.preloadCache.keys().next().value;
        this.preloadCache.delete(firstKey);
      }
    } catch (error) {
      console.error('音频预加载失败:', url, error);
    }
  }

  /**
   * 批量预加载音频
   * @param {string[]} urls - 音频 URL 数组
   */
  async preloadMultiple(urls) {
    const promises = urls.map(url => this.preload(url));
    await Promise.allSettled(promises);
  }

  /**
   * 清除预加载缓存
   */
  clearCache() {
    this.preloadCache.clear();
  }

  /**
   * 获取播放状态
   */
  getPlayingStatus() {
    return {
      isPlaying: this.isPlaying,
      playCount: this.playCount,
      targetPlayCount: this.targetPlayCount
    };
  }
}

// 导出单例
export default new AudioManager();
