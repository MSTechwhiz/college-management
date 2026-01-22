import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const Reports = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState({ category: '', status: '' })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/reports')
      setReports(response.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleAssign = async (reportId, hodId) => {
    try {
      await axios.post(`http://localhost:8080/api/reports/${reportId}/assign`, { hodId })
      fetchReports()
    } catch (error) {
      alert(error.response?.data || 'Error assigning report')
    }
  }

  const handleResolve = async (reportId, remarks) => {
    try {
      await axios.post(`http://localhost:8080/api/reports/${reportId}/resolve`, { remarks })
      fetchReports()
    } catch (error) {
      alert(error.response?.data || 'Error resolving report')
    }
  }

  const filteredReports = reports.filter(r => {
    if (filter.category && r.category !== filter.category) return false
    if (filter.status && r.status !== filter.status) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Reports</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex space-x-4">
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">All Categories</option>
              <option value="Fees">Fees</option>
              <option value="Marks">Marks</option>
              <option value="Attendance">Attendance</option>
              <option value="Other">Other</option>
            </select>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold">{report.category}</h3>
                <span className={`px-2 py-1 rounded ${report.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {report.status}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{report.description}</p>
              <p className="text-sm text-gray-400">Register Number: {report.registerNumber}</p>
              {report.assignedTo && <p className="text-sm text-gray-400">Assigned to: {report.assignedTo}</p>}
              {report.resolutionRemarks && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm"><strong>Resolution:</strong> {report.resolutionRemarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Reports
