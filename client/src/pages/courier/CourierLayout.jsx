import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { UnorderedListOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons'
import useAuthStore from '../../store/authStore'

export default function CourierLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const TABS = [
    { path: '/courier/list', icon: UnorderedListOutlined, label: '列表' },
    { path: '/courier/profile', icon: UserOutlined, label: '我的' },
  ]

  return (
    <div style={{ maxWidth: 390, margin: '0 auto', minHeight: '100vh', background: '#F5F7FA', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, paddingBottom: 83 }}>
        <Outlet />
      </div>
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 390, background: '#fff', borderTop: '1px solid #E8ECF0',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '12px 21px 21px', zIndex: 100,
      }}>
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname.startsWith(path)
          return (
            <div key={path} onClick={() => path !== '/courier/profile' ? navigate(path) : (logout(), navigate('/login'))}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: 4 }}>
              {active && path !== '/courier/profile' ? (
                <div style={{ background: '#1677FF', borderRadius: 20, padding: '6px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon style={{ color: '#fff', fontSize: 16 }} />
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{label}</span>
                </div>
              ) : (
                <>
                  <Icon style={{ color: '#9CA3AF', fontSize: 20 }} />
                  <span style={{ color: '#9CA3AF', fontSize: 11 }}>{label === '我的' ? '退出' : label}</span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
