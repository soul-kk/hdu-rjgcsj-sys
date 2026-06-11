import { create } from 'zustand'

// 开发环境用 sessionStorage（每个标签页独立），方便同时测试多角色
// 生产环境用 localStorage（保持登录状态）
const storage = import.meta.env.DEV ? sessionStorage : localStorage

const useAuthStore = create((set) => ({
  token: storage.getItem('token') || null,
  user: JSON.parse(storage.getItem('user') || 'null'),

  setAuth: (token, user) => {
    storage.setItem('token', token)
    storage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    storage.removeItem('token')
    storage.removeItem('user')
    set({ token: null, user: null })
  },
}))

export default useAuthStore
