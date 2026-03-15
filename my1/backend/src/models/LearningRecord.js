const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LearningRecord = sequelize.define('LearningRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'learning_sessions',
      key: 'id'
    }
  },
  wordId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'words',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  timeSpent: {
    type: DataTypes.INTEGER, // 毫秒
    allowNull: false,
    defaultValue: 0
  },
  userAnswer: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  correctAnswer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  mode: {
    type: DataTypes.ENUM('sequential', 'random', 'loop', 'random_loop'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'learning_records',
  timestamps: true,
  indexes: [
    {
      fields: ['sessionId']
    },
    {
      fields: ['wordId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['userId', 'wordId']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['mode']
    },
    {
      fields: ['correct']
    }
  ]
});

// 关联关系
LearningRecord.associate = (models) => {
  LearningRecord.belongsTo(models.LearningSession, {
    foreignKey: 'sessionId',
    as: 'session'
  });
  
  LearningRecord.belongsTo(models.Word, {
    foreignKey: 'wordId',
    as: 'word'
  });
  
  LearningRecord.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// 实例方法
LearningRecord.prototype.calculateAccuracy = function() {
  return this.correct ? 100 : 0;
};

// 类方法
LearningRecord.getWordStatistics = async function(userId, wordId) {
  const records = await this.findAll({
    where: { userId, wordId },
    order: [['timestamp', 'ASC']]
  });
  
  if (records.length === 0) {
    return {
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      averageTime: 0,
      lastAttempt: null,
      firstAttempt: null
    };
  }
  
  const correctAttempts = records.filter(r => r.correct).length;
  const totalTime = records.reduce((sum, r) => sum + r.timeSpent, 0);
  
  return {
    totalAttempts: records.length,
    correctAttempts,
    accuracy: Math.round((correctAttempts / records.length) * 100),
    averageTime: Math.round(totalTime / records.length),
    lastAttempt: records[records.length - 1].timestamp,
    firstAttempt: records[0].timestamp
  };
};

LearningRecord.getUserStatistics = async function(userId, options = {}) {
  const { startDate, endDate, mode, lessonId } = options;
  
  const where = { userId };
  
  if (startDate && endDate) {
    where.timestamp = {
      [sequelize.Op.between]: [startDate, endDate]
    };
  }
  
  if (mode) {
    where.mode = mode;
  }
  
  if (lessonId) {
    // 需要通过 word 关联查询
    const records = await this.findAll({
      where,
      include: [{
        model: sequelize.models.Word,
        as: 'word',
        where: { lessonId },
        attributes: []
      }]
    });
    
    return this.calculateStatistics(records);
  }
  
  const records = await this.findAll({ where });
  return this.calculateStatistics(records);
};

LearningRecord.calculateStatistics = function(records) {
  if (records.length === 0) {
    return {
      totalWords: 0,
      totalAttempts: 0,
      correctAttempts: 0,
      accuracy: 0,
      averageTime: 0,
      totalTime: 0,
      sessionsCount: 0,
      modeDistribution: {},
      dailyProgress: []
    };
  }
  
  const correctAttempts = records.filter(r => r.correct).length;
  const totalTime = records.reduce((sum, r) => sum + r.timeSpent, 0);
  const uniqueWords = new Set(records.map(r => r.wordId)).size;
  const uniqueSessions = new Set(records.map(r => r.sessionId)).size;
  
  // 模式分布
  const modeDistribution = records.reduce((acc, r) => {
    acc[r.mode] = (acc[r.mode] || 0) + 1;
    return acc;
  }, {});
  
  // 每日进度
  const dailyProgress = records.reduce((acc, r) => {
    const date = r.timestamp.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { correct: 0, total: 0 };
    }
    acc[date].total++;
    if (r.correct) acc[date].correct++;
    return acc;
  }, {});
  
  return {
    totalWords: uniqueWords,
    totalAttempts: records.length,
    correctAttempts,
    accuracy: Math.round((correctAttempts / records.length) * 100),
    averageTime: Math.round(totalTime / records.length),
    totalTime,
    sessionsCount: uniqueSessions,
    modeDistribution,
    dailyProgress: Object.entries(dailyProgress).map(([date, stats]) => ({
      date,
      ...stats,
      accuracy: Math.round((stats.correct / stats.total) * 100)
    }))
  };
};

LearningRecord.getLeaderboard = async function(options = {}) {
  const { limit = 10, timeframe = 'week' } = options;
  
  let startDate = new Date();
  switch (timeframe) {
    case 'day':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    default:
      startDate = null;
  }
  
  const where = {};
  if (startDate) {
    where.timestamp = {
      [sequelize.Op.gte]: startDate
    };
  }
  
  const results = await this.findAll({
    where,
    attributes: [
      'userId',
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalAttempts'],
      [sequelize.fn('SUM', sequelize.literal('CASE WHEN correct = true THEN 1 ELSE 0 END')), 'correctAttempts'],
      [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('wordId'))), 'uniqueWords'],
      [sequelize.fn('AVG', sequelize.col('timeSpent')), 'averageTime']
    ],
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['username', 'email']
    }],
    group: ['userId', 'user.id'],
    order: [[sequelize.literal('correctAttempts'), 'DESC']],
    limit
  });
  
  return results.map(result => ({
    userId: result.userId,
    username: result.user.username,
    totalAttempts: parseInt(result.dataValues.totalAttempts),
    correctAttempts: parseInt(result.dataValues.correctAttempts),
    uniqueWords: parseInt(result.dataValues.uniqueWords),
    accuracy: Math.round((result.dataValues.correctAttempts / result.dataValues.totalAttempts) * 100),
    averageTime: Math.round(result.dataValues.averageTime)
  }));
};

module.exports = LearningRecord;