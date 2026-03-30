import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Word = sequelize.define(
  'Word',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'lesson_id',
      references: {
        model: 'lessons',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    english: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    chinese: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    audioCacheUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'audio_cache_url'
    }
  },
  {
    tableName: 'words',
    timestamps: true,
    underscored: true,
    createdAt: true,
    updatedAt: false,
    indexes: [
      {
        fields: ['lesson_id']
      },
      {
        fields: ['english']
      }
    ]
  }
);

export default Word;
