const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShipOrder = sequelize.define('ShipOrder', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_no: { type: DataTypes.STRING(32), allowNull: false, unique: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_name: { type: DataTypes.STRING(50) },
  sender_phone: { type: DataTypes.CHAR(11) },
  sender_address: { type: DataTypes.STRING(255) },
  receiver_name: { type: DataTypes.STRING(50) },
  receiver_phone: { type: DataTypes.CHAR(11) },
  receiver_address: { type: DataTypes.STRING(255) },
  item_type: {
    type: DataTypes.ENUM('普通物品', '易碎物品', '液体物品', '电子产品', '禁寄物品', '退回件'),
    defaultValue: '普通物品',
  },
  weight: { type: DataTypes.DECIMAL(6, 2) },
  freight: { type: DataTypes.DECIMAL(8, 2) },
  status: {
    type: DataTypes.ENUM('待处理', '已揽件', '已寄件', '已完成'),
    defaultValue: '待处理',
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'ship_orders',
  timestamps: false,
});

module.exports = ShipOrder;
