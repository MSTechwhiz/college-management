import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faUserGraduate, faIdCard, faBuilding } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const StudentsByYear = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { year } = useParams()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [year])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/faculty/dashboard/students/${year}`)
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
      alert(error.userMessage || 'Error fetching students')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/faculty/dashboard')} 
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800 border-l-2 border-gray-300 pl-4">
                Year {year} Students
              </h1>
            </div>
            <button onClick={logout} className="text-red-600 hover:text-red-700 font-medium">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon icon={faUserGraduate} className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button 
                onClick={fetchStudents}
                className="text-red-700 hover:text-red-900 font-medium text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {students.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <FontAwesomeIcon icon={faUserGraduate} size="3x" className="mb-4 text-gray-300" />
                    <p>No students found for Year {year}</p>
                </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faIdCard} />
                            Register Number
                        </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faUserGraduate} />
                            Name
                        </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faBuilding} />
                            Department
                        </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{student.registerNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{student.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{student.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentsByYear
