require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

// 模型（触发关联注册）
require('./models/User');
require('./models/Parcel');
require('./models/Notification');
require('./models/ShipOrder');
require('./models/ShipVoucher');
require('./models/DetainedParcel');
require('./models/ReturnRecord');
require('./models/PickupRecord');

const authRouter = require('./routes/auth');
const parcelsRouter = require('./routes/parcels');
const shipOrdersRouter = require('./routes/shipOrders');
const detainedRouter = require('./routes/detained');
const notificationsRouter = require('./routes/notifications');

const { startDetainedJob } = require('./jobs/detainedJob');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/parcels', parcelsRouter);
app.use('/api/ship-orders', shipOrdersRouter);
app.use('/api/detained', detainedRouter);
app.use('/api/notifications', notificationsRouter);

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err);
  res.json({ code: 500, message: err.message || '服务器错误', data: null });
});

const PORT = process.env.PORT || 3001;

sequelize.sync({ alter: true }).then(() => {
  console.log('数据库同步完成');
  startDetainedJob();
  app.listen(PORT, () => console.log(`服务器运行在 http://localhost:${PORT}`));
}).catch(err => {
  console.error('数据库连接失败:', err.message);
  process.exit(1);
});
