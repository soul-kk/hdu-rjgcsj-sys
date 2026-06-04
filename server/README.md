# 学生驿站 — 后端（Node.js + Express）

## 数据库：school_express_sys（MySQL 8）

---

## 表结构一览

### users — 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| username | varchar(50) UNIQUE | 登录账号 |
| password | varchar(255) | 密码（明文，教学项目） |
| role | enum('admin','student','courier') | 身份 |
| real_name | varchar(50) | 真实姓名 |
| phone | char(11) | 手机号（学生必填） |
| created_at | datetime | 创建时间 |

### parcels — 包裹表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| tracking_no | varchar(64) UNIQUE | 快递单号 |
| recipient_name | varchar(50) | 收件人姓名 |
| recipient_phone | char(11) | 收件人手机号 |
| pickup_code | char(6) UNIQUE | 取件码（入库时生成） |
| status | enum | 已入库/待取件/已取件/滞留/已退回 |
| inbound_at | datetime | 入库时间 |
| outbound_at | datetime | 出库时间 |
| notify_status | enum | 未发送/已发送/已查看 |
| remark | varchar(500) | 备注 |
| admin_id | int | 操作管理员 id |

### notifications — 通知表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| user_phone | char(11) | 接收方手机号 |
| type | enum('取件通知','退回通知') | 通知类型 |
| content | varchar(500) | 通知内容 |
| parcel_id | int | 关联包裹 id |
| is_read | tinyint(1) | 是否已读（0/1） |
| created_at | datetime | 创建时间 |

### pickup_records — 取件记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| parcel_id | int | 关联包裹 id |
| pickup_code | char(6) | 取件时使用的取件码 |
| phone | char(11) | 取件人手机号 |
| pickup_at | datetime | 取件时间 |
| admin_id | int | 操作管理员 id |

### ship_orders — 寄件订单表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| order_no | varchar(32) UNIQUE | 订单号（如 SHIP1000000001） |
| user_id | int | 下单学生 id |
| sender_name/phone/address | — | 寄件人信息 |
| receiver_name/phone/address | — | 收件人信息 |
| item_type | enum | 普通物品/易碎物品/液体物品/电子产品/禁寄物品 |
| weight | decimal(6,2) | 重量（kg） |
| freight | decimal(8,2) | 运费（元） |
| status | enum | 待处理/已揽件/已寄件/已完成 |
| created_at | datetime | 下单时间 |

### ship_vouchers — 寄件凭证表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| voucher_no | varchar(64) UNIQUE | 凭证号（如 VCH-SHIP1000000002） |
| order_id | int UNIQUE | 关联订单 id |
| issued_at | datetime | 生成时间 |

### detained_parcels — 滞留包裹表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| parcel_id | int UNIQUE | 关联包裹 id |
| detained_at | datetime | 标记滞留时间 |
| detained_days | int | 已滞留天数 |
| handle_status | enum | 待退回/处理中/已退回 |

### return_records — 退回记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int PK | 自增主键 |
| return_no | varchar(32) UNIQUE | 退回单号（如 RET1000000001） |
| parcel_id | int | 关联包裹 id |
| return_address | varchar(255) | 退回地址 |
| return_at | datetime | 退回时间 |
| admin_id | int | 操作管理员 id |

---

## 常用查询命令

> 连接数据库：`mysql -u root -pLzk_0819 school_express_sys`

```bash
# 查看所有用户
mysql -u root -pLzk_0819 school_express_sys -e "SELECT id, username, role, phone, created_at FROM users;"

# 查看所有包裹（及状态）
mysql -u root -pLzk_0819 school_express_sys -e "SELECT id, tracking_no, recipient_name, recipient_phone, pickup_code, status, notify_status, inbound_at FROM parcels ORDER BY inbound_at DESC;"

# 查看所有通知（未读/已读）
mysql -u root -pLzk_0819 school_express_sys -e "SELECT id, user_phone, type, is_read, parcel_id, created_at FROM notifications ORDER BY created_at DESC;"

# 查看取件记录
mysql -u root -pLzk_0819 school_express_sys -e "SELECT pr.id, p.tracking_no, pr.pickup_code, pr.phone, pr.pickup_at FROM pickup_records pr JOIN parcels p ON pr.parcel_id = p.id ORDER BY pr.pickup_at DESC;"

# 查看寄件订单
mysql -u root -pLzk_0819 school_express_sys -e "SELECT id, order_no, user_id, sender_name, receiver_address, item_type, status, created_at FROM ship_orders ORDER BY created_at DESC;"

# 查看寄件凭证
mysql -u root -pLzk_0819 school_express_sys -e "SELECT sv.voucher_no, so.order_no, so.status, sv.issued_at FROM ship_vouchers sv JOIN ship_orders so ON sv.order_id = so.id;"

# 查看滞留包裹
mysql -u root -pLzk_0819 school_express_sys -e "SELECT dp.id, p.tracking_no, p.recipient_name, dp.detained_days, dp.handle_status, dp.detained_at FROM detained_parcels dp JOIN parcels p ON dp.parcel_id = p.id;"

# 查看退回记录
mysql -u root -pLzk_0819 school_express_sys -e "SELECT rr.return_no, p.tracking_no, p.recipient_name, rr.return_address, rr.return_at FROM return_records rr JOIN parcels p ON rr.parcel_id = p.id;"

# 统计各状态包裹数量
mysql -u root -pLzk_0819 school_express_sys -e "SELECT status, COUNT(*) as count FROM parcels GROUP BY status;"

# 查询某用户的所有通知（替换手机号）
mysql -u root -pLzk_0819 school_express_sys -e "SELECT * FROM notifications WHERE user_phone = '15934125523';"
```
