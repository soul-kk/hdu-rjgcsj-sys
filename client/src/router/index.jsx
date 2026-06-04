import { createBrowserRouter, Navigate } from 'react-router-dom'
import RequireAuth from './RequireAuth'

import LoginPage from '../pages/LoginPage'

// 管理员页面
import AdminLayout from '../pages/admin/AdminLayout'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminInbound from '../pages/admin/AdminInbound'
import AdminPickup from '../pages/admin/AdminPickup'
import AdminShipOrders from '../pages/admin/AdminShipOrders'
import AdminDetained from '../pages/admin/AdminDetained'

// 学生页面
import StudentLayout from '../pages/student/StudentLayout'
import StudentHome from '../pages/student/StudentHome'
import StudentPickup from '../pages/student/StudentPickup'
import StudentShip from '../pages/student/StudentShip'
import StudentOrders from '../pages/student/StudentOrders'

// 快递员页面
import CourierLayout from '../pages/courier/CourierLayout'
import CourierList from '../pages/courier/CourierList'
import CourierVoucher from '../pages/courier/CourierVoucher'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/403', element: <div style={{ padding: 40, textAlign: 'center' }}>无权限访问</div> },

  // 管理员
  {
    path: '/admin',
    element: <RequireAuth roles={['admin']}><AdminLayout /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'inbound', element: <AdminInbound /> },
      { path: 'pickup', element: <AdminPickup /> },
      { path: 'ship-orders', element: <AdminShipOrders /> },
      { path: 'detained', element: <AdminDetained /> },
    ],
  },

  // 学生
  {
    path: '/student',
    element: <RequireAuth roles={['student']}><StudentLayout /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/student/home" replace /> },
      { path: 'home', element: <StudentHome /> },
      { path: 'pickup', element: <StudentPickup /> },
      { path: 'ship', element: <StudentShip /> },
      { path: 'orders', element: <StudentOrders /> },
    ],
  },

  // 快递员
  {
    path: '/courier',
    element: <RequireAuth roles={['courier']}><CourierLayout /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/courier/list" replace /> },
      { path: 'list', element: <CourierList /> },
      { path: 'voucher/:id', element: <CourierVoucher /> },
    ],
  },

  // 根路径重定向（登录后按角色跳转）
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <Navigate to="/login" replace /> },
])

export default router
