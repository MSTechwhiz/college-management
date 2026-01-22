import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const AttendanceView = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    try {
      // Get student ID from user context
      const studentId = user?.username // This would need to be actual student ID
      const response = await axios.get(`http://localhost:8080/api/attendance/student/${studentId}`)
      setAttendance(response.data)
    } catch (error) {
      console.error('Error fetching attendance:', error)
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/student/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Attendance</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Subject-wise Attendance</h2>
          <div className="space-y-4">
            {Object.entries(stats).map(([subject, stat]) => {
              const percentage = stat.total > 0 ? (stat.present / stat.total) * 100 : 0
              return (
                <div key={subject} className="border-b pb-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold">{subject}</span>
                    <span className="text-blue-600 font-bold">{percentage.toFixed(2)}%</span>
                  </div>
                  <p className="text-sm text-gray-600">Present: {stat.present} / Total: {stat.total}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceView
