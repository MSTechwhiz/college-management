import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserShield, faChalkboardTeacher, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import api from '../utils/api'

const LoginPage = () => {
  // Separate state for each login card
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  
  const [facultyUsername, setFacultyUsername] = useState('')
  const [facultyPassword, setFacultyPassword] = useState('')
  
  const [studentUsername, setStudentUsername] = useState('')
  const [studentPassword, setStudentPassword] = useState('')
  
  const [announcements, setAnnouncements] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements/public')
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      // Don't show error for announcements, just log it
    }
  }

  const handleLogin = async (role, username, password) => {
    setErrorMessage('')
    
    if (!username || !password) {
      setErrorMessage('Please enter both username and password')
      return
    }

    const result = await login(username, password, role)
    if (result.success) {
      if (result.needsDepartment) {
        navigate('/select-department')
      } else {
        navigate(getDashboardPath(role))
      }
    } else {
      setErrorMessage(result.error || 'Login failed')
    }
  }

  const getDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard'
      case 'FACULTY': return '/faculty/dashboard'
      case 'STUDENT': return '/student/dashboard'
      default: return '/login'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">College Management System</h1>
          
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
              {errorMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Admin Login Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <FontAwesomeIcon icon={faUserShield} className="text-5xl text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Admin Login</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                />
                <button
                  onClick={() => handleLogin('ADMIN', adminUsername, adminPassword)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Login as Admin
                </button>
              </div>
            </div>

            {/* Faculty Login Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="text-5xl text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Faculty Login</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={facultyUsername}
                  onChange={(e) => setFacultyUsername(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={facultyPassword}
                  onChange={(e) => setFacultyPassword(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                />
                <button
                  onClick={() => handleLogin('FACULTY', facultyUsername, facultyPassword)}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Login as Faculty
                </button>
              </div>
            </div>

            {/* Student Login Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-5xl text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Student Login</h2>
                <input
                  type="text"
                  placeholder="Username"
                  value={studentUsername}
                  onChange={(e) => setStudentUsername(e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full p-2 border rounded mb-4"
                />
                <button
                  onClick={() => handleLogin('STUDENT', studentUsername, studentPassword)}
                  className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                >
                  Login as Student
                </button>
              </div>
            </div>
          </div>

          {/* Announcements Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Announcements</h2>
            <div className="max-h-64 overflow-y-auto space-y-4">
              {announcements.length === 0 ? (
                <p className="text-gray-500">No announcements available</p>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-800">{announcement.title}</h3>
                    <p className="text-gray-600 text-sm">{announcement.content}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(announcement.publishDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
