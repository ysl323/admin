import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

/**
 * 音频缓存模型
 * 存储 TTS 生成的音频文件元数据
 */
const AudioCache = sequelize.define(
  'AudioCache',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    cacheKey: {
      type: DataTypes.STRING(32),
      unique: true,
      allowNull: false,
      field: 'cache_key',
      comment: '缓存键（文本的 MD5 哈希值）'
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '原始文本内容'
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_path',
      comment: '音频文件路径（相对于 audio-cache 目录）'
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'file_size',
      comment: '文件大小（字节）'
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'volcengine',
      comment: 'TTS 提供商（volcengine, google）'
    },
    hitCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      field: 'hit_count',
      comment: '缓存命中次数'
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      field: 'last_accessed_at',
      comment: '最后访问时间'
    }
  },
  {
    tableName: 'audio_caches',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['cache_key']
      },
      {
        fields: ['provider']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['last_accessed_at']
      },
      {
        fields: ['hit_count']
      }
    ]
  }
);

export default AudioCache;
