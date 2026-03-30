const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LearningSession = sequelize.define('LearningSession', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    }
  },
  mode: {
    type: DataTypes.ENUM('beginner', 'advanced', 'sequential', 'random', 'loop', 'random_loop'),
    allowNull: false,
    defaultValue: 'beginner',
    comment: '学习模式：beginner(小白模式), advanced(进阶模式), sequential(顺序学习), random(随机学习), loop(循环学习), random_loop(随机循环)'
  },
  status: {
    type: DataTypes.ENUM('idle', 'active', 'paused', 'completed'),
    allowNull: false,
    defaultValue: 'idle'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  lastActivityTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  // 会话状态数据（JSON格式存储）
  sessionState: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      wordSequence: [],
      currentIndex: 0,
      learnedWords: [],
      loopCount: 0
    }
  },
  // 学习进度数据（JSON格式存储）
  progressData: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      currentIndex: 0,
      totalWords: 0,
      learnedCount: 0,
      loopCount: 0,
      sessionStartTime: null
    }
  }
}, {
  tableName: 'learning_sessions',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['lessonId']
    },
    {
      fields: ['userId', 'lessonId', 'mode']
    },
    {
      fields: ['status']
    },
    {
      fields: ['lastActivityTime']
    }
  ]
});

// 关联关系
LearningSession.associate = (models) => {
  LearningSession.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
  
  LearningSession.belongsTo(models.Lesson, {
    foreignKey: 'lessonId',
    as: 'lesson'
  });
  
  LearningSession.hasMany(models.LearningRecord, {
    foreignKey: 'sessionId',
    as: 'records'
  });
};

// 实例方法
LearningSession.prototype.updateProgress = function(progressUpdate) {
  this.progressData = {
    ...this.progressData,
    ...progressUpdate
  };
  this.lastActivityTime = new Date();
  return this.save();
};

LearningSession.prototype.updateState = function(stateUpdate) {
  this.sessionState = {
    ...this.sessionState,
    ...stateUpdate
  };
  this.lastActivityTime = new Date();
  return this.save();
};

LearningSession.prototype.markCompleted = function() {
  this.status = 'completed';
  this.lastActivityTime = new Date();
  return this.save();
};

LearningSession.prototype.pause = function() {
  this.status = 'paused';
  this.lastActivityTime = new Date();
  return this.save();
};

LearningSession.prototype.resume = function() {
  this.status = 'active';
  this.lastActivityTime = new Date();
  return this.save();
};

// 类方法
LearningSession.findActiveByUser = function(userId) {
  return this.findAll({
    where: {
      userId,
      status: ['active', 'paused']
    },
    order: [['lastActivityTime', 'DESC']]
  });
};

LearningSession.findByUserAndLesson = function(userId, lessonId, mode = null) {
  const where = { userId, lessonId };
  if (mode) {
    where.mode = mode;
  }
  
  return this.findOne({
    where,
    order: [['lastActivityTime', 'DESC']]
  });
};

LearningSession.cleanupOldSessions = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.destroy({
    where: {
      lastActivityTime: {
        [sequelize.Op.lt]: cutoffDate
      },
      status: ['completed', 'idle']
    }
  });
};

module.exports = LearningSession;