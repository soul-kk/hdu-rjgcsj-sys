const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetainedParcel = sequelize.define('DetainedParcel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  parcel_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  detained_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  detained_days: { type: DataTypes.INTEGER },
  handle_status: {
    type: DataTypes.ENUM('待退回', '处理中', '已退回'),
    defaultValue: '待退回',
  },
}, {
  tableName: 'detained_parcels',
  timestamps: false,
});

module.exports = DetainedParcel;
