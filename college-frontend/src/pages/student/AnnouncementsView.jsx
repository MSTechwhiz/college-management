import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faBullhorn, faCalendarAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const AnnouncementsView = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await api.get('/announcements/student')
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
      alert(error.userMessage || 'Error fetching announcements')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/student/dashboard')} 
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800 border-l-2 border-gray-300 pl-4">
                Announcements
              </h1>
            </div>
            <button 
                onClick={logout} 
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faSignOutAlt} />
                Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
                    <FontAwesomeIcon icon={faBullhorn} size="3x" className="mb-4 text-gray-300" />
                    <p>No announcements found</p>
                </div>
            ) : (
                announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{announcement.title}</h3>
                    <p className="text-gray-600 mb-4 whitespace-pre-wrap">{announcement.content}</p>
                    <div className="flex items-center text-sm text-gray-400">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                        {new Date(announcement.publishDate).toLocaleString()}
                    </div>
                    </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnnouncementsView
