const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_phone: { type: DataTypes.CHAR(11), allowNull: false },
  type: { type: DataTypes.ENUM('取件通知', '退回通知'), allowNull: false },
  content: { type: DataTypes.STRING(500), allowNull: false },
  parcel_id: { type: DataTypes.INTEGER },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'notifications',
  timestamps: false,
});

module.exports = Notification;
