const { Op } = require('sequelize');
const Parcel = require('../models/Parcel');
const Notification = require('../models/Notification');
const PickupRecord = require('../models/PickupRecord');
const { generatePickupCode } = require('../services/generator');

// 管理员：包裹入库
async function inbound(req, res) {
  const { tracking_no, recipient_name, recipient_phone, remark } = req.body;
  if (!tracking_no || !recipient_name || !recipient_phone) {
    return res.json({ code: 1, message: '快递单号、收件人姓名和手机号必填', data: null });
  }
  const exists = await Parcel.findOne({ where: { tracking_no } });
  if (exists) return res.json({ code: 1, message: '该快递单号已入库', data: null });

  const pickup_code = await generatePickupCode();
  const parcel = await Parcel.create({
    tracking_no, recipient_name, recipient_phone, remark,
    pickup_code, status: '已入库', notify_status: '未发送',
    admin_id: req.user.userId,
  });
  return res.json({ code: 0, message: 'ok', data: parcel });
}

// 管理员：查询库存列表
async function list(req, res) {
  const { status, keyword, page = 1, pageSize = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (keyword) {
    where[Op.or] = [
      { tracking_no: { [Op.like]: `%${keyword}%` } },
      { recipient_name: { [Op.like]: `%${keyword}%` } },
      { recipient_phone: { [Op.like]: `%${keyword}%` } },
      { pickup_code: { [Op.like]: `%${keyword}%` } },
    ];
  }
  const { count, rows } = await Parcel.findAndCountAll({
    where,
    order: [['inbound_at', 'DESC']],
    limit: parseInt(pageSize),
    offset: (parseInt(page) - 1) * parseInt(pageSize),
  });
  return res.json({ code: 0, message: 'ok', data: { total: count, list: rows } });
}

// 管理员：发送取件通知
async function notify(req, res) {
  const parcel = await Parcel.findByPk(req.params.id);
  if (!parcel) return res.json({ code: 1, message: '包裹不存在', data: null });
  if (parcel.status === '已取件') return res.json({ code: 1, message: '包裹已取件', data: null });

  await parcel.update({ status: '待取件', notify_status: '已发送' });
  await Notification.create({
    user_phone: parcel.recipient_phone,
    type: '取件通知',
    content: `您有一个包裹已到达驿站，取件码：${parcel.pickup_code}，快递单号：${parcel.tracking_no}，请尽快取件。`,
    parcel_id: parcel.id,
  });
  return res.json({ code: 0, message: '通知已发送', data: null });
}

// 管理员：取件核验出库
async function pickup(req, res) {
  const { pickup_code, phone } = req.body;
  if (!pickup_code || !phone) {
    return res.json({ code: 1, message: '取件码和手机号必填', data: null });
  }
  const parcel = await Parcel.findOne({ where: { pickup_code } });
  if (!parcel) return res.json({ code: 1, message: '取件码不存在', data: null });
  if (parcel.recipient_phone !== phone) {
    return res.json({ code: 1, message: '手机号与取件码不匹配', data: null });
  }
  if (parcel.status === '已取件') {
    return res.json({ code: 1, message: '该包裹已取件', data: null });
  }

  await parcel.update({ status: '已取件', outbound_at: new Date() });
  await PickupRecord.create({
    parcel_id: parcel.id,
    pickup_code,
    phone,
    admin_id: req.user.userId,
  });
  // 将该包裹对应的取件通知标为已读
  await Notification.update(
    { is_read: true },
    { where: { parcel_id: parcel.id, type: '取件通知' } }
  );
  return res.json({ code: 0, message: '取件成功', data: parcel });
}

// 管理员：按取件码/手机号查询包裹（取件核验页搜索）
async function search(req, res) {
  const { keyword } = req.query;
  if (!keyword) return res.json({ code: 1, message: '请输入查询关键词', data: null });
  const parcel = await Parcel.findOne({
    where: {
      [Op.or]: [
        { pickup_code: keyword },
        { tracking_no: keyword },
        { recipient_phone: keyword },
      ],
    },
  });
  if (!parcel) return res.json({ code: 1, message: '未找到包裹', data: null });
  return res.json({ code: 0, message: 'ok', data: parcel });
}

// 学生：查询我的包裹（按手机号）
async function mine(req, res) {
  const { phone } = req.query;
  if (!phone) return res.json({ code: 1, message: '请提供手机号', data: null });
  const parcels = await Parcel.findAll({
    where: { recipient_phone: phone },
    order: [['inbound_at', 'DESC']],
  });
  return res.json({ code: 0, message: 'ok', data: parcels });
}

// 管理员：首页统计数据
async function stats(req, res) {
  const [total, pending, detained, todayInbound] = await Promise.all([
    Parcel.count(),
    Parcel.count({ where: { status: '待取件' } }),
    Parcel.count({ where: { status: '滞留' } }),
    Parcel.count({
      where: {
        inbound_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ]);
  return res.json({ code: 0, message: 'ok', data: { total, pending, detained, todayInbound } });
}

module.exports = { inbound, list, notify, pickup, search, mine, stats };
