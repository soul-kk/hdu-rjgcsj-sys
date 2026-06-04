import { useState } from 'react'
import { Input, Button, message } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import useAuthStore from '../../store/authStore'
import { shipOrderApi } from '../../api'

const ITEM_TYPES = ['普通物品', '易碎物品', '液体物品', '电子产品']

function Section({ title, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <div style={{ width: 3, height: 16, background: color, borderRadius: 2 }} />
      <div style={{ fontWeight: 600, fontSize: 15 }}>{title}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  )
}

export default function StudentShip() {
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    sender_name: user?.real_name || '',
    sender_phone: user?.phone || '',
    sender_address: '',
    receiver_name: '',
    receiver_phone: '',
    receiver_address: '',
    item_type: '普通物品',
  })
  const [loading, setLoading] = useState(false)

  function update(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    if (!form.sender_name || !form.sender_phone) { message.warning('请填写寄件人信息'); return }
    if (!form.receiver_name || !form.receiver_phone || !form.receiver_address) { message.warning('请填写收件人信息'); return }
    setLoading(true)
    try {
      const res = await shipOrderApi.create(form)
      if (res.code !== 0) { message.error(res.message); return }
      message.success('寄件订单提交成功！')
      setForm(prev => ({ ...prev, receiver_name: '', receiver_phone: '', receiver_address: '' }))
    } catch {
      message.error('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div>
      <div style={{ height: 62, background: '#fff' }} />
      <div style={{ background: '#fff', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #E8ECF0' }}>
        <div style={{ fontWeight: 600, fontSize: 17 }}>寄件下单</div>
      </div>

      <div style={{ padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 寄件人 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <Section title="寄件人信息" color="#1677FF" />
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="姓名">
              <Input value={form.sender_name} onChange={(e) => update('sender_name', e.target.value)} placeholder="张同学" style={{ borderRadius: 8 }} />
            </Field>
            <Field label="手机号">
              <Input value={form.sender_phone} onChange={(e) => update('sender_phone', e.target.value)} placeholder="138****8888" style={{ borderRadius: 8 }} />
            </Field>
          </div>
          <Field label="地址">
            <Input value={form.sender_address} onChange={(e) => update('sender_address', e.target.value)} placeholder="北京市海淀区学院路 XX 号" style={{ borderRadius: 8 }} />
          </Field>
        </div>

        {/* 收件人 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <Section title="收件人信息" color="#FA8C16" />
          <div style={{ display: 'flex', gap: 12 }}>
            <Field label="姓名">
              <Input value={form.receiver_name} onChange={(e) => update('receiver_name', e.target.value)} placeholder="李同学" style={{ borderRadius: 8 }} />
            </Field>
            <Field label="手机号">
              <Input value={form.receiver_phone} onChange={(e) => update('receiver_phone', e.target.value)} placeholder="请输入手机号" style={{ borderRadius: 8 }} />
            </Field>
          </div>
          <Field label="收件地址">
            <Input value={form.receiver_address} onChange={(e) => update('receiver_address', e.target.value)} placeholder="上海市浦东新区..." style={{ borderRadius: 8 }} />
          </Field>
        </div>

        {/* 物品信息 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <Section title="物品信息" color="#52C41A" />
          <Field label="物品类型">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ITEM_TYPES.map((t) => (
                <div
                  key={t}
                  onClick={() => update('item_type', t)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                    background: form.item_type === t ? '#1677FF' : '#F5F7FA',
                    color: form.item_type === t ? '#fff' : '#6B7280',
                    border: `1px solid ${form.item_type === t ? '#1677FF' : '#E8ECF0'}`,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </Field>
        </div>

        {/* 提交按钮 */}
        <Button
          type="primary" block size="large" icon={<SendOutlined />}
          loading={loading} onClick={handleSubmit}
          style={{ borderRadius: 12, height: 50, fontSize: 16 }}
        >
          提交寄件订单
        </Button>
      </div>
    </div>
  )
}
