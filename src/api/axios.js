import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Inyectar JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ra_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el backend devuelve 401, limpiar sesión y redirigir a login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ra_token')
      localStorage.removeItem('ra_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
