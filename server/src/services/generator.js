const Parcel = require('../models/Parcel');

async function generatePickupCode() {
  let code;
  let exists = true;
  while (exists) {
    code = String(Math.floor(100000 + Math.random() * 900000));
    exists = await Parcel.findOne({ where: { pickup_code: code } });
  }
  return code;
}

function generateOrderNo() {
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `SHIP${Date.now()}${rand}`;
}

function generateVoucherNo(orderNo) {
  return `VCH-${orderNo}`;
}

function generateReturnNo() {
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `RET${Date.now()}${rand}`;
}

module.exports = { generatePickupCode, generateOrderNo, generateVoucherNo, generateReturnNo };
