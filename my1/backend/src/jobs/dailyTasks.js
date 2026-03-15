import cron from 'node-cron';
import UserService from '../services/UserService.js';
import logger from '../utils/logger.js';

/**
 * 每日定时任务
 * 每天凌晨 2 点执行
 */
class DailyTasks {
  constructor() {
    this.tasks = [];
  }

  /**
   * 启动所有定时任务
   */
  start() {
    // 每日天数递减任务 - 每天凌晨 2 点执行
    const decrementTask = cron.schedule(
      '0 2 * * *',
      async () => {
        try {
          logger.info('触发每日天数递减任务');
          const result = await UserService.decrementAccessDays();
          logger.info('每日天数递减任务执行成功:', result);
        } catch (error) {
          logger.error('每日天数递减任务执行失败:', error);
        }
      },
      {
        scheduled: true,
        timezone: 'Asia/Shanghai' // 使用中国时区
      }
    );

    this.tasks.push({
      name: '每日天数递减',
      schedule: '0 2 * * *',
      task: decrementTask
    });

    logger.info('✅ 定时任务已启动:');
    logger.info('  - 每日天数递减: 每天凌晨 2:00 执行');
  }

  /**
   * 停止所有定时任务
   */
  stop() {
    this.tasks.forEach((task) => {
      task.task.stop();
      logger.info(`定时任务已停止: ${task.name}`);
    });
  }

  /**
   * 手动触发每日天数递减任务（用于测试）
   */
  async triggerDecrementTask() {
    try {
      logger.info('手动触发每日天数递减任务');
      const result = await UserService.decrementAccessDays();
      return result;
    } catch (error) {
      logger.error('手动触发任务失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有定时任务状态
   */
  getTasksStatus() {
    return this.tasks.map((task) => ({
      name: task.name,
      schedule: task.schedule,
      running: task.task.running
    }));
  }
}

export default new DailyTasks();
