import { useEffect, useState } from 'react'
import { Card, Row, Col, Table, Tag, Button, Tabs, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { parcelApi } from '../../api'

const STATUS_COLOR = {
  '已入库': 'default', '待取件': 'blue', '已取件': 'green', '滞留': 'red', '已退回': 'orange',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, detained: 0, todayInbound: 0 })
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [s, p] = await Promise.all([
        parcelApi.stats(),
        parcelApi.list({ pageSize: 10 }),
      ])
      if (s.code === 0) setStats(s.data)
      if (p.code === 0) setParcels(p.data.list)
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '快递单号', dataIndex: 'tracking_no', key: 'tracking_no', width: 180 },
    { title: '收件人', dataIndex: 'recipient_name', key: 'recipient_name', width: 100 },
    { title: '取件码', dataIndex: 'pickup_code', key: 'pickup_code', width: 90,
      render: (v) => <span style={{ color: '#1677FF', fontWeight: 600 }}>{v || '-'}</span> },
    { title: '入库时间', dataIndex: 'inbound_at', key: 'inbound_at', width: 160,
      render: (v) => v ? new Date(v).toLocaleString('zh-CN') : '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v) => <Tag color={STATUS_COLOR[v]}>{v}</Tag> },
    { title: '操作', key: 'action', width: 80,
      render: (_, r) => (
        r.status === '已入库' || r.status === '待取件'
          ? <Button type="link" size="small" onClick={() => navigate('/admin/pickup')}>核验</Button>
          : null
      ),
    },
  ]

  const STAT_CARDS = [
    { label: '在库包裹', value: stats.total, unit: '件', color: '#1677FF', bg: '#E6F0FF' },
    { label: '待取件', value: stats.pending, unit: '件待取', color: '#FA8C16', bg: '#FFF7E6' },
    { label: '滞留包裹', value: stats.detained, unit: '件滞留', color: '#FF4D4F', bg: '#FFF1F0' },
    { label: '今日入库', value: stats.todayInbound, unit: '件今日', color: '#52C41A', bg: '#F6FFED' },
  ]

  return (
    <div style={{ padding: 24 }}>
      {/* 顶部标题栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>首页看板</div>
        <div style={{ color: '#6B7280', fontSize: 13 }}>{new Date().toLocaleDateString('zh-CN')}</div>
      </div>

      {/* 统计卡片 */}
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

      {/* 快捷操作 */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>快捷操作</div>
        <Tabs
          items={[
            { key: '1', label: '包裹入库', children: null },
            { key: '2', label: '取件核验', children: null },
            { key: '3', label: '处理寄件', children: null },
          ]}
          onChange={(k) => {
            if (k === '1') navigate('/admin/inbound')
            if (k === '2') navigate('/admin/pickup')
            if (k === '3') navigate('/admin/ship-orders')
          }}
        />
      </Card>

      {/* 最近入库记录 */}
      <Card style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>最近入库记录</div>
          <Button type="link" size="small" onClick={() => navigate('/admin/inbound')}>查看全部</Button>
        </div>
        <Table
          dataSource={parcels}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}
