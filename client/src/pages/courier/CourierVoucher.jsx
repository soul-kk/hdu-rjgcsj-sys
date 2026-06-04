import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, message } from 'antd'
import { LeftOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { shipOrderApi } from '../../api'

export default function CourierVoucher() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => { loadVoucher() }, [id])

  async function loadVoucher() {
    const res = await shipOrderApi.voucher(id)
    if (res.code === 0) setData(res.data)
    else message.error(res.message)
  }

  async function handleConfirm() {
    setConfirming(true)
    try {
      const res = await shipOrderApi.courierConfirm(id)
      if (res.code !== 0) { message.error(res.message); return }
      message.success('已确认取件')
      navigate('/courier/list')
    } catch {
      message.error('操作失败')
    } finally {
      setConfirming(false)
    }
  }

  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>加载中...</div>

  const { order, voucher } = data

  return (
    <div>
      <div style={{ height: 62, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
        <LeftOutlined style={{ fontSize: 18, cursor: 'pointer' }} onClick={() => navigate(-1)} />
      </div>
      <div style={{ background: '#fff', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #E8ECF0' }}>
        <div style={{ fontWeight: 600, fontSize: 17 }}>凭证详情</div>
      </div>

      <div style={{ padding: '20px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 凭证卡片 */}
        <div style={{ background: 'linear-gradient(135deg, #1677FF 0%, #0050b3 100%)', borderRadius: 16, padding: 20, color: '#fff' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📄</div>
            <div>
              <div style={{ fontWeight: 600 }}>寄件凭证</div>
              <div style={{ opacity: 0.8, fontSize: 13 }}>{voucher.voucher_no}</div>
            </div>
          </div>

          {[
            ['寄件人', `${order.sender_name} ${order.sender_phone}`],
            ['收件人', `${order.receiver_name} ${order.receiver_phone}`],
            ['收件地址', order.receiver_address],
            ['运费', `¥ ${order.freight}`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ opacity: 0.7 }}>{label}</span>
              <span style={{ fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* 物品信息 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>物品信息</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#6B7280' }}>
            <div>
              <div style={{ marginBottom: 4 }}>物品类型</div>
              <div style={{ color: '#1A1A2E', fontWeight: 500 }}>{order.item_type}</div>
            </div>
            <div>
              <div style={{ marginBottom: 4 }}>重量</div>
              <div style={{ color: '#1A1A2E', fontWeight: 500 }}>{order.weight} kg</div>
            </div>
            <div>
              <div style={{ marginBottom: 4 }}>揽件时间</div>
              <div style={{ color: '#1A1A2E', fontWeight: 500 }}>{new Date(voucher.issued_at).toLocaleDateString('zh-CN')}</div>
            </div>
          </div>
        </div>

        {/* 提示 */}
        <div style={{ background: '#FFF7E6', borderRadius: 8, padding: '10px 14px', color: '#FA8C16', fontSize: 13 }}>
          ⚠ 请核对凭证信息后再确认取件
        </div>

        {order.status === '已揽件' && (
          <Button
            type="primary" block size="large" icon={<CheckCircleOutlined />}
            loading={confirming} onClick={handleConfirm}
            style={{ borderRadius: 12, height: 50, fontSize: 16, background: '#52C41A', borderColor: '#52C41A' }}
          >
            确认取件
          </Button>
        )}

        {order.status === '已寄件' && (
          <div style={{ textAlign: 'center', color: '#52C41A', fontWeight: 600, padding: '12px 0' }}>
            ✓ 已完成取件
          </div>
        )}
      </div>
    </div>
  )
}
