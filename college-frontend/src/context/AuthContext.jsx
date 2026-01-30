import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'))
  const [loading, setLoading] = useState(true)
  const [warnTimer, setWarnTimer] = useState(null)
  const [logoutTimer, setLogoutTimer] = useState(null)

  useEffect(() => {
    const initializeAuth = () => {
      if (token) {
        // Decode token to get user info (simplified)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          setUser({
            username: payload.sub,
            role: payload.role,
            department: payload.department,
            departments: payload.departments || null
          })
          if (payload.exp) {
            const expMs = payload.exp * 1000
            const now = Date.now()
            const warnAt = Math.max(expMs - 60_000 - now, 0)
            const logoutAt = Math.max(expMs - now, 0)
            if (warnTimer) clearTimeout(warnTimer)
            if (logoutTimer) clearTimeout(logoutTimer)
            setWarnTimer(setTimeout(() => {
              alert('Session will expire soon.')
            }, warnAt))
            setLogoutTimer(setTimeout(async () => {
              try {
                if (refreshToken) {
                  const resp = await api.post('/auth/refresh', { refreshToken })
                  const { token: newToken, refreshToken: newRefreshToken, role: userRole, department, departments } = resp.data
                  setToken(newToken)
                  localStorage.setItem('token', newToken)
                  if (newRefreshToken) {
                    setRefreshToken(newRefreshToken)
                    localStorage.setItem('refreshToken', newRefreshToken)
                  }
                  setUser({ username: payload.sub, role: userRole, department, departments })
                } else {
                  alert('Session expired. Please login again.')
                  logout()
                }
              } catch (e) {
                alert('Session expired. Please login again.')
                logout()
              }
            }, logoutAt))
          }
        } catch (e) {
          console.error('Error decoding token:', e)
          // Invalid token - clear it
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      // Always set loading to false, even if no token
      setLoading(false)
    }
    
    initializeAuth()
  }, [token])

  const login = async (username, password, role) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
        role
      })
      const { token: newToken, refreshToken: newRefreshToken, role: userRole, department, departments } = response.data
      setToken(newToken)
      localStorage.setItem('token', newToken)
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken)
        localStorage.setItem('refreshToken', newRefreshToken)
      }
      setUser({ username, role: userRole, department, departments })
      return { success: true, needsDepartment: !department && departments && departments.length > 0 }
    } catch (error) {
      // Use user-friendly error message from interceptor
      const errorMessage = error.userMessage || error.response?.data || error.message || 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  const selectDepartment = async (department) => {
    try {
      const response = await api.post('/auth/select-department', {
        department
      })
      const { token: newToken, role: userRole, department: selectedDept } = response.data
      setToken(newToken)
      localStorage.setItem('token', newToken)
      setUser({ ...user, department: selectedDept })
      return { success: true }
    } catch (error) {
      const errorMessage = error.userMessage || error.response?.data || error.message || 'Failed to select department'
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    if (refreshToken) {
      localStorage.removeItem('refreshToken')
      setRefreshToken(null)
    }
    if (warnTimer) clearTimeout(warnTimer)
    if (logoutTimer) clearTimeout(logoutTimer)
  }

  const value = {
    user,
    token,
    login,
    selectDepartment,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
