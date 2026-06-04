import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { HomeOutlined, InboxOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import useAuthStore from '../../store/authStore'

const TABS = [
  { path: '/student/home', icon: HomeOutlined, label: '首页' },
  { path: '/student/pickup', icon: InboxOutlined, label: '取件' },
  { path: '/student/ship', icon: SendOutlined, label: '寄件' },
  { path: '/student/orders', icon: UserOutlined, label: '我的' },
]

export default function StudentLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', minHeight: '100vh', background: '#F5F7FA', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      {/* 页面内容 */}
      <div style={{ flex: 1, paddingBottom: 83, overflowY: 'auto' }}>
        <Outlet />
      </div>

      {/* 底部 tabbar */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 390, background: '#fff', borderTop: '1px solid #E8ECF0',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '12px 21px 21px', zIndex: 100,
      }}>
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path
          return (
            <div
              key={path}
              onClick={() => navigate(path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 4 }}
            >
              {active ? (
                <div style={{
                  background: '#1677FF', borderRadius: 20, padding: '6px 20px',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Icon style={{ color: '#fff', fontSize: 16 }} />
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{label}</span>
                </div>
              ) : (
                <>
                  <Icon style={{ color: '#9CA3AF', fontSize: 20 }} />
                  <span style={{ color: '#9CA3AF', fontSize: 11 }}>{label}</span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
