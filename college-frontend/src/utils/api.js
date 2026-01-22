import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    })

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.userMessage = 'Request timeout. Please try again.'
      } else if (error.message === 'Network Error') {
        error.userMessage = 'Backend not reachable. Please check if the server is running.'
      } else {
        error.userMessage = 'Network error. Please check your connection.'
      }
    } else {
      // Handle HTTP errors
      const status = error.response.status
      const data = error.response.data

      if (status === 401) {
        error.userMessage = 'Unauthorized. Please login again.'
      } else if (status === 403) {
        error.userMessage = 'Access forbidden.'
      } else if (status === 404) {
        error.userMessage = 'Resource not found.'
      } else if (status >= 500) {
        error.userMessage = 'Server error. Please try again later.'
      } else {
        // Use backend error message if available
        error.userMessage = typeof data === 'string' ? data : data?.message || 'An error occurred.'
      }
    }

    return Promise.reject(error)
  }
)

export default api
