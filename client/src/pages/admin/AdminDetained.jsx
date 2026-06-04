import { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Tag, Button, message, Popconfirm } from 'antd'
import { detainedApi } from '../../api'

const HANDLE_COLOR = { '待退回': 'red', '处理中': 'orange', '已退回': 'default' }

export default function AdminDetained() {
  const [stats, setStats] = useState({ total: 0, processing: 0, returned: 0, monthReturned: 0 })
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [s, l] = await Promise.all([detainedApi.stats(), detainedApi.list()])
      if (s.code === 0) setStats(s.data)
      if (l.code === 0) setList(l.data)
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleReturn(id) {
    const res = await detainedApi.returnParcel(id)
    if (res.code !== 0) { message.error(res.message); return }
    message.success(`退回成功，退回单号：${res.data.return_no}`)
    loadData()
  }

  const STAT_CARDS = [
    { label: '滞留包裹', value: stats.total, color: '#FF4D4F', bg: '#FFF1F0' },
    { label: '处理中', value: stats.processing, color: '#FA8C16', bg: '#FFF7E6' },
    { label: '待退回', value: stats.returned, color: '#6B7280', bg: '#F5F7FA' },
    { label: '本月已退回', value: stats.monthReturned, color: '#52C41A', bg: '#F6FFED' },
  ]

  const columns = [
    { title: '快递单号', key: 'tracking_no', render: (_, r) => r.parcel?.tracking_no || '-', width: 180 },
    { title: '收件人', key: 'recipient_name', render: (_, r) => r.parcel?.recipient_name || '-', width: 90 },
    { title: '入库时间', key: 'inbound_at', render: (_, r) => r.parcel ? new Date(r.parcel.inbound_at).toLocaleDateString('zh-CN') : '-', width: 120 },
    { title: '滞留天数', dataIndex: 'detained_days', key: 'detained_days', width: 90,
      render: (v) => <span style={{ color: '#FF4D4F', fontWeight: 600 }}>{v}天</span> },
    { title: '通知状态', key: 'notify_status', render: (_, r) => r.parcel?.notify_status || '-', width: 90 },
    { title: '处理状态', dataIndex: 'handle_status', key: 'handle_status', width: 90,
      render: (v) => <Tag color={HANDLE_COLOR[v]}>{v}</Tag> },
    { title: '操作', key: 'action', width: 100,
      render: (_, r) => (
        r.handle_status !== '已退回'
          ? (
            <Popconfirm title="确认退回该包裹？" onConfirm={() => handleReturn(r.id)} okText="确认" cancelText="取消">
              <Button type="primary" danger size="small">执行退回</Button>
            </Popconfirm>
          )
          : <span style={{ color: '#9CA3AF' }}>已退回</span>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>滞留包裹管理</div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {STAT_CARDS.map((c) => (
          <Col span={6} key={c.label}>
            <Card style={{ borderRadius: 8, background: c.bg, border: 'none' }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: c.color }}>{c.value}</div>
              <div style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>{c.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="滞留包裹列表" style={{ borderRadius: 8 }}
        extra={<Button size="small" onClick={loadData}>刷新</Button>}>
        <Table
          dataSource={list}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
        />
      </Card>
    </div>
  )
}
