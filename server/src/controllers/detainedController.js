const { Op } = require('sequelize');
const Parcel = require('../models/Parcel');
const DetainedParcel = require('../models/DetainedParcel');
const ReturnRecord = require('../models/ReturnRecord');
const Notification = require('../models/Notification');
const ShipOrder = require('../models/ShipOrder');
const ShipVoucher = require('../models/ShipVoucher');
const { generateReturnNo, generateOrderNo, generateVoucherNo } = require('../services/generator');

// 查询滞留包裹列表
async function list(req, res) {
  const detained = await DetainedParcel.findAll({
    order: [['detained_at', 'DESC']],
  });
  // 附带包裹信息
  const parcelIds = detained.map(d => d.parcel_id);
  const parcels = await Parcel.findAll({ where: { id: { [Op.in]: parcelIds } } });
  const parcelMap = Object.fromEntries(parcels.map(p => [p.id, p]));
  const result = detained.map(d => ({ ...d.toJSON(), parcel: parcelMap[d.parcel_id] }));
  return res.json({ code: 0, message: 'ok', data: result });
}

// 统计数据
async function stats(req, res) {
  const [total, processing, returned, monthReturned] = await Promise.all([
    DetainedParcel.count({ where: { handle_status: '待退回' } }),
    DetainedParcel.count({ where: { handle_status: '处理中' } }),
    DetainedParcel.count({ where: { handle_status: '已退回' } }),
    DetainedParcel.count({
      where: {
        handle_status: '已退回',
        detained_at: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);
  return res.json({ code: 0, message: 'ok', data: { total, processing, returned, monthReturned } });
}

// 执行退回操作
async function returnParcel(req, res) {
  const detained = await DetainedParcel.findByPk(req.params.id);
  if (!detained) return res.json({ code: 1, message: '记录不存在', data: null });
  if (detained.handle_status === '已退回') return res.json({ code: 1, message: '已退回，无需重复操作', data: null });

  const parcel = await Parcel.findByPk(detained.parcel_id);
  if (!parcel) return res.json({ code: 1, message: '包裹不存在', data: null });

  await detained.update({ handle_status: '已退回' });
  await parcel.update({ status: '已退回' });

  const return_no = generateReturnNo();
  await ReturnRecord.create({
    return_no,
    parcel_id: parcel.id,
    return_address: parcel.recipient_phone, // 退回原地址，简化用手机号标识
    admin_id: req.user.userId,
  });

  // 发退回通知给用户
  await Notification.create({
    user_phone: parcel.recipient_phone,
    type: '退回通知',
    content: `您的包裹（快递单号：${parcel.tracking_no}）因超过14天未取件，已退回原地址，退回单号：${return_no}。`,
    parcel_id: parcel.id,
  });

  // 为快递员创建退回揽件单（状态直接为已揽件，快递员列表可见）
  const order_no = generateOrderNo();
  const returnOrder = await ShipOrder.create({
    order_no,
    user_id: req.user.userId,
    sender_name: parcel.recipient_name,
    sender_phone: parcel.recipient_phone,
    sender_address: '学生驿站',
    receiver_name: parcel.recipient_name,
    receiver_phone: parcel.recipient_phone,
    receiver_address: '退回原地址',
    item_type: '退回件',
    weight: parcel.weight || null,
    freight: parcel.freight || null,
    status: '已揽件',
  });

  // 同步生成凭证，否则快递员无法查看凭证详情
  await ShipVoucher.create({
    voucher_no: generateVoucherNo(order_no),
    order_id: returnOrder.id,
  });

  return res.json({ code: 0, message: '退回操作成功', data: { return_no } });
}

module.exports = { list, stats, returnParcel };
