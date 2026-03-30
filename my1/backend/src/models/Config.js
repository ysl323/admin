import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Config = sequelize.define(
  'Config',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100]
      }
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  },
  {
    tableName: 'config',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['key']
      }
    ]
  }
);

export default Config;
