import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const AnnouncementsView = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/announcements/student', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/student/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Announcements</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
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
                {new Date(announcement.publishDate).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AnnouncementsView
