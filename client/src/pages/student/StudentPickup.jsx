import { useState } from 'react'
import { Input, Button, message } from 'antd'
import { SearchOutlined, CheckCircleOutlined, NumberOutlined } from '@ant-design/icons'
import { parcelApi } from '../../api'

export default function StudentPickup() {
  const [pickupCode, setPickupCode] = useState('')
  const [phone4, setPhone4] = useState('')
  const [parcel, setParcel] = useState(null)
  const [searching, setSearching] = useState(false)

  async function handleSearch() {
    if (!pickupCode.trim()) { message.warning('请输入取件码'); return }
    setSearching(true)
    try {
      const res = await parcelApi.search(pickupCode.trim())
      if (res.code !== 0) { message.error(res.message); setParcel(null); return }
      setParcel(res.data)
    } catch {
      message.error('查询失败')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      {/* 状态栏 */}
      <div style={{ height: 62, background: '#fff' }} />
      {/* 标题栏 */}
      <div style={{ background: '#fff', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #E8ECF0' }}>
        <div style={{ fontWeight: 600, fontSize: 17 }}>取件</div>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 输入区 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>输入取件信息</div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>取件码</div>
            <Input
              prefix={<NumberOutlined style={{ color: '#1677FF' }} />}
              placeholder="请输入6位取件码"
              value={pickupCode}
              onChange={(e) => setPickupCode(e.target.value)}
              style={{ borderColor: '#1677FF', borderRadius: 8 }}
              size="large"
              maxLength={6}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>手机号后四位</div>
            <Input
              placeholder="8888"
              value={phone4}
              onChange={(e) => setPhone4(e.target.value)}
              style={{ borderRadius: 8 }}
              size="large"
              maxLength={4}
            />
          </div>

          <Button
            type="primary" block size="large" icon={<SearchOutlined />}
            loading={searching} onClick={handleSearch}
            style={{ borderRadius: 8 }}
          >
            查询包裹
          </Button>
        </div>

        {/* 查询结果 */}
        {parcel && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, background: '#E6F0FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
              <div>
                <div style={{ fontWeight: 500 }}>包裹已找到</div>
                <div style={{ color: '#9CA3AF', fontSize: 12 }}>快递单号 {parcel.tracking_no}</div>
              </div>
              <div style={{ marginLeft: 'auto', background: '#FFF7E6', color: '#FA8C16', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
                {parcel.status}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>收件人</span>
                <span>{parcel.recipient_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>手机号</span>
                <span>{parcel.recipient_phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>入库时间</span>
                <span>{new Date(parcel.inbound_at).toLocaleString('zh-CN')}</span>
              </div>
            </div>

            {parcel.status !== '已取件' ? (
              <div style={{ background: '#F6FFED', borderRadius: 8, padding: '10px 14px', color: '#52C41A', fontSize: 13 }}>
                ✓ 请前往驿站，向管理员出示取件码 <strong>{parcel.pickup_code}</strong> 完成取件
              </div>
            ) : (
              <div style={{ background: '#F6FFED', borderRadius: 8, padding: '10px 14px', color: '#52C41A', fontSize: 13 }}>
                ✓ 该包裹已完成取件
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
