import request from './request'

export const authApi = {
  login: (data) => request.post('/auth/login', data),
  me: () => request.get('/auth/me'),
}

export const parcelApi = {
  stats: () => request.get('/parcels/stats'),
  list: (params) => request.get('/parcels', { params }),
  search: (keyword) => request.get('/parcels/search', { params: { keyword } }),
  inbound: (data) => request.post('/parcels', data),
  notify: (id) => request.put(`/parcels/${id}/notify`),
  pickup: (data) => request.post('/parcels/pickup', data),
  mine: (phone) => request.get('/parcels/mine', { params: { phone } }),
}

export const shipOrderApi = {
  create: (data) => request.post('/ship-orders', data),
  list: (params) => request.get('/ship-orders', { params }),
  courierList: (params) => request.get('/ship-orders/courier', { params }),
  accept: (id, data) => request.put(`/ship-orders/${id}/accept`, data),
  voucher: (id) => request.get(`/ship-orders/${id}/voucher`),
  courierConfirm: (id) => request.put(`/ship-orders/${id}/courier-confirm`),
}

export const detainedApi = {
  stats: () => request.get('/detained/stats'),
  list: () => request.get('/detained'),
  returnParcel: (id) => request.post(`/detained/${id}/return`),
}

export const notificationApi = {
  mine: (phone) => request.get('/notifications/mine', { params: { phone } }),
  read: (id) => request.put(`/notifications/${id}/read`),
  readAll: (phone) => request.put('/notifications/read-all', { phone }),
}
