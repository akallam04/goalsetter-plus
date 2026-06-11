import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Attach the JWT to every request so callers never juggle headers
client.interceptors.request.use((config) => {
  const saved = localStorage.getItem('auth')
  if (saved) {
    const { token } = JSON.parse(saved)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401: clears stale/expired token and redirects to login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
