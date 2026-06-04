const cron = require('node-cron');
const { Op } = require('sequelize');
const Parcel = require('../models/Parcel');
const DetainedParcel = require('../models/DetainedParcel');

// 每天凌晨 1:00 检测超14天未取件的包裹
function startDetainedJob() {
  cron.schedule('0 1 * * *', async () => {
    console.log('[cron] 开始检测滞留包裹...');
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const parcels = await Parcel.findAll({
      where: {
        status: { [Op.in]: ['已入库', '待取件'] },
        inbound_at: { [Op.lte]: cutoff },
      },
    });

    for (const parcel of parcels) {
      const exists = await DetainedParcel.findOne({ where: { parcel_id: parcel.id } });
      if (!exists) {
        const days = Math.floor((Date.now() - new Date(parcel.inbound_at)) / (24 * 60 * 60 * 1000));
        await DetainedParcel.create({ parcel_id: parcel.id, detained_days: days });
        await parcel.update({ status: '滞留' });
        console.log(`[cron] 包裹 ${parcel.tracking_no} 标记为滞留（${days}天）`);
      }
    }
    console.log(`[cron] 检测完成，共处理 ${parcels.length} 条`);
  });
}

module.exports = { startDetainedJob };
