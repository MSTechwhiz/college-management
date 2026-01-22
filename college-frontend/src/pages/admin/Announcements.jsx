import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Announcements = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target: 'ALL',
    department: ''
  })

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await api.get('/announcements')
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const handleAdd = async () => {
    try {
      await api.post('/announcements', formData)
      setShowAddModal(false)
      fetchAnnouncements()
      setFormData({ title: '', content: '', target: 'ALL', department: '' })
    } catch (error) {
      alert(error.userMessage || 'Error creating announcement')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Announcements</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Create Announcement
              </button>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">{announcement.title}</h3>
              <p className="text-gray-600 mb-2">{announcement.content}</p>
              <p className="text-sm text-gray-400">
                Target: {announcement.target} {announcement.department && `- ${announcement.department}`}
              </p>
              <p className="text-sm text-gray-400">
                Published: {new Date(announcement.publishDate).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Announcement</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full p-2 border rounded"
                rows="4"
              />
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="ALL">All</option>
                <option value="STUDENTS">Students Only</option>
                <option value="FACULTY">Faculty Only</option>
                <option value="DEPARTMENT">Department Specific</option>
              </select>
              {formData.target === 'DEPARTMENT' && (
                <input
                  type="text"
                  placeholder="Department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              )}
              <div className="flex space-x-4">
                <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Create
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

export default Announcements
