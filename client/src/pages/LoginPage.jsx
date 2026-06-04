import { useState } from 'react'
import { Form, Input, Select, Button, message, Card } from 'antd'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'
import useAuthStore from '../store/authStore'

const ROLE_OPTIONS = [
  { value: 'admin', label: '驿站管理员' },
  { value: 'student', label: '学生' },
  { value: 'courier', label: '快递员' },
]

const ROLE_HOME = { admin: '/admin/dashboard', student: '/student/home', courier: '/courier/list' }

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('student')
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  async function onFinish(values) {
    setLoading(true)
    try {
      const res = await authApi.login(values)
      if (res.code !== 0) { message.error(res.message); return }
      setAuth(res.data.token, res.data.user)
      message.success('登录成功')
      navigate(ROLE_HOME[res.data.user.role])
    } catch {
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1677FF 0%, #0050b3 100%)',
    }}>
      <Card style={{ width: 380, borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1677FF' }}>学生驿站</div>
          <div style={{ color: '#6B7280', marginTop: 4 }}>校园快递驿站数字化管理系统</div>
        </div>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ role: 'student' }}>
          <Form.Item label="账号" name="username" rules={[{ required: true, message: '请输入账号' }]}>
            <Input placeholder="请输入账号" size="large" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" size="large" />
          </Form.Item>
          <Form.Item label="身份" name="role" rules={[{ required: true }]}>
            <Select options={ROLE_OPTIONS} size="large" onChange={setRole} />
          </Form.Item>
          {role === 'student' && (
            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入正确的11位手机号' },
              ]}
            >
              <Input placeholder="用于接收取件通知" size="large" maxLength={11} />
            </Form.Item>
          )}
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              登录 / 注册
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16, color: '#9CA3AF', fontSize: 12 }}>
          首次登录将自动创建账号
        </div>
      </Card>
    </div>
  )
}
