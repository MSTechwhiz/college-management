import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const StudentsByYear = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { year } = useParams()
  const [students, setStudents] = useState([])

  useEffect(() => {
    fetchStudents()
  }, [year])

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/faculty/dashboard/students/${year}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/faculty/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Year {year} Students</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.registerNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/admin/students/${student.registerNumber}`)}
                      className="text-blue-600 hover:underline"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default StudentsByYear
