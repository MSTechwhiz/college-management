import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const ReportsCreate = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    category: 'Fees',
    description: '',
    studentId: ''
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const studentId = user?.username // This would need to be actual student ID
      const response = await axios.get(`http://localhost:8080/api/reports/student/${studentId}`)
      setReports(response.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleCreate = async () => {
    try {
      await axios.post('http://localhost:8080/api/reports', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setShowCreateModal(false)
      fetchReports()
      setFormData({ category: 'Fees', description: '', studentId: '' })
    } catch (error) {
      alert(error.response?.data || 'Error creating report')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/student/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Reports</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create Report
              </button>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">{report.category}</h3>
                <span className={`px-2 py-1 rounded ${report.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {report.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{report.description}</p>
              {report.resolutionRemarks && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm"><strong>Resolution:</strong> {report.resolutionRemarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Report</h2>
            <div className="space-y-4">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="Fees">Fees</option>
                <option value="Marks">Marks</option>
                <option value="Attendance">Attendance</option>
                <option value="Other">Other</option>
              </select>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                rows="4"
              />
              <div className="flex space-x-4">
                <button onClick={handleCreate} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Submit
                </button>
                <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700">
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

export default ReportsCreate
