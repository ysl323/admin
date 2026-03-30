import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const WordMastery = sequelize.define('WordMastery', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '用户ID'
  },
  lessonId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lessons',
      key: 'id'
    },
    comment: '课程ID'
  },
  wordId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'words',
      key: 'id'
    },
    comment: '单词ID'
  },
  masteredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: '掌握时间'
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '复习次数'
  },
  lastReviewAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '最后复习时间'
  }
}, {
  tableName: 'word_mastery',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'lessonId', 'wordId'],
      name: 'unique_user_lesson_word_mastery',
      comment: '确保每个用户在每个课程中对每个单词只有一条掌握记录'
    },
    {
      fields: ['userId']
    },
    {
      fields: ['lessonId']
    },
    {
      fields: ['wordId']
    },
    {
      fields: ['masteredAt']
    }
  ]
});

// 关联关系
WordMastery.associate = (models) => {
  WordMastery.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });

  WordMastery.belongsTo(models.Lesson, {
    foreignKey: 'lessonId',
    as: 'lesson'
  });

  WordMastery.belongsTo(models.Word, {
    foreignKey: 'wordId',
    as: 'word'
  });
};

// 实例方法
WordMastery.prototype.markReview = async function() {
  this.reviewCount += 1;
  this.lastReviewAt = new Date();
  await this.save();
};

// 类方法
WordMastery.markAsMastered = async function(userId, lessonId, wordId) {
  try {
    const [mastery, created] = await this.findOrCreate({
      where: { userId, wordId },
      defaults: {
        userId,
        lessonId,
        wordId,
        masteredAt: new Date(),
        reviewCount: 0
      }
    });

    if (created) {
      console.log(`Word ${wordId} marked as mastered by user ${userId}`);
    } else {
      // 已存在记录，更新掌握时间
      mastery.masteredAt = new Date();
      await mastery.save();
      console.log(`Word ${wordId} mastery updated for user ${userId}`);
    }

    return mastery;
  } catch (error) {
    console.error('Failed to mark word as mastered:', error);
    throw error;
  }
};

WordMastery.unmarkAsMastered = async function(userId, wordId) {
  try {
    const result = await this.destroy({
      where: { userId, wordId }
    });

    if (result > 0) {
      console.log(`Word ${wordId} unmarked as mastered by user ${userId}`);
      return true;
    }

    console.log(`Word ${wordId} was not marked as mastered by user ${userId}`);
    return false;
  } catch (error) {
    console.error('Failed to unmark word as mastered:', error);
    throw error;
  }
};

WordMastery.getUserLessonMastery = async function(userId, lessonId) {
  try {
    const masteryRecords = await this.findAll({
      where: { userId, lessonId },
      attributes: ['wordId'],
      order: [['masteredAt', 'ASC']]
    });

    return masteryRecords.map(record => record.wordId);
  } catch (error) {
    console.error('Failed to get user lesson mastery:', error);
    throw error;
  }
};

WordMastery.getUserMasteryStats = async function(userId) {
  try {
    const stats = await this.findAll({
      where: { userId },
      attributes: [
        'lessonId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'masteredCount']
      ],
      group: ['lessonId'],
      order: [['lessonId', 'ASC']]
    });

    return stats.map(stat => ({
      lessonId: stat.lessonId,
      masteredCount: parseInt(stat.dataValues.masteredCount)
    }));
  } catch (error) {
    console.error('Failed to get user mastery stats:', error);
    throw error;
  }
};

WordMastery.getWordMasteryRate = async function(lessonId) {
  try {
    const totalWords = await sequelize.models.Word.count({
      where: { lessonId }
    });

    if (totalWords === 0) {
      return { totalWords: 0, masteredWords: 0, masteryRate: 0 };
    }

    const masteredWords = await this.count({
      where: { lessonId },
      distinct: true,
      col: 'wordId'
    });

    const masteryRate = Math.round((masteredWords / totalWords) * 100);

    return {
      totalWords,
      masteredWords,
      masteryRate
    };
  } catch (error) {
    console.error('Failed to get word mastery rate:', error);
    throw error;
  }
};

export default WordMastery;
