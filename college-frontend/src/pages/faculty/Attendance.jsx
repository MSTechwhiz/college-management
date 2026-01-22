import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const Attendance = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})

  const fetchStudents = async () => {
    // This would fetch students for the faculty's department and year
    // For now, using a placeholder
    try {
      // You would need to implement this endpoint
      // const response = await axios.get(`/api/faculty/students?year=${year}`)
      // setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleMarkAttendance = async () => {
    if (!subject) {
      alert('Please select a subject')
      return
    }

    const attendanceList = students.map(s => ({
      studentId: s.id,
      registerNumber: s.registerNumber,
      present: attendance[s.id] || false
    }))

    try {
      await axios.post('http://localhost:8080/api/attendance/bulk', {
        subject,
        date,
        attendanceList
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('Attendance marked successfully')
    } catch (error) {
      alert(error.response?.data || 'Error marking attendance')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/faculty/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Mark Attendance</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={fetchStudents}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Load Students
          </button>
        </div>

        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{student.registerNumber} - {student.fullName}</span>
                  <input
                    type="checkbox"
                    checked={attendance[student.id] || false}
                    onChange={(e) => setAttendance({ ...attendance, [student.id]: e.target.checked })}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleMarkAttendance}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Save Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance
