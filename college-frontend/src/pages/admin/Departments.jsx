import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBuilding, faUserGraduate, faChalkboardTeacher, faUserTie, faPlus } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Departments = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDeptName, setNewDeptName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/departments')
      setDepartments(response.data)
    } catch (error) {
      console.error('Error fetching departments:', error)
      setError('Failed to load departments.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDepartment = async (e) => {
    e.preventDefault()
    if (!newDeptName.trim()) return
    
    setSubmitting(true)
    try {
      await api.post('/departments', { name: newDeptName })
      setNewDeptName('')
      setShowAddModal(false)
      fetchDepartments()
    } catch (error) {
      alert(error.userMessage || 'Error adding department')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/admin/dashboard')} 
                className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-800">Departments</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm flex items-center"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Department
              </button>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors shadow-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
            <button onClick={fetchDepartments} className="text-red-700 underline mt-2">Retry</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                onClick={() => navigate(`/admin/departments/${dept.id}`)}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-xl" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">{dept.name}</h2>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <FontAwesomeIcon icon={faUserGraduate} className="w-5 mr-2 text-gray-400" />
                    <span>Students: <span className="font-semibold text-gray-800">{dept.studentCount || 0}</span></span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FontAwesomeIcon icon={faChalkboardTeacher} className="w-5 mr-2 text-gray-400" />
                    <span>Faculty: <span className="font-semibold text-gray-800">{dept.facultyCount || 0}</span></span>
                  </div>
                  {dept.hodName && (
                    <div className="flex items-center text-gray-600">
                      <FontAwesomeIcon icon={faUserTie} className="w-5 mr-2 text-gray-400" />
                      <span>HOD: <span className="font-semibold text-gray-800">{dept.hodName}</span></span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Department</h2>
            <form onSubmit={handleAddDepartment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {submitting ? 'Adding...' : 'Add'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
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

export default Departments
