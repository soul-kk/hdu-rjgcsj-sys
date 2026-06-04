import { useEffect, useState } from 'react'
import { message, Button } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { shipOrderApi, parcelApi } from '../../api'

const STATUS_COLOR = { '待处理': '#FA8C16', '已揽件': '#1677FF', '已寄件': '#52C41A', '已完成': '#9CA3AF' }
const STATUS_BG = { '待处理': '#FFF7E6', '已揽件': '#E6F0FF', '已寄件': '#F6FFED', '已完成': '#F5F7FA' }

const LOGISTICS = [
  { time: '2024-04-26 15:30', text: '快件已签收' },
  { time: '2024-04-26 09:12', text: '快件派送中' },
  { time: '2024-04-18 11:40', text: '已揽件，运输中' },
]

export default function StudentOrders() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('ship')
  const [shipOrders, setShipOrders] = useState([])
  const [parcels, setParcels] = useState([])
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [s, p] = await Promise.all([
        shipOrderApi.list({ pageSize: 50 }),
        user?.phone ? parcelApi.mine(user.phone) : Promise.resolve({ code: 0, data: [] }),
      ])
      if (s.code === 0) setShipOrders(s.data.list)
      if (p.code === 0) setParcels(p.data)
    } catch {
      message.error('加载失败')
    }
  }

  return (
    <div>
      <div style={{ height: 62, background: '#fff' }} />
      <div style={{ background: '#fff', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #E8ECF0' }}>
        <div style={{ fontWeight: 600, fontSize: 17 }}>我的订单</div>
      </div>

      {/* 用户信息 + 退出登录 */}
      <div style={{ background: '#fff', margin: '12px 16px 0', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E6F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{user?.real_name || user?.username}</div>
            <div style={{ color: '#9CA3AF', fontSize: 12 }}>学生</div>
          </div>
        </div>
        <Button
          icon={<LogoutOutlined />}
          size="small"
          danger
          onClick={() => { logout(); navigate('/login') }}
        >
          退出登录
        </Button>
      </div>

      <div style={{ background: '#fff', display: 'flex', borderBottom: '1px solid #E8ECF0', padding: '0 16px', marginTop: 12 }}>
        {[{ key: 'ship', label: '寄件订单' }, { key: 'pickup', label: '取件记录' }].map(({ key, label }) => (
          <div
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '12px 8px', marginRight: 24, cursor: 'pointer', fontSize: 14,
              color: tab === key ? '#1677FF' : '#6B7280',
              borderBottom: tab === key ? '2px solid #1677FF' : '2px solid transparent',
              fontWeight: tab === key ? 600 : 400,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tab === 'ship' && (
          shipOrders.length === 0
            ? <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>暂无寄件订单</div>
            : shipOrders.map((o) => (
              <div key={o.id} style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{o.order_no}</div>
                  <div style={{ background: STATUS_BG[o.status], color: STATUS_COLOR[o.status], borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
                    {o.status}
                  </div>
                </div>
                <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 4 }}>
                  寄往：{o.receiver_address || '未知地址'}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: 12, marginBottom: o.status === '已完成' ? 12 : 0 }}>
                  下单时间：{new Date(o.created_at).toLocaleString('zh-CN')}
                </div>

                {/* 物流轨迹（已完成订单展示） */}
                {o.status === '已完成' && (
                  <div>
                    <div
                      style={{ color: '#1677FF', fontSize: 13, cursor: 'pointer', marginBottom: 8 }}
                      onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    >
                      {expandedId === o.id ? '收起' : '物流轨迹 ▾'}
                    </div>
                    {expandedId === o.id && (
                      <div style={{ paddingLeft: 12, borderLeft: '2px solid #E8ECF0' }}>
                        {LOGISTICS.map((l, i) => (
                          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#1677FF' : '#E8ECF0', marginTop: 4, flexShrink: 0 }} />
                            <div>
                              <div style={{ fontSize: 13 }}>{l.text}</div>
                              <div style={{ color: '#9CA3AF', fontSize: 12 }}>{l.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
        )}

        {tab === 'pickup' && (
          parcels.length === 0
            ? <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>暂无取件记录</div>
            : parcels.map((p) => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.tracking_no}</div>
                  <div style={{ background: p.status === '已取件' ? '#F6FFED' : '#FFF7E6', color: p.status === '已取件' ? '#52C41A' : '#FA8C16', borderRadius: 6, padding: '2px 8px', fontSize: 12 }}>
                    {p.status}
                  </div>
                </div>
                <div style={{ color: '#6B7280', fontSize: 13 }}>取件码：{p.pickup_code}</div>
                <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
                  入库时间：{new Date(p.inbound_at).toLocaleString('zh-CN')}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}
