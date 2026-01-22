import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NotAuthorized = () => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this resource.
          <br />
          This may be due to department mismatch or insufficient privileges.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotAuthorized
