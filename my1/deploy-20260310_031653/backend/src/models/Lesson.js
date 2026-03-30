import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Lesson = sequelize.define(
  'Lesson',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    lessonNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'lesson_number',
      validate: {
        min: 1
      }
    }
  },
  {
    tableName: 'lessons',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['category_id']
      },
      {
        fields: ['lesson_number']
      },
      {
        unique: true,
        fields: ['category_id', 'lesson_number']
      }
    ]
  }
);

export default Lesson;
