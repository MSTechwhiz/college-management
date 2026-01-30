import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faCheckCircle, faUserTie, faFilter, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Reports = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [faculty, setFaculty] = useState([])
  const [filter, setFilter] = useState({ category: '', status: '' })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [selectedFacultyId, setSelectedFacultyId] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let result = reports

    // Apply filters
    if (filter.category) {
      result = result.filter(r => r.category === filter.category)
    }
    if (filter.status) {
      result = result.filter(r => r.status === filter.status)
    }

    // Apply search
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      result = result.filter(r => 
        r.description?.toLowerCase().includes(lowerSearch) ||
        r.registerNumber?.toLowerCase().includes(lowerSearch) ||
        r.category?.toLowerCase().includes(lowerSearch)
      )
    }

    setFilteredReports(result)
  }, [searchTerm, filter, reports])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [reportsRes, facultyRes] = await Promise.all([
        api.get('/reports'),
        api.get('/faculty')
      ])
      setReports(reportsRes.data || [])
      setFilteredReports(reportsRes.data || [])
      setFaculty(facultyRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load reports data.')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!selectedFacultyId) return alert('Please select a faculty member')
    
    setSubmitting(true)
    try {
      await api.post(`/reports/${selectedReport.id}/assign`, { hodId: selectedFacultyId })
      setShowAssignModal(false)
      setSelectedReport(null)
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error assigning report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolve = async (e) => {
    e.preventDefault()
    if (!remarks) return alert('Please enter resolution remarks')
    
    setSubmitting(true)
    try {
      await api.post(`/reports/${selectedReport.id}/resolve`, { remarks })
      setShowResolveModal(false)
      setSelectedReport(null)
      setRemarks('')
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error resolving report')
    } finally {
      setSubmitting(false)
    }
  }
  
  const openAssignModal = (report) => {
    setSelectedReport(report)
    setSelectedFacultyId('')
    setShowAssignModal(true)
  }

  const openResolveModal = (report) => {
    setSelectedReport(report)
    setRemarks('')
    setShowResolveModal(true)
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">Reports Management</h1>
      </header>

      <div className="p-8 flex-1 overflow-y-auto">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search description, reg no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">All Categories</option>
                <option value="Fees">Fees</option>
                <option value="Marks">Marks</option>
                <option value="Attendance">Attendance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="p-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <button 
                onClick={fetchData}
                className="text-red-700 hover:text-red-900 font-medium text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-10 text-center text-gray-500">
                No reports found matching your criteria.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{report.category}</h3>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${report.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{report.description}</p>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div className="text-sm text-gray-500 space-y-1">
                        <p><span className="font-medium">Register Number:</span> {report.registerNumber}</p>
                        {report.assignedTo && <p><span className="font-medium">Assigned to:</span> {report.assignedTo}</p>}
                        <p><span className="font-medium">Date:</span> {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="space-x-2">
                        {report.status === 'Open' && (
                            <>
                                <button 
                                    onClick={() => openAssignModal(report)}
                                    className="bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 text-sm transition-colors shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faUserTie} className="mr-1" /> Assign
                                </button>
                                <button 
                                    onClick={() => openResolveModal(report)}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm transition-colors shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Resolve
                                </button>
                            </>
                        )}
                    </div>
                  </div>

                  {report.resolutionRemarks && (
                    <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm text-gray-700"><strong>Resolution:</strong> {report.resolutionRemarks}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Assign Report</h2>
            <form onSubmit={handleAssign}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Faculty</label>
                <select 
                  value={selectedFacultyId}
                  onChange={(e) => setSelectedFacultyId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                >
                  <option value="">Select Faculty...</option>
                  {faculty.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors shadow-sm ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Assigning...' : 'Assign'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAssignModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Resolve Report</h2>
            <form onSubmit={handleResolve}>
              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resolution Remarks</label>
                  <textarea 
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-32"
                      placeholder="Enter resolution details..."
                      required
                  />
              </div>
              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors shadow-sm ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Resolving...' : 'Resolve'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowResolveModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
