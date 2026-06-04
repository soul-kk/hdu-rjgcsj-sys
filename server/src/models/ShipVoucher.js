const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShipVoucher = sequelize.define('ShipVoucher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  voucher_no: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  issued_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'ship_vouchers',
  timestamps: false,
});

module.exports = ShipVoucher;
