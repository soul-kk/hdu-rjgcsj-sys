import { useState } from 'react'
import { Card, Form, Input, Button, message, Row, Col, InputNumber } from 'antd'
import { InboxOutlined, BellOutlined } from '@ant-design/icons'
import { parcelApi } from '../../api'

export default function AdminInbound() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null) // 入库成功后的包裹信息

  async function onFinish(values) {
    setLoading(true)
    try {
      const res = await parcelApi.inbound(values)
      if (res.code !== 0) { message.error(res.message); return }
      setResult(res.data)
      form.resetFields()
    } catch {
      message.error('入库失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  async function sendNotify() {
    if (!result) return
    const res = await parcelApi.notify(result.id)
    if (res.code === 0) message.success('取件通知已发送')
    else message.error(res.message)
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>包裹入库</div>
      <Row gutter={24}>
        {/* 左侧：录入表单 */}
        <Col span={12}>
          <Card title="录入包裹信息" style={{ borderRadius: 8 }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item label="快递单号" name="tracking_no" rules={[{ required: true, message: '请输入快递单号' }]}>
                <Input prefix={<InboxOutlined style={{ color: '#9CA3AF' }} />} placeholder="SF1234567890" />
              </Form.Item>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="收件人姓名" name="recipient_name" rules={[{ required: true, message: '请输入姓名' }]}>
                    <Input placeholder="张同学" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="收件人手机号" name="recipient_phone" rules={[{ required: true, message: '请输入手机号' }]}>
                    <Input placeholder="138****8888" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="重量（kg）" name="weight">
                    <InputNumber min={0.01} max={999} precision={2} placeholder="0.00" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="运费（元）" name="freight">
                    <InputNumber min={0} max={99999} precision={2} placeholder="0.00" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="备注（可选）" name="remark">
                <Input.TextArea placeholder="如：易碎物品、请轻放" rows={3} />
              </Form.Item>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button type="primary" htmlType="submit" loading={loading} icon={<InboxOutlined />}>
                  确认入库
                </Button>
                <Button onClick={() => { form.resetFields(); setResult(null) }}>重置</Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* 右侧：入库结果 */}
        <Col span={12}>
          <Card title="入库结果" style={{ borderRadius: 8, minHeight: 300 }}>
            {result ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: '#52C41A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: 24, color: '#fff',
                }}>✓</div>
                <div style={{ color: '#52C41A', fontWeight: 600, fontSize: 16, marginBottom: 20 }}>入库成功！</div>

                <div style={{
                  background: '#E6F0FF', borderRadius: 12, padding: '20px 24px', marginBottom: 16,
                }}>
                  <div style={{ color: '#6B7280', fontSize: 12, marginBottom: 4 }}>取件码</div>
                  <div style={{ fontSize: 40, fontWeight: 800, color: '#1677FF', letterSpacing: 6 }}>
                    {result.pickup_code}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
                    请将取件码告知收件人
                  </div>
                </div>

                <Button
                  type="primary" icon={<BellOutlined />} block
                  onClick={sendNotify}
                >
                  发送取件通知
                </Button>
                <div style={{ color: '#9CA3AF', fontSize: 12, marginTop: 8 }}>
                  已通知 {result.recipient_phone}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
                填写左侧表单并确认入库后，取件码将显示在这里
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
