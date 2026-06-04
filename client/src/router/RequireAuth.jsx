import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function RequireAuth({ children, roles }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/403" replace />
  return children
}
