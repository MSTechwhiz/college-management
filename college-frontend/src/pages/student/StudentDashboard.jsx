import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faUserGraduate, faMoneyBillWave, faClipboardCheck, faMarker, 
  faBullhorn, faFileAlt, faSignOutAlt, faUser, faBuilding, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons'
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
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition-colors"
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
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-xl mr-2" />
              <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={logout} 
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
            Student Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
                <p className="text-sm text-gray-500">Register Number</p>
                <p className="font-semibold text-gray-800">{dashboard.student?.registerNumber || 'N/A'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold text-gray-800">{dashboard.student?.fullName || 'N/A'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-semibold text-gray-800">{dashboard.student?.department || 'N/A'}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Year</p>
                <p className="font-semibold text-gray-800">{dashboard.student?.year || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-green-500" />
                Fees Summary
            </h2>
            {dashboard.feesSummary ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">₹{dashboard.feesSummary.total || 0}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium text-green-600">₹{dashboard.feesSummary.paid || 0}</span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-600 font-medium">Pending:</span>
                    <span className="font-bold text-red-600">₹{dashboard.feesSummary.pending || 0}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No fee information available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faClipboardCheck} className="mr-2 text-purple-500" />
                Attendance Overview
            </h2>
            {dashboard.attendancePercentage !== undefined ? (
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-purple-600 mb-2">{dashboard.attendancePercentage.toFixed(2)}%</div>
                <p className="text-sm text-gray-500">Overall Attendance</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No attendance data available</p>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Menu</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div 
                onClick={() => navigate('/student/fees')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 text-center group"
            >
                <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faMoneyBillWave} size="lg" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-green-600">Fees</span>
            </div>

            <div 
                onClick={() => navigate('/student/attendance')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 text-center group"
            >
                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faClipboardCheck} size="lg" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-purple-600">Attendance</span>
            </div>

            <div 
                onClick={() => navigate('/student/marks')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 text-center group"
            >
                <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faMarker} size="lg" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-orange-600">Marks</span>
            </div>

            <div 
                onClick={() => navigate('/student/announcements')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 text-center group"
            >
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faBullhorn} size="lg" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-blue-600">Announcements</span>
            </div>

            <div 
                onClick={() => navigate('/student/reports')}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all transform hover:-translate-y-1 text-center group"
            >
                <div className="bg-red-100 text-red-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    <FontAwesomeIcon icon={faFileAlt} size="lg" />
                </div>
                <span className="font-medium text-gray-700 group-hover:text-red-600">Reports</span>
            </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
