import { useState } from 'react'
import { Card, Input, Button, Tag, message, Descriptions } from 'antd'
import { SearchOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { parcelApi } from '../../api'

const STATUS_COLOR = {
  '已入库': 'default', '待取件': 'blue', '已取件': 'green', '滞留': 'red', '已退回': 'orange',
}

export default function AdminPickup() {
  const [keyword, setKeyword] = useState('')
  const [parcel, setParcel] = useState(null)
  const [pickupCode, setPickupCode] = useState('')
  const [searching, setSearching] = useState(false)
  const [confirming, setConfirming] = useState(false)

  async function handleSearch() {
    if (!keyword.trim()) return
    setSearching(true)
    try {
      const res = await parcelApi.search(keyword.trim())
      if (res.code !== 0) { message.error(res.message); setParcel(null); return }
      setParcel(res.data)
      setPickupCode('')
    } catch {
      message.error('查询失败')
    } finally {
      setSearching(false)
    }
  }

  async function handleConfirm() {
    if (!pickupCode.trim()) { message.warning('请输入取件码'); return }
    if (!parcel) return
    setConfirming(true)
    try {
      const res = await parcelApi.pickup({ pickup_code: pickupCode.trim(), phone: parcel.recipient_phone })
      if (res.code !== 0) { message.error(res.message); return }
      message.success('取件成功！')
      setParcel({ ...parcel, status: '已取件' })
    } catch {
      message.error('操作失败')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>取件核验</div>

      <Card style={{ borderRadius: 8 }}>
        {/* 搜索栏 */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <Input
            placeholder="输入取件码 / 快递单号 / 手机号..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            style={{ flex: 1 }}
            size="large"
          />
          <Button type="primary" icon={<SearchOutlined />} size="large" loading={searching} onClick={handleSearch}>
            查询
          </Button>
        </div>

        {/* 包裹信息 */}
        {parcel && (
          <div style={{ border: '1px solid #E8ECF0', borderRadius: 8, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{parcel.tracking_no}</div>
                <div style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>
                  入库时间：{new Date(parcel.inbound_at).toLocaleString('zh-CN')}
                </div>
              </div>
              <Tag color={STATUS_COLOR[parcel.status]} style={{ fontSize: 13 }}>{parcel.status}</Tag>
            </div>

            <Descriptions column={2} size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="收件人">{parcel.recipient_name}</Descriptions.Item>
              <Descriptions.Item label="手机号">{parcel.recipient_phone}</Descriptions.Item>
              <Descriptions.Item label="取件码">
                <span style={{ color: '#1677FF', fontWeight: 700, fontSize: 18 }}>{parcel.pickup_code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="快递公司">顺丰快递</Descriptions.Item>
            </Descriptions>

            {parcel.status !== '已取件' && parcel.status !== '已退回' && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Input
                  placeholder="请学生出示取件码并输入确认"
                  value={pickupCode}
                  onChange={(e) => setPickupCode(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary" style={{ background: '#52C41A', borderColor: '#52C41A' }}
                  icon={<CheckCircleOutlined />}
                  loading={confirming}
                  onClick={handleConfirm}
                >
                  确认取件
                </Button>
                <Button onClick={() => { setParcel(null); setKeyword('') }}>取消</Button>
              </div>
            )}

            {parcel.status === '已取件' && (
              <div style={{ color: '#52C41A', fontWeight: 600 }}>✓ 该包裹已完成取件</div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
