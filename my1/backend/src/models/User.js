import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash'
    },
    accessDays: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
      field: 'access_days',
      validate: {
        min: 0
      }
    },
    expireDate: {
      type: DataTypes.DATE,
      field: 'expire_date',
      get() {
        const accessDays = this.getDataValue('accessDays');
        if (accessDays <= 0) {
          return null;
        }
        const now = new Date();
        const expireDate = new Date(now.getTime() + accessDays * 24 * 60 * 60 * 1000);
        return expireDate;
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      field: 'is_active'
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_admin'
    },
    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      field: 'is_super_admin',
      comment: '超级管理员，拥有最高权限'
    },
    registerIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'register_ip',
      comment: '注册IP地址'
    },
    lastLoginIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'last_login_ip',
      comment: '最后登录IP'
    }
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['access_days']
      },
      {
        fields: ['is_active']
      }
    ]
  }
);

export default User;
