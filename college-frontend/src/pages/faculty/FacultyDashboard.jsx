import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboardCheck, faMarker, faUserGraduate, faChalkboard, faUserTie } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const FacultyDashboard = () => {
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
      const response = await api.get('/faculty/dashboard')
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

  if (!dashboard) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Faculty Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile & Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faUserTie} className="mr-2 text-blue-500" />
                Department Info
            </h2>
            <div className="space-y-2">
                <p className="text-gray-600">Department: <span className="font-semibold text-gray-800">{dashboard.department || 'N/A'}</span></p>
                <p className="text-gray-600">HOD: <span className="font-semibold text-gray-800">{dashboard.hodName || 'Not assigned'}</span></p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FontAwesomeIcon icon={faChalkboard} className="mr-2 text-green-500" />
                Assigned Subjects
            </h2>
            {dashboard.subjects && dashboard.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dashboard.subjects.map((subject, idx) => (
                    <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {subject}
                    </span>
                  ))}
                </div>
            ) : (
                <p className="text-gray-500 italic">No subjects assigned</p>
            )}
          </div>
        </div>

        {/* Actions Grid */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div 
                onClick={() => navigate('/faculty/attendance')}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 group"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-500 text-white p-3 rounded-full group-hover:bg-purple-600 transition-colors">
                        <FontAwesomeIcon icon={faClipboardCheck} size="lg" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance</h3>
                <p className="text-gray-600">Manage student attendance</p>
            </div>

            <div 
                onClick={() => navigate('/faculty/marks')}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 group"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-500 text-white p-3 rounded-full group-hover:bg-orange-600 transition-colors">
                        <FontAwesomeIcon icon={faMarker} size="lg" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Marks</h3>
                <p className="text-gray-600">Enter and update student marks</p>
            </div>
        </div>

        {/* Students by Year */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Students by Year</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((year) => (
            <div
              key={year}
              onClick={() => navigate(`/faculty/students/${year}`)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 border-t-4 border-blue-400"
            >
              <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 font-medium">Year {year}</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">
                        {dashboard.studentCountByYear?.[year] || 0}
                    </p>
                  </div>
                  <FontAwesomeIcon icon={faUserGraduate} className="text-gray-300 text-4xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FacultyDashboard
