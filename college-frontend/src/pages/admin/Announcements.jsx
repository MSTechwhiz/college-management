import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faPlus, faEdit, faTrash, faBullhorn, faTimes } from '@fortawesome/free-solid-svg-icons'

const Announcements = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [departments, setDepartments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'ALL',
    department: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [announcementsRes, departmentsRes] = await Promise.all([
        api.get('/announcements'),
        api.get('/departments')
      ])
      setAnnouncements(announcementsRes.data)
      setDepartments(departmentsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, formData)
      } else {
        await api.post('/announcements', formData)
      }
      handleCloseModal()
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error saving announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target: announcement.target,
      department: announcement.department || ''
    })
    setEditingId(announcement.id)
    setShowAddModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return
    try {
      await api.delete(`/announcements/${id}`)
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error deleting announcement')
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingId(null)
    setFormData({ title: '', content: '', target: 'ALL', department: '' })
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FontAwesomeIcon icon={faBullhorn} className="text-blue-600" />
          Manage Announcements
        </h1>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors shadow-sm flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Create Announcement
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
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white rounded-lg border border-gray-200">
                <FontAwesomeIcon icon={faBullhorn} className="text-4xl mb-4 opacity-20" />
                <p>No announcements found. Create one to get started.</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{announcement.title}</h3>
                      <p className="text-slate-600 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100">
                          Target: {announcement.target}
                        </span>
                        {announcement.department && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded border border-gray-200">
                            Dept: {announcement.department}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded border border-gray-100">
                          {new Date(announcement.publishDate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Announcement' : 'Create Announcement'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Announcement Title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="4"
                  placeholder="Write your announcement here..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="ALL">All Users</option>
                    <option value="STUDENTS">Students Only</option>
                    <option value="FACULTY">Faculty Only</option>
                    <option value="DEPARTMENT">Department Specific</option>
                  </select>
                </div>
                
                {formData.target === 'DEPARTMENT' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Dept</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-4 flex space-x-3">
                <button 
                  type="button"
                  onClick={handleCloseModal} 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Announcements
