const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PickupRecord = sequelize.define('PickupRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  parcel_id: { type: DataTypes.INTEGER, allowNull: false },
  pickup_code: { type: DataTypes.CHAR(6), allowNull: false },
  phone: { type: DataTypes.CHAR(11), allowNull: false },
  pickup_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  admin_id: { type: DataTypes.INTEGER },
}, {
  tableName: 'pickup_records',
  timestamps: false,
});

module.exports = PickupRecord;
