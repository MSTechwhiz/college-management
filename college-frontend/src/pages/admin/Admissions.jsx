import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faPlus, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Admissions = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [admissions, setAdmissions] = useState([])
  const [filteredAdmissions, setFilteredAdmissions] = useState([])
  const [statistics, setStatistics] = useState({})
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    studentName: '',
    department: '',
    admissionMethod: 'COUNSELLING',
    cutoff: '',
    scholarship: 'FG',
    email: '',
    phone: '',
    status: 'Pending',
    tenthMarks: '',
    twelfthMarks: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAdmissions(admissions)
    } else {
      const lowerSearch = searchTerm.toLowerCase()
      setFilteredAdmissions(admissions.filter(a => 
        a.studentName?.toLowerCase().includes(lowerSearch) ||
        a.department?.toLowerCase().includes(lowerSearch) ||
        a.admissionMethod?.toLowerCase().includes(lowerSearch)
      ))
    }
  }, [searchTerm, admissions])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [admissionsRes, statisticsRes, departmentsRes] = await Promise.all([
        api.get('/admissions'),
        api.get('/admissions/statistics'),
        api.get('/departments')
      ])
      setAdmissions(admissionsRes.data || [])
      setFilteredAdmissions(admissionsRes.data || [])
      setStatistics(statisticsRes.data || {})
      setDepartments(departmentsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load admissions data.')
    } finally {
      setLoading(false)
    }
  }

  const getDepartmentName = (id) => {
    const dept = departments.find(d => d.id === id || d.name === id) // Handle if backend returns name or ID
    return dept ? dept.name : id
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        studentName: formData.studentName,
        departmentId: formData.departmentId || null,
        admissionMethod: formData.admissionMethod,
        cutoff: formData.cutoff ? Number(formData.cutoff) : null,
        scholarship: formData.scholarship,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        tenthMarks: formData.tenthMarks,
        twelfthMarks: formData.twelfthMarks
      }

      if (editingId) {
        await api.put(`/admissions/${editingId}`, payload)
      } else {
        await api.post('/admissions', payload)
      }

      setShowAddModal(false)
      setEditingId(null)
      resetForm()
      fetchData()
    } catch (error) {
      alert(error.userMessage || (editingId ? 'Error updating admission' : 'Error adding admission'))
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentName: '',
      departmentId: '',
      admissionMethod: 'COUNSELLING',
      cutoff: '',
      scholarship: 'FG'
    })
  }

  const handleEdit = (admission) => {
    setFormData({
      studentName: admission.studentName,
      departmentId: admission.departmentId,
      admissionMethod: admission.admissionMethod,
      cutoff: admission.cutoff,
      scholarship: admission.scholarship
    })
    setEditingId(admission.id)
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admission?')) return
    try {
      await api.delete(`/admissions/${id}`)
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error deleting admission')
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    resetForm()
    setShowAddModal(true)
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-800">Admissions Management</h1>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm flex items-center">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Admission
        </button>
      </header>

      <div className="p-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchData} className="text-red-700 underline mt-2">Retry</button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 text-gray-700">Admission Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Object.entries(statistics).map(([dept, count]) => (
                  <div key={dept} className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-center">
                    <p className="font-semibold text-blue-800 text-sm truncate" title={dept}>{dept}</p>
                    <p className="text-2xl font-bold text-blue-600">{count}</p>
                  </div>
                ))}
                {Object.keys(statistics).length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-4">No statistics available</div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Search by name, department, or method..."
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
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cutoff</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scholarship</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAdmissions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                          No admissions found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredAdmissions.map((admission) => (
                        <tr key={admission.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{admission.studentName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {getDepartmentName(admission.departmentId)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admission.admissionMethod}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admission.cutoff || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{admission.scholarship}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            <button onClick={() => handleEdit(admission)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Edit">
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button onClick={() => handleDelete(admission.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete">
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{editingId ? 'Edit Admission' : 'Add Admission'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name / Register No</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe / REG123"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Method</label>
                <select
                  value={formData.admissionMethod}
                  onChange={(e) => setFormData({ ...formData, admissionMethod: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="COUNSELLING">Counselling</option>
                  <option value="MANAGEMENT">Management</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">10th Marks</label>
                    <input
                      type="text"
                      placeholder="e.g. 450/500"
                      value={formData.tenthMarks}
                      onChange={(e) => setFormData({ ...formData, tenthMarks: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">12th Marks</label>
                    <input
                      type="text"
                      placeholder="e.g. 550/600"
                      value={formData.twelfthMarks}
                      onChange={(e) => setFormData({ ...formData, twelfthMarks: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cutoff Marks</label>
                  <input
                    type="number"
                    placeholder="e.g. 185.5"
                    value={formData.cutoff}
                    onChange={(e) => setFormData({ ...formData, cutoff: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship</label>
                <select
                  value={formData.scholarship}
                  onChange={(e) => setFormData({ ...formData, scholarship: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="FG">First Graduate (FG)</option>
                  <option value="BC">BC Scholarship</option>
                  <option value="MBC">MBC Scholarship</option>
                  <option value="SC">SC Scholarship</option>
                  <option value="ST">ST Scholarship</option>
                  <option value="NONE">None</option>
                </select>
              </div>
              <div className="flex space-x-4 pt-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className={`flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors shadow-sm ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update' : 'Add')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
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

export default Admissions
