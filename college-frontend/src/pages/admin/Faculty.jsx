import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faPlus, faUserTie, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Faculty = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [faculty, setFaculty] = useState([])
  const [filteredFaculty, setFilteredFaculty] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    facultyId: '',
    name: '',
    department: '',
    subjects: [],
    years: []
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFaculty(faculty)
    } else {
      const lowerSearch = searchTerm.toLowerCase()
      setFilteredFaculty(faculty.filter(f =>
        f.name?.toLowerCase().includes(lowerSearch) ||
        f.facultyId?.toLowerCase().includes(lowerSearch) ||
        f.department?.toLowerCase().includes(lowerSearch)
      ))
    }
  }, [searchTerm, faculty])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [facultyRes, departmentsRes] = await Promise.all([
        api.get('/faculty'),
        api.get('/departments')
      ])
      setFaculty(facultyRes.data || [])
      setFilteredFaculty(facultyRes.data || [])
      setDepartments(departmentsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.userMessage || 'Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      facultyId: '',
      name: '',
      department: departments.length > 0 ? departments[0].name : '',
      subjects: [],
      years: []
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/faculty/${editingId}`, formData)
      } else {
        await api.post('/faculty', formData)
      }

      setShowAddModal(false)
      setEditingId(null)
      fetchData()
      resetForm()
    } catch (error) {
      alert(error.userMessage || (editingId ? 'Error updating faculty' : 'Error adding faculty'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (facultyMember) => {
    setFormData({
      facultyId: facultyMember.facultyId,
      name: facultyMember.name,
      department: facultyMember.department,
      subjects: facultyMember.subjects || [],
      years: facultyMember.years || []
    })
    setEditingId(facultyMember.id)
    setShowAddModal(true)
  }

  const handlePromoteHOD = async (id) => {
    try {
      await api.post(`/faculty/${id}/promote-hod`)
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error promoting to HOD')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty?')) return
    try {
      await api.delete(`/faculty/${id}`)
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error deleting faculty')
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
        <h1 className="text-xl font-bold text-slate-800">Faculty Management</h1>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm flex items-center">
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Add Faculty
        </button>
      </header>

      <div className="p-8 flex-1 overflow-y-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by name, ID, or department..."
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
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFaculty.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                        No faculty found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFaculty.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{f.facultyId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{f.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {f.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{f.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          {f.role !== 'HOD' && (
                            <button onClick={() => handlePromoteHOD(f.id)} className="text-green-600 hover:text-green-900 transition-colors" title="Promote to HOD">
                              <FontAwesomeIcon icon={faUserTie} />
                            </button>
                          )}
                          <button onClick={() => handleEdit(f)} className="text-blue-600 hover:text-blue-900 transition-colors" title="Edit">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button onClick={() => handleDelete(f.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete">
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
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">{editingId ? 'Edit Faculty' : 'Add Faculty'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faculty ID</label>
                <input
                  type="text"
                  placeholder="e.g. FAC001"
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subjects (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Java, Python, Data Structures"
                  value={formData.subjects.join(', ')}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value.split(',').map(s => s.trim()) })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Years</label>
                <div className="flex gap-4">
                  {['1', '2', '3', '4'].map((year) => (
                    <label key={year} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.years.includes(year)}
                        onChange={(e) => {
                          const newYears = e.target.checked
                            ? [...formData.years, year]
                            : formData.years.filter(y => y !== year)
                          setFormData({ ...formData, years: newYears })
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium">Year {year}</span>
                    </label>
                  ))}
                </div>
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
        </div >
      )}
    </div >
  )
}

export default Faculty
