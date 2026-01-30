import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faClipboardCheck, faChartPie, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const AttendanceView = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.username) {
        fetchAttendance()
    }
  }, [user])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const studentId = user?.username 
      const response = await api.get(`/attendance/student/${studentId}`)
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
      alert(error.userMessage || 'Error fetching attendance')
    } finally {
        setLoading(false)
    }
  }

  const getSubjectStats = () => {
    const stats = {}
    attendance.forEach(att => {
      if (!stats[att.subject]) {
        stats[att.subject] = { present: 0, total: 0 }
      }
      stats[att.subject].total++
      if (att.present) stats[att.subject].present++
    })
    return stats
  }

  const stats = getSubjectStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/student/dashboard')} 
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800 border-l-2 border-gray-300 pl-4">
                Attendance
              </h1>
            </div>
            <button 
                onClick={logout} 
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faSignOutAlt} />
                Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
                <FontAwesomeIcon icon={faChartPie} className="mr-3 text-blue-600" />
                Subject-wise Attendance
            </h2>
            {Object.keys(stats).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p>No attendance records found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                {Object.entries(stats).map(([subject, stat]) => {
                    const percentage = stat.total > 0 ? (stat.present / stat.total) * 100 : 0
                    let colorClass = 'text-red-600'
                    if (percentage >= 75) colorClass = 'text-green-600'
                    else if (percentage >= 60) colorClass = 'text-yellow-600'

                    return (
                    <div key={subject} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between mb-2 items-end">
                        <span className="font-semibold text-lg text-gray-700">{subject}</span>
                        <span className={`font-bold text-2xl ${colorClass}`}>{percentage.toFixed(2)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                            <div 
                                className={`h-2.5 rounded-full ${percentage >= 75 ? 'bg-green-600' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-600'}`} 
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-gray-500 text-right">Present: <span className="font-medium text-gray-700">{stat.present}</span> / Total: <span className="font-medium text-gray-700">{stat.total}</span></p>
                    </div>
                    )
                })}
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceView
