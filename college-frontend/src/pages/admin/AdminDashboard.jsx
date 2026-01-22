import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const AdminDashboard = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [counts, setCounts] = useState({
    totalDepartments: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalPendingFees: 0,
    totalUnresolvedReports: 0
  })

  useEffect(() => {
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/dashboard/counts')
      setCounts(response.data)
    } catch (error) {
      console.error('Error fetching counts:', error)
    }
  }

  const cards = [
    { title: 'Departments', count: counts.totalDepartments, path: '/admin/departments', color: 'blue' },
    { title: 'Students', count: counts.totalStudents, path: '/admin/students', color: 'green' },
    { title: 'Faculty', count: counts.totalFaculty, path: '/admin/faculty', color: 'purple' },
    { title: 'Pending Fees', count: counts.totalPendingFees, path: '/admin/fees', color: 'yellow' },
    { title: 'Unresolved Reports', count: counts.totalUnresolvedReports, path: '/admin/reports', color: 'red' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/announcements')}
                className="text-gray-600 hover:text-gray-800"
              >
                Announcements
              </button>
              <button
                onClick={() => navigate('/admin/admissions')}
                className="text-gray-600 hover:text-gray-800"
              >
                Admissions
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => navigate(card.path)}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{card.title}</h3>
              <p className={`text-4xl font-bold text-${card.color}-600`}>{card.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
