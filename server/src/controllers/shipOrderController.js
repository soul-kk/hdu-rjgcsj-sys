const { Op } = require('sequelize');
const ShipOrder = require('../models/ShipOrder');
const ShipVoucher = require('../models/ShipVoucher');
const { generateOrderNo, generateVoucherNo } = require('../services/generator');

// 学生：提交寄件订单
async function create(req, res) {
  const { sender_name, sender_phone, sender_address, receiver_name, receiver_phone, receiver_address, item_type } = req.body;
  if (!sender_name || !sender_phone || !receiver_name || !receiver_phone || !receiver_address) {
    return res.json({ code: 1, message: '寄件人和收件人信息必填', data: null });
  }
  const order_no = generateOrderNo();
  const order = await ShipOrder.create({
    order_no, user_id: req.user.userId,
    sender_name, sender_phone, sender_address,
    receiver_name, receiver_phone, receiver_address,
    item_type: item_type || '普通物品',
  });
  return res.json({ code: 0, message: 'ok', data: order });
}

// 管理员：查看所有订单；学生：查看自己的订单
async function list(req, res) {
  const { status, page = 1, pageSize = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (req.user.role === 'student') where.user_id = req.user.userId;

  const { count, rows } = await ShipOrder.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: parseInt(pageSize),
    offset: (parseInt(page) - 1) * parseInt(pageSize),
  });
  return res.json({ code: 0, message: 'ok', data: { total: count, list: rows } });
}

// 快递员：查看待揽收订单（已揽件状态）
async function courierList(req, res) {
  const { type = 'ship' } = req.query;
  const where = type === 'return'
    ? { status: '已揽件', item_type: '退回件' }
    : { status: '已揽件', item_type: { [Op.ne]: '退回件' } };
  const orders = await ShipOrder.findAll({ where, order: [['created_at', 'DESC']] });
  return res.json({ code: 0, message: 'ok', data: orders });
}

// 管理员：揽件确认（填写重量、运费，生成凭证）
async function accept(req, res) {
  const { weight, freight } = req.body;
  const order = await ShipOrder.findByPk(req.params.id);
  if (!order) return res.json({ code: 1, message: '订单不存在', data: null });
  if (order.status !== '待处理') return res.json({ code: 1, message: '订单状态不允许操作', data: null });

  await order.update({ weight, freight, status: '已揽件' });

  const voucher_no = generateVoucherNo(order.order_no);
  const voucher = await ShipVoucher.create({ voucher_no, order_id: order.id });

  return res.json({ code: 0, message: 'ok', data: { order, voucher } });
}

// 获取凭证详情
async function voucher(req, res) {
  const order = await ShipOrder.findByPk(req.params.id);
  if (!order) return res.json({ code: 1, message: '订单不存在', data: null });

  const v = await ShipVoucher.findOne({ where: { order_id: order.id } });
  if (!v) return res.json({ code: 1, message: '凭证尚未生成', data: null });

  return res.json({ code: 0, message: 'ok', data: { order, voucher: v } });
}

// 快递员：确认取件（凭证核验后更新状态）
async function courierConfirm(req, res) {
  const order = await ShipOrder.findByPk(req.params.id);
  if (!order) return res.json({ code: 1, message: '订单不存在', data: null });
  if (order.status !== '已揽件') return res.json({ code: 1, message: '订单状态不允许操作', data: null });
  await order.update({ status: '已寄件' });
  return res.json({ code: 0, message: 'ok', data: order });
}

module.exports = { create, list, courierList, accept, voucher, courierConfirm };
