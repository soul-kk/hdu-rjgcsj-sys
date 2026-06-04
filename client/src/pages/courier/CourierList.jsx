import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { shipOrderApi } from '../../api'

export default function CourierList() {
  const [tab, setTab] = useState('ship')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadOrders() }, [tab])

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await shipOrderApi.courierList({ type: tab })
      if (res.code === 0) setOrders(res.data)
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ height: 62, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div />
        <ReloadOutlined style={{ fontSize: 18, color: '#6B7280', cursor: 'pointer' }} onClick={loadOrders} />
      </div>
      <div style={{ background: '#fff', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #E8ECF0' }}>
        <div style={{ fontWeight: 600, fontSize: 17 }}>待取件列表</div>
      </div>

      {/* Tab */}
      <div style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #E8ECF0', padding: '0 16px' }}>
        {[{ key: 'ship', label: '寄件单' }, { key: 'return', label: '退回单' }].map(({ key, label }) => (
          <div key={key} onClick={() => setTab(key)} style={{
            padding: '10px 8px', marginRight: 24, cursor: 'pointer', fontSize: 14,
            color: tab === key ? '#1677FF' : '#6B7280',
            borderBottom: tab === key ? '2px solid #1677FF' : '2px solid transparent',
            fontWeight: tab === key ? 600 : 400,
          }}>{label}</div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px 0' }}>加载中...</div>}
        {!loading && orders.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>暂无待取件订单</div>
        )}
        {orders.map((o) => (
          <div
            key={o.id}
            style={{ background: '#fff', borderRadius: 12, padding: 16, cursor: 'pointer' }}
            onClick={() => navigate(`/courier/voucher/${o.id}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: '#E6F0FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📦</div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>凭证号 VCH-{o.order_no}</div>
                  <div style={{ color: '#9CA3AF', fontSize: 12 }}>寄件单 · {o.item_type}</div>
                </div>
              </div>
              <div style={{ background: '#FFF7E6', color: '#FA8C16', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>待取件</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280' }}>
              <span>收件人：{o.receiver_name}</span>
              <span>运费：¥{o.freight || '--'}</span>
              <span>生成时间：{new Date(o.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
