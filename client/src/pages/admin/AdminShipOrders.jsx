import { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, InputNumber, message, Select } from 'antd'
import { shipOrderApi } from '../../api'

const STATUS_COLOR = { '待处理': 'orange', '已揽件': 'blue', '已寄件': 'cyan', '已完成': 'green' }
const STATUS_OPTIONS = [
  { value: '', label: '全部' },
  { value: '待处理', label: '待处理' },
  { value: '已揽件', label: '已揽件' },
  { value: '已寄件', label: '已寄件' },
  { value: '已完成', label: '已完成' },
]

export default function AdminShipOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => { loadOrders() }, [statusFilter])

  async function loadOrders() {
    setLoading(true)
    try {
      const res = await shipOrderApi.list({ status: statusFilter || undefined, pageSize: 50 })
      if (res.code === 0) setOrders(res.data.list)
    } catch {
      message.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  function openAccept(order) {
    setCurrentOrder(order)
    form.resetFields()
    setModalOpen(true)
  }

  async function handleAccept() {
    const values = await form.validateFields()
    const res = await shipOrderApi.accept(currentOrder.id, values)
    if (res.code !== 0) { message.error(res.message); return }
    message.success('揽件确认成功，凭证已生成')
    setModalOpen(false)
    loadOrders()
  }

  const columns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no', width: 180 },
    { title: '寄件人', dataIndex: 'sender_name', key: 'sender_name', width: 90 },
    { title: '收件人', dataIndex: 'receiver_name', key: 'receiver_name', width: 90 },
    { title: '物品类型', dataIndex: 'item_type', key: 'item_type', width: 100 },
    { title: '下单时间', dataIndex: 'created_at', key: 'created_at', width: 160,
      render: (v) => new Date(v).toLocaleString('zh-CN') },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (v) => <Tag color={STATUS_COLOR[v]}>{v}</Tag> },
    { title: '操作', key: 'action', width: 100,
      render: (_, r) => (
        r.status === '待处理'
          ? <Button type="primary" size="small" onClick={() => openAccept(r)}>揽件确认</Button>
          : <Button type="link" size="small" onClick={() => viewVoucher(r.id)}>查看凭证</Button>
      ),
    },
  ]

  async function viewVoucher(id) {
    const res = await shipOrderApi.voucher(id)
    if (res.code !== 0) { message.info(res.message); return }
    Modal.info({
      title: '寄件凭证',
      content: (
        <div>
          <p>凭证号：<strong>{res.data.voucher.voucher_no}</strong></p>
          <p>订单号：{res.data.order.order_no}</p>
          <p>运费：¥{res.data.order.freight}</p>
          <p>重量：{res.data.order.weight} kg</p>
        </div>
      ),
    })
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>寄件订单管理</div>

      <Card style={{ borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {STATUS_OPTIONS.map((o) => (
            <Button
              key={o.value}
              type={statusFilter === o.value ? 'primary' : 'default'}
              size="small"
              onClick={() => setStatusFilter(o.value)}
            >
              {o.label}
            </Button>
          ))}
        </div>

        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
        />
      </Card>

      <Modal
        title={`揽件确认 — ${currentOrder?.order_no}`}
        open={modalOpen}
        onOk={handleAccept}
        onCancel={() => setModalOpen(false)}
        okText="确认揽件并生成凭证"
      >
        <Form form={form} layout="inline" style={{ marginTop: 16 }}>
          <Form.Item label="实际重量(kg)" name="weight" rules={[{ required: true, message: '请填写重量' }]}>
            <InputNumber min={0.1} step={0.1} precision={1} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item label="运费(元)" name="freight" rules={[{ required: true, message: '请填写运费' }]}>
            <InputNumber min={0} step={1} precision={2} style={{ width: 120 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
