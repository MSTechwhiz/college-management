import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const DepartmentDetail = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/departments/${id}`)
      setDetail(response.data)
    } catch (error) {
      console.error('Error fetching department detail:', error)
    }
  }

  if (!detail) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/departments')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">{detail.department.name}</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">HOD Details</h2>
          {detail.department.hodName ? (
            <div>
              <p><strong>Name:</strong> {detail.department.hodName}</p>
              <p><strong>Faculty ID:</strong> {detail.department.hodId}</p>
            </div>
          ) : (
            <p className="text-gray-500">No HOD assigned</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Faculty List</h2>
          <div className="space-y-2">
            {detail.faculty.map((f) => (
              <div key={f.id} className="border-b pb-2">
                <p><strong>{f.name}</strong> - {f.role} ({f.facultyId})</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Student List</h2>
          <div className="space-y-2">
            {detail.students.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/admin/students/${s.registerNumber}`)}
                className="border-b pb-2 cursor-pointer hover:text-blue-600"
              >
                <p><strong>{s.registerNumber}</strong> - {s.fullName} (Year {s.year})</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepartmentDetail
