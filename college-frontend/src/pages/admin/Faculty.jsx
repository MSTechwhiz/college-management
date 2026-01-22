import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const Faculty = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [faculty, setFaculty] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    department: '',
    subjects: [],
    years: []
  })

  useEffect(() => {
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/faculty')
      setFaculty(response.data)
    } catch (error) {
      console.error('Error fetching faculty:', error)
    }
  }

  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:8080/api/faculty', formData)
      setShowAddModal(false)
      fetchFaculty()
      setFormData({ facultyId: '', name: '', department: '', subjects: [], years: [] })
    } catch (error) {
      alert(error.response?.data || 'Error adding faculty')
    }
  }

  const handlePromoteHOD = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/faculty/${id}/promote-hod`)
      fetchFaculty()
    } catch (error) {
      alert(error.response?.data || 'Error promoting to HOD')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this faculty?')) return
    try {
      await axios.delete(`http://localhost:8080/api/faculty/${id}`)
      fetchFaculty()
    } catch (error) {
      alert(error.response?.data || 'Error deleting faculty')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Faculty</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Faculty
              </button>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faculty.map((f) => (
                <tr key={f.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{f.facultyId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{f.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{f.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{f.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    {f.role !== 'HOD' && (
                      <button
                        onClick={() => handlePromoteHOD(f.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Promote HOD
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(f.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Faculty</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Faculty ID"
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <div className="flex space-x-4">
                <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Add
                </button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Faculty
