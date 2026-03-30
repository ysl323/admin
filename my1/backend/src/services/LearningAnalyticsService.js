const LearningRecord = require('../models/LearningRecord');
const LearningSession = require('../models/LearningSession');
const Word = require('../models/Word');
const Lesson = require('../models/Lesson');
const { Op } = require('sequelize');

class LearningAnalyticsService {
  /**
   * 获取用户学习统计
   */
  static async getUserStatistics(userId, options = {}) {
    try {
      const { 
        startDate, 
        endDate, 
        mode, 
        lessonId,
        timeframe = 'all' // 'day', 'week', 'month', 'all'
      } = options;

      // 构建时间范围
      let dateRange = {};
      if (timeframe !== 'all') {
        const now = new Date();
        switch (timeframe) {
          case 'day':
            dateRange = {
              [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            };
            break;
          case 'week':
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            dateRange = { [Op.gte]: weekStart };
            break;
          case 'month':
            dateRange = {
              [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1)
            };
            break;
        }
      } else if (startDate && endDate) {
        dateRange = { [Op.between]: [startDate, endDate] };
      }

      const where = { userId };
      if (Object.keys(dateRange).length > 0) {
        where.timestamp = dateRange;
      }
      if (mode) {
        where.mode = mode;
      }

      // 获取学习记录
      let records;
      if (lessonId) {
        records = await LearningRecord.findAll({
          where,
          include: [{
            model: Word,
            as: 'word',
            where: { lessonId },
            attributes: ['id', 'english', 'chinese', 'lessonId']
          }]
        });
      } else {
        records = await LearningRecord.findAll({
          where,
          include: [{
            model: Word,
            as: 'word',
            attributes: ['id', 'english', 'chinese', 'lessonId']
          }]
        });
      }

      return this.calculateDetailedStatistics(records);

    } catch (error) {
      console.error('获取用户学习统计失败:', error);
      throw error;
    }
  }

  /**
   * 计算详细统计信息
   */
  static calculateDetailedStatistics(records) {
    if (records.length === 0) {
      return {
        overview: {
          totalAttempts: 0,
          correctAttempts: 0,
          accuracy: 0,
          totalWords: 0,
          totalTime: 0,
          averageTime: 0,
          sessionsCount: 0
        },
        modeStats: {},
        dailyProgress: [],
        wordStats: [],
        timeDistribution: {},
        streaks: {
          current: 0,
          longest: 0
        }
      };
    }

    const correctAttempts = records.filter(r => r.correct).length;
    const totalTime = records.reduce((sum, r) => sum + r.timeSpent, 0);
    const uniqueWords = new Set(records.map(r => r.wordId)).size;
    const uniqueSessions = new Set(records.map(r => r.sessionId)).size;

    // 模式统计
    const modeStats = records.reduce((acc, r) => {
      if (!acc[r.mode]) {
        acc[r.mode] = {
          attempts: 0,
          correct: 0,
          accuracy: 0,
          totalTime: 0,
          averageTime: 0
        };
      }
      acc[r.mode].attempts++;
      if (r.correct) acc[r.mode].correct++;
      acc[r.mode].totalTime += r.timeSpent;
      return acc;
    }, {});

    // 计算模式准确率和平均时间
    Object.keys(modeStats).forEach(mode => {
      const stats = modeStats[mode];
      stats.accuracy = Math.round((stats.correct / stats.attempts) * 100);
      stats.averageTime = Math.round(stats.totalTime / stats.attempts);
    });

    // 每日进度
    const dailyProgress = this.calculateDailyProgress(records);

    // 单词统计
    const wordStats = this.calculateWordStatistics(records);

    // 时间分布
    const timeDistribution = this.calculateTimeDistribution(records);

    // 学习连续性
    const streaks = this.calculateStreaks(records);

    return {
      overview: {
        totalAttempts: records.length,
        correctAttempts,
        accuracy: Math.round((correctAttempts / records.length) * 100),
        totalWords: uniqueWords,
        totalTime,
        averageTime: Math.round(totalTime / records.length),
        sessionsCount: uniqueSessions
      },
      modeStats,
      dailyProgress,
      wordStats,
      timeDistribution,
      streaks
    };
  }

  /**
   * 计算每日进度
   */
  static calculateDailyProgress(records) {
    const dailyData = records.reduce((acc, r) => {
      const date = r.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          attempts: 0,
          correct: 0,
          words: new Set(),
          totalTime: 0
        };
      }
      acc[date].attempts++;
      if (r.correct) acc[date].correct++;
      acc[date].words.add(r.wordId);
      acc[date].totalTime += r.timeSpent;
      return acc;
    }, {});

    return Object.values(dailyData)
      .map(day => ({
        ...day,
        accuracy: Math.round((day.correct / day.attempts) * 100),
        uniqueWords: day.words.size,
        averageTime: Math.round(day.totalTime / day.attempts)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * 计算单词统计
   */
  static calculateWordStatistics(records) {
    const wordData = records.reduce((acc, r) => {
      const wordId = r.wordId;
      if (!acc[wordId]) {
        acc[wordId] = {
          wordId,
          word: r.word,
          attempts: 0,
          correct: 0,
          totalTime: 0,
          lastAttempt: r.timestamp,
          firstAttempt: r.timestamp
        };
      }
      
      acc[wordId].attempts++;
      if (r.correct) acc[wordId].correct++;
      acc[wordId].totalTime += r.timeSpent;
      
      if (r.timestamp > acc[wordId].lastAttempt) {
        acc[wordId].lastAttempt = r.timestamp;
      }
      if (r.timestamp < acc[wordId].firstAttempt) {
        acc[wordId].firstAttempt = r.timestamp;
      }
      
      return acc;
    }, {});

    return Object.values(wordData)
      .map(word => ({
        ...word,
        accuracy: Math.round((word.correct / word.attempts) * 100),
        averageTime: Math.round(word.totalTime / word.attempts),
        mastery: this.calculateMastery(word)
      }))
      .sort((a, b) => b.attempts - a.attempts);
  }

  /**
   * 计算单词掌握度
   */
  static calculateMastery(wordStats) {
    const { attempts, correct, accuracy } = wordStats;
    
    if (attempts < 3) return 'beginner';
    if (accuracy >= 90 && attempts >= 5) return 'mastered';
    if (accuracy >= 70) return 'familiar';
    if (accuracy >= 50) return 'learning';
    return 'struggling';
  }

  /**
   * 计算时间分布
   */
  static calculateTimeDistribution(records) {
    const hourlyData = records.reduce((acc, r) => {
      const hour = r.timestamp.getHours();
      if (!acc[hour]) {
        acc[hour] = { attempts: 0, correct: 0 };
      }
      acc[hour].attempts++;
      if (r.correct) acc[hour].correct++;
      return acc;
    }, {});

    const distribution = {};
    for (let hour = 0; hour < 24; hour++) {
      const data = hourlyData[hour] || { attempts: 0, correct: 0 };
      distribution[hour] = {
        attempts: data.attempts,
        accuracy: data.attempts > 0 ? Math.round((data.correct / data.attempts) * 100) : 0
      };
    }

    return distribution;
  }

  /**
   * 计算学习连续性
   */
  static calculateStreaks(records) {
    if (records.length === 0) {
      return { current: 0, longest: 0 };
    }

    // 按日期分组
    const dailyActivity = records.reduce((acc, r) => {
      const date = r.timestamp.toISOString().split('T')[0];
      acc.add(date);
      return acc;
    }, new Set());

    const sortedDates = Array.from(dailyActivity).sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // 检查当前连续性
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (sortedDates.includes(today)) {
      currentStreak = 1;
    } else if (sortedDates.includes(yesterday)) {
      currentStreak = 1;
    }

    // 计算最长连续性
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
        if (i === sortedDates.length - 1 || sortedDates[i] === today || sortedDates[i] === yesterday) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      current: currentStreak,
      longest: longestStreak
    };
  }

  /**
   * 获取学习排行榜
   */
  static async getLeaderboard(options = {}) {
    try {
      const { timeframe = 'week', limit = 10, metric = 'accuracy' } = options;
      
      return await LearningRecord.getLeaderboard({
        timeframe,
        limit,
        metric
      });
    } catch (error) {
      console.error('获取排行榜失败:', error);
      throw error;
    }
  }

  /**
   * 获取学习建议
   */
  static async getLearningRecommendations(userId) {
    try {
      const stats = await this.getUserStatistics(userId, { timeframe: 'week' });
      const recommendations = [];

      // 基于准确率的建议
      if (stats.overview.accuracy < 60) {
        recommendations.push({
          type: 'accuracy',
          priority: 'high',
          message: '建议放慢学习节奏，重点复习错误的单词',
          action: 'review_mistakes'
        });
      }

      // 基于学习时间的建议
      if (stats.overview.averageTime > 30000) { // 30秒
        recommendations.push({
          type: 'speed',
          priority: 'medium',
          message: '可以尝试提高答题速度，增强单词记忆',
          action: 'speed_practice'
        });
      }

      // 基于学习连续性的建议
      if (stats.streaks.current === 0) {
        recommendations.push({
          type: 'consistency',
          priority: 'high',
          message: '保持每日学习习惯，连续学习效果更好',
          action: 'daily_practice'
        });
      }

      // 基于模式使用的建议
      const modeCount = Object.keys(stats.modeStats).length;
      if (modeCount === 1) {
        recommendations.push({
          type: 'variety',
          priority: 'low',
          message: '尝试不同的学习模式，提高学习兴趣',
          action: 'try_modes'
        });
      }

      return recommendations;

    } catch (error) {
      console.error('获取学习建议失败:', error);
      throw error;
    }
  }

  /**
   * 生成学习报告
   */
  static async generateLearningReport(userId, options = {}) {
    try {
      const { timeframe = 'week' } = options;
      
      const stats = await this.getUserStatistics(userId, { timeframe });
      const recommendations = await this.getLearningRecommendations(userId);
      
      // 计算改进指标
      const previousStats = await this.getUserStatistics(userId, {
        timeframe: this.getPreviousTimeframe(timeframe)
      });

      const improvements = {
        accuracy: stats.overview.accuracy - (previousStats.overview.accuracy || 0),
        speed: (previousStats.overview.averageTime || 0) - stats.overview.averageTime,
        consistency: stats.streaks.current - (previousStats.streaks.current || 0)
      };

      return {
        period: timeframe,
        statistics: stats,
        improvements,
        recommendations,
        generatedAt: new Date()
      };

    } catch (error) {
      console.error('生成学习报告失败:', error);
      throw error;
    }
  }

  /**
   * 获取上一个时间段
   */
  static getPreviousTimeframe(timeframe) {
    const now = new Date();
    let startDate, endDate;

    switch (timeframe) {
      case 'day':
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'week':
        endDate = new Date(now);
        endDate.setDate(now.getDate() - 7);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      default:
        return { timeframe: 'all' };
    }

    return { startDate, endDate };
  }
}

module.exports = LearningAnalyticsService;