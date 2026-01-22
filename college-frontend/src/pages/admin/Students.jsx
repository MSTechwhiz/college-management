import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const Students = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    registerNumber: '',
    fullName: '',
    department: '',
    year: 1,
    semester: 1,
    admissionType: 'Counselling',
    quota: '',
    scholarshipCategory: 'Others'
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/students')
      setStudents(response.data)
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:8080/api/students', formData)
      setShowAddModal(false)
      fetchStudents()
      setFormData({
        registerNumber: '',
        fullName: '',
        department: '',
        year: 1,
        semester: 1,
        admissionType: 'Counselling',
        quota: '',
        scholarshipCategory: 'Others'
      })
    } catch (error) {
      alert(error.response?.data || 'Error adding student')
    }
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      await axios.post('http://localhost:8080/api/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchStudents()
      alert('Bulk upload successful')
    } catch (error) {
      alert(error.response?.data || 'Error uploading file')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return
    try {
      await axios.delete(`http://localhost:8080/api/students/${id}`)
      fetchStudents()
    } catch (error) {
      alert(error.response?.data || 'Error deleting student')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Students</h1>
            </div>
            <div className="flex items-center space-x-4">
              <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} className="hidden" id="bulk-upload" />
              <label htmlFor="bulk-upload" className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700">
                Bulk Upload
              </label>
              <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Student
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/admin/students/${student.registerNumber}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {student.registerNumber}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(student.id)}
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
            <h2 className="text-2xl font-bold mb-4">Add Student</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Register Number"
                value={formData.registerNumber}
                onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              />
              <select
                value={formData.admissionType}
                onChange={(e) => setFormData({ ...formData, admissionType: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="Counselling">Counselling</option>
                <option value="Management">Management</option>
              </select>
              <input
                type="text"
                placeholder="Quota"
                value={formData.quota}
                onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <select
                value={formData.scholarshipCategory}
                onChange={(e) => setFormData({ ...formData, scholarshipCategory: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="FG">FG</option>
                <option value="BC">BC</option>
                <option value="MBC">MBC</option>
                <option value="Others">Others</option>
              </select>
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

export default Students
