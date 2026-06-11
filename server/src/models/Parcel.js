const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Parcel = sequelize.define('Parcel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tracking_no: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  recipient_name: { type: DataTypes.STRING(50), allowNull: false },
  recipient_phone: { type: DataTypes.CHAR(11), allowNull: false },
  pickup_code: { type: DataTypes.CHAR(6), unique: true },
  status: {
    type: DataTypes.ENUM('已入库', '待取件', '已取件', '滞留', '已退回'),
    defaultValue: '已入库',
  },
  inbound_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  outbound_at: { type: DataTypes.DATE },
  notify_status: {
    type: DataTypes.ENUM('未发送', '已发送', '已查看'),
    defaultValue: '未发送',
  },
  remark: { type: DataTypes.STRING(500) },
  weight: { type: DataTypes.DECIMAL(6, 2) },
  freight: { type: DataTypes.DECIMAL(8, 2) },
  admin_id: { type: DataTypes.INTEGER },
}, {
  tableName: 'parcels',
  timestamps: false,
});

module.exports = Parcel;
