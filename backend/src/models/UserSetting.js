import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const UserSetting = sequelize.define(
  'UserSetting',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '设置键名，如 shortcuts'
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '设置值，JSON格式存储'
    }
  },
  {
    tableName: 'user_settings',
    timestamps: true,
    underscored: true,
    createdAt: true,
    updatedAt: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'key']
      }
    ]
  }
);

// 静态方法：获取用户设置
UserSetting.getUserSettings = async function(userId) {
  const settings = await this.findAll({
    where: { userId },
    attributes: ['key', 'value']
  });
  
  const result = {};
  for (const setting of settings) {
    try {
      result[setting.key] = JSON.parse(setting.value);
    } catch {
      result[setting.key] = setting.value;
    }
  }
  
  return result;
};

// 静态方法：保存用户设置
UserSetting.saveUserSettings = async function(userId, settings) {
  const transaction = await sequelize.transaction();
  
  try {
    for (const [key, value] of Object.entries(settings)) {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      await this.upsert(
        { userId, key, value: jsonValue },
        { transaction }
      );
    }
    
    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export default UserSetting;
