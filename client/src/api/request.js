import axios from 'axios'

const request = axios.create({ baseURL: '/api', timeout: 10000 })

request.interceptors.request.use((config) => {
  const storage = import.meta.env.DEV ? sessionStorage : localStorage
  const token = storage.getItem('token')
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('请求失败:', err)
    return Promise.reject(err)
  }
)

export default request
