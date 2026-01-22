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
  const [loading, setLoading] = useState(true)

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
      const { token: newToken, role: userRole, department, departments } = response.data
      setToken(newToken)
      localStorage.setItem('token', newToken)
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
