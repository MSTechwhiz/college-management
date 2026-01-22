import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const Admissions = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [admissions, setAdmissions] = useState([])
  const [statistics, setStatistics] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    registerNumber: '',
    department: '',
    admissionMethod: 'Counselling',
    quota: '',
    scholarshipCategory: 'Others'
  })

  useEffect(() => {
    fetchAdmissions()
    fetchStatistics()
  }, [])

  const fetchAdmissions = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admissions')
      setAdmissions(response.data)
    } catch (error) {
      console.error('Error fetching admissions:', error)
    }
  }

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admissions/statistics')
      setStatistics(response.data)
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleAdd = async () => {
    try {
      await axios.post('http://localhost:8080/api/admissions', formData)
      setShowAddModal(false)
      fetchAdmissions()
      fetchStatistics()
    } catch (error) {
      alert(error.response?.data || 'Error adding admission')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Admissions</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add Admission
              </button>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Department Statistics</h2>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(statistics).map(([dept, count]) => (
              <div key={dept} className="border p-4 rounded">
                <p className="font-semibold">{dept}</p>
                <p className="text-2xl">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quota</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scholarship</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admissions.map((admission) => (
                <tr key={admission.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{admission.registerNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admission.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admission.admissionMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admission.quota}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{admission.scholarshipCategory}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add Admission</h2>
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
                placeholder="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <select
                value={formData.admissionMethod}
                onChange={(e) => setFormData({ ...formData, admissionMethod: e.target.value })}
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

export default Admissions
