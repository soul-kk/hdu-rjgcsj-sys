import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Badge, message } from 'antd'
import { BellOutlined, RightOutlined } from '@ant-design/icons'
import useAuthStore from '../../store/authStore'
import { parcelApi, shipOrderApi, notificationApi } from '../../api'

const STATUS_COLOR = { '待处理': '#FA8C16', '已揽件': '#1677FF', '已寄件': '#52C41A', '已完成': '#9CA3AF' }
const STATUS_BG = { '待处理': '#FFF7E6', '已揽件': '#E6F0FF', '已寄件': '#F6FFED', '已完成': '#F5F7FA' }

export default function StudentHome() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [notifications, setNotifications] = useState([])
  const [shipOrders, setShipOrders] = useState([])

  useEffect(() => {
    if (user?.phone) {
      loadData()
    }
  }, [user, location.pathname])

  async function loadData() {
    try {
      const [n, s] = await Promise.all([
        notificationApi.mine(user.phone),
        shipOrderApi.list({ pageSize: 5 }),
      ])
      if (n.code === 0) setNotifications(n.data.filter(x => !x.is_read))
      if (s.code === 0) setShipOrders(s.data.list)
    } catch {
      // 静默失败
    }
  }

  const unreadCount = notifications.length

  return (
    <div>
      {/* 顶部状态栏占位 */}
      <div style={{ height: 62, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <div />
        <Badge count={unreadCount} size="small">
          <BellOutlined style={{ fontSize: 20, color: '#1A1A2E' }} onClick={() => navigate('/student/orders')} />
        </Badge>
      </div>

      {/* 标题栏 */}
      <div style={{ background: '#fff', padding: '0 20px 16px', borderBottom: '1px solid #E8ECF0' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>你好，{user?.real_name || user?.username} 👋</div>
        <div style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
          {unreadCount > 0 ? `今天有 ${unreadCount} 个包裹待取件` : '暂无待取件包裹'}
        </div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 待取件通知卡片 */}
        {unreadCount > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #1677FF 0%, #0050b3 100%)',
            borderRadius: 12, padding: 16, color: '#fff',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>📦 待取件通知</div>
                {notifications.slice(0, 2).map((n) => (
                  <div key={n.id} style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>
                    {n.content.slice(0, 30)}...
                  </div>
                ))}
              </div>
              <Badge count={unreadCount} style={{ background: '#FF4D4F' }} />
            </div>
            <div
              style={{
                marginTop: 12, background: 'rgba(255,255,255,0.2)', borderRadius: 8,
                padding: '8px 16px', textAlign: 'center', cursor: 'pointer', fontWeight: 600,
              }}
              onClick={() => navigate('/student/pickup')}
            >
              立即取件
            </div>
          </div>
        )}

        {/* 我的寄件 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>我的寄件</div>
            <div style={{ color: '#1677FF', fontSize: 13, cursor: 'pointer' }} onClick={() => navigate('/student/orders')}>
              查看全部 <RightOutlined style={{ fontSize: 11 }} />
            </div>
          </div>

          {shipOrders.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '24px 0', background: '#fff', borderRadius: 12 }}>
              暂无寄件订单
            </div>
          ) : (
            shipOrders.map((o) => (
              <div key={o.id} style={{
                background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10,
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: '#E6F0FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                  }}>📮</div>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>寄往{o.receiver_address?.slice(0, 10) || '未知地址'}</div>
                    <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>订单号 {o.order_no}</div>
                  </div>
                </div>
                <div style={{
                  background: STATUS_BG[o.status], color: STATUS_COLOR[o.status],
                  borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 500, flexShrink: 0,
                }}>
                  {o.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
