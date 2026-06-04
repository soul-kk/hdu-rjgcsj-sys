const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReturnRecord = sequelize.define('ReturnRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  return_no: { type: DataTypes.STRING(32), allowNull: false, unique: true },
  parcel_id: { type: DataTypes.INTEGER, allowNull: false },
  return_address: { type: DataTypes.STRING(255) },
  return_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  admin_id: { type: DataTypes.INTEGER },
}, {
  tableName: 'return_records',
  timestamps: false,
});

module.exports = ReturnRecord;
