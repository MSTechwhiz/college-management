import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/not-authorized" replace />
  }

  if ((user.role === 'FACULTY' || user.role === 'STUDENT') && !user.department) {
    return <Navigate to="/select-department" replace />
  }

  return children
}

export default ProtectedRoute
