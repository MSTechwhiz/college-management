import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheck, faTimes, faList, faCalendarAlt, faBook } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Attendance = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [year, setYear] = useState(1)
  const [subject, setSubject] = useState('')
  const [assignedSubjects, setAssignedSubjects] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [dashboardLoading, setDashboardLoading] = useState(true)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/faculty/dashboard')
      if (response.data && response.data.subjects) {
        setAssignedSubjects(response.data.subjects)
        if (response.data.subjects.length > 0) {
          setSubject(response.data.subjects[0])
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  const fetchStudents = async () => {
    if (!subject) {
      alert('Please select a subject')
      return
    }
    setLoading(true)
    try {
      // Fetch students for the selected year
      const response = await api.get(`/faculty/dashboard/students/${year}`)
      setStudents(response.data)
      
      // Initialize attendance state (default to true/present for convenience)
      const initialAttendance = {}
      response.data.forEach(s => {
        initialAttendance[s.id] = true
      })
      setAttendance(initialAttendance)
    } catch (error) {
      console.error('Error fetching students:', error)
      alert(error.userMessage || 'Error fetching students')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAttendance = async () => {
    if (!subject) {
      alert('Please enter a subject')
      return
    }
    if (students.length === 0) {
      alert('No students to mark')
      return
    }

    const attendanceList = students.map(s => ({
      studentId: s.id,
      registerNumber: s.registerNumber,
      present: attendance[s.id] || false
    }))

    try {
      await api.post('/attendance/bulk', {
        subject,
        date,
        attendanceList
      })
      alert('Attendance marked successfully')
      // Optional: Clear students or navigate back
      navigate('/faculty/dashboard')
    } catch (error) {
      alert(error.userMessage || 'Error marking attendance')
    }
  }

  const toggleAttendance = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }))
  }

  const toggleAll = (present) => {
    const newAttendance = {}
    students.forEach(s => {
      newAttendance[s.id] = present
    })
    setAttendance(newAttendance)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/faculty/dashboard')} 
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-800">Mark Attendance</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faList} className="mr-2 text-gray-400" />
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faBook} className="mr-2 text-gray-400" />
                Subject
              </label>
              {dashboardLoading ? (
                <div className="w-full p-2 border rounded bg-gray-100 text-gray-500">Loading subjects...</div>
              ) : assignedSubjects.length > 0 ? (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Subject</option>
                  {assignedSubjects.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subject code/name"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-400" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={fetchStudents}
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Load Students'}
          </button>
        </div>

        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Student List ({students.length})</h2>
              <div className="space-x-2">
                <button 
                  onClick={() => toggleAll(true)}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                >
                  Mark All Present
                </button>
                <button 
                  onClick={() => toggleAll(false)}
                  className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr 
                      key={student.id} 
                      onClick={() => toggleAttendance(student.id)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.registerNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleAttendance(student.id)
                          }}
                          className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                            attendance[student.id] 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {attendance[student.id] ? (
                            <><FontAwesomeIcon icon={faCheck} className="mr-1" /> Present</>
                          ) : (
                            <><FontAwesomeIcon icon={faTimes} className="mr-1" /> Absent</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleMarkAttendance}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 shadow-md transform transition hover:-translate-y-0.5"
              >
                Save Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance
