import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const StudentDashboard = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user && user.username) {
      fetchDashboard()
    } else {
      setLoading(false)
      setError('User information not available')
    }
  }, [user])

  const fetchDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/student/dashboard')
      console.log('Dashboard response:', response.data)
      setDashboard(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      setError(error.userMessage || 'Failed to load dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-4xl mb-4 font-bold">!</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchDashboard}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Retry
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

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Data Available</h2>
          <p className="text-gray-600 mb-6">Dashboard data could not be loaded.</p>
          <button
            onClick={fetchDashboard}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/student/fees')}
                className="text-gray-600 hover:text-gray-800"
              >
                Fees
              </button>
              <button
                onClick={() => navigate('/student/attendance')}
                className="text-gray-600 hover:text-gray-800"
              >
                Attendance
              </button>
              <button
                onClick={() => navigate('/student/marks')}
                className="text-gray-600 hover:text-gray-800"
              >
                Marks
              </button>
              <button
                onClick={() => navigate('/student/announcements')}
                className="text-gray-600 hover:text-gray-800"
              >
                Announcements
              </button>
              <button
                onClick={() => navigate('/student/reports')}
                className="text-gray-600 hover:text-gray-800"
              >
                Reports
              </button>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Register Number:</strong> {dashboard.student?.registerNumber || 'N/A'}</p>
            <p><strong>Name:</strong> {dashboard.student?.fullName || 'N/A'}</p>
            <p><strong>Department:</strong> {dashboard.student?.department || 'N/A'}</p>
            <p><strong>Year:</strong> {dashboard.student?.year || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Fees Summary</h2>
            {dashboard.feesSummary ? (
              <>
                <p>Total: ₹{dashboard.feesSummary.total || 0}</p>
                <p>Paid: ₹{dashboard.feesSummary.paid || 0}</p>
                <p>Pending: ₹{dashboard.feesSummary.pending || 0}</p>
              </>
            ) : (
              <p className="text-gray-500">No fee information available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Attendance</h2>
            {dashboard.attendancePercentage !== undefined ? (
              <p className="text-3xl font-bold text-blue-600">{dashboard.attendancePercentage.toFixed(2)}%</p>
            ) : (
              <p className="text-gray-500">No attendance data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
