import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faPlus, faSearch, faFileUpload, faDownload, faSpinner, faArrowLeft, faUserGraduate } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Students = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
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
    fetchData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      setFilteredStudents(students.filter(student => 
        student.fullName.toLowerCase().includes(lowerTerm) ||
        student.registerNumber.toLowerCase().includes(lowerTerm) ||
        student.department.toLowerCase().includes(lowerTerm)
      ))
    } else {
      setFilteredStudents(students)
    }
  }, [searchTerm, students])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [studentsRes, departmentsRes] = await Promise.all([
        api.get('/students'),
        api.get('/departments')
      ])
      setStudents(studentsRes.data || [])
      setFilteredStudents(studentsRes.data || [])
      setDepartments(departmentsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.userMessage || 'Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, formData)
      } else {
        await api.post('/students', formData)
      }
      
      setShowAddModal(false)
      setEditingId(null)
      fetchData() // Refresh list
      resetForm()
    } catch (error) {
      console.error('Error saving student:', error)
      alert(error.userMessage || (editingId ? 'Error updating student' : 'Error adding student'))
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      registerNumber: '',
      fullName: '',
      department: departments.length > 0 ? departments[0].name : '',
      year: 1,
      semester: 1,
      admissionType: 'Counselling',
      quota: '',
      scholarshipCategory: 'Others'
    })
  }

  const handleEdit = (student) => {
    setFormData({
      registerNumber: student.registerNumber,
      fullName: student.fullName,
      department: student.department,
      year: student.year,
      semester: student.semester,
      admissionType: student.admissionType,
      quota: student.quota,
      scholarshipCategory: student.scholarshipCategory
    })
    setEditingId(student.id)
    setShowAddModal(true)
  }

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      await api.post('/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      fetchData()
      alert('Bulk upload successful')
    } catch (error) {
      console.error('Error uploading file:', error)
      alert(error.userMessage || 'Error uploading file')
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) return
    
    try {
      await api.delete(`/students/${id}`)
      setStudents(students.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting student:', error)
      alert(error.userMessage || 'Error deleting student')
    }
  }

  const openAddModal = () => {
    setEditingId(null)
    resetForm()
    setShowAddModal(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Navbar */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-xl" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Student Management</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={openAddModal} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center"
          >
             <FontAwesomeIcon icon={faPlus} className="mr-2" />
             Add Student
          </button>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-y-auto">
        
        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 border focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2.5 transition-shadow duration-200"
            />
          </div>
          
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <input type="file" accept=".xlsx,.xls" onChange={handleBulkUpload} className="hidden" id="bulk-upload" />
            <label 
              htmlFor="bulk-upload" 
              className="flex-1 md:flex-none flex items-center justify-center bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-200 cursor-pointer shadow-sm text-sm font-medium"
            >
              <FontAwesomeIcon icon={faFileUpload} className="mr-2" />
              Bulk Upload
            </label>
            <button 
              onClick={openAddModal} 
              className="flex-1 md:flex-none flex items-center justify-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm text-sm font-medium"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Student
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FontAwesomeIcon icon={faTrash} className="text-red-400" /> 
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Register No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/admin/students/${student.registerNumber}`)}
                            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                          >
                            {student.registerNumber}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{student.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                            {student.department}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{student.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEdit(student)} 
                            className="text-blue-600 hover:text-blue-900 mr-4 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            onClick={() => handleDelete(student.id)} 
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        No students found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500 flex justify-between items-center">
              <span>Showing {filteredStudents.length} students</span>
              {/* Pagination could go here */}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm" 
              aria-hidden="true" 
              onClick={() => !submitting && setShowAddModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FontAwesomeIcon icon={editingId ? faEdit : faPlus} className="text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                        {editingId ? 'Edit Student' : 'Add New Student'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Register Number</label>
                            <input
                              type="text"
                              required
                              value={formData.registerNumber}
                              onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                              type="text"
                              required
                              value={formData.fullName}
                              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                          <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                              <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                            {/* Fallback options if no departments loaded */}
                            {departments.length === 0 && (
                              <>
                                <option value="CSE">CSE</option>
                                <option value="ECE">ECE</option>
                                <option value="MECH">MECH</option>
                                <option value="CIVIL">CIVIL</option>
                                <option value="IT">IT</option>
                                <option value="AI&DS">AI&DS</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                            <select
                              value={formData.year}
                              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                              {[1, 2, 3, 4].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                            <select
                              value={formData.semester}
                              onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Admission Type</label>
                            <select
                              value={formData.admissionType}
                              onChange={(e) => setFormData({ ...formData, admissionType: e.target.value })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                              <option value="Counselling">Counselling</option>
                              <option value="Management">Management</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Quota</label>
                            <input
                              type="text"
                              value={formData.quota}
                              onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Scholarship</label>
                          <select
                            value={formData.scholarshipCategory}
                            onChange={(e) => setFormData({ ...formData, scholarshipCategory: e.target.value })}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                          >
                            <option value="FG">FG</option>
                            <option value="BC">BC</option>
                            <option value="MBC">MBC</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                        Saving...
                      </>
                    ) : (editingId ? 'Update Student' : 'Add Student')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Students
