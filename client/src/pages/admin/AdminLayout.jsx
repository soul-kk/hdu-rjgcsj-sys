import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Avatar } from 'antd'
import {
  DashboardOutlined, InboxOutlined, CheckSquareOutlined,
  SendOutlined, WarningOutlined, LogoutOutlined, UserOutlined,
} from '@ant-design/icons'
import useAuthStore from '../../store/authStore'

const { Sider, Content } = Layout

const MENU_ITEMS = [
  { key: '/admin/dashboard', icon: <DashboardOutlined />, label: '首页看板' },
  { key: '/admin/inbound', icon: <InboxOutlined />, label: '包裹入库' },
  { key: '/admin/pickup', icon: <CheckSquareOutlined />, label: '取件核验' },
  { key: '/admin/ship-orders', icon: <SendOutlined />, label: '寄件订单' },
  { key: '/admin/detained', icon: <WarningOutlined />, label: '滞留管理' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#001529', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>学生驿站</div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 2 }}>管理后台</div>
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={MENU_ITEMS}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, borderRight: 0 }}
        />

        {/* 底部用户信息 */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Avatar size={32} icon={<UserOutlined />} style={{ background: '#1677FF', flexShrink: 0 }} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.username}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>管理员</div>
          </div>
          <Button
            type="text" icon={<LogoutOutlined />} size="small"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onClick={handleLogout}
          />
        </div>
      </Sider>

      <Layout>
        <Content style={{ background: '#F0F2F5', minHeight: '100vh' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
