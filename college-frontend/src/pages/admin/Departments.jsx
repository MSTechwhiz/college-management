import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const Departments = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/departments')
      setDepartments(response.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Departments</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => navigate(`/admin/departments/${dept.id}`)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{dept.name}</h2>
              <div className="space-y-2">
                <p className="text-gray-600">Students: <span className="font-semibold">{dept.studentCount}</span></p>
                <p className="text-gray-600">Faculty: <span className="font-semibold">{dept.facultyCount}</span></p>
                {dept.hodName && (
                  <p className="text-gray-600">HOD: <span className="font-semibold">{dept.hodName}</span></p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Departments
