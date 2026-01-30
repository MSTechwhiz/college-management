import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBuilding, faUserGraduate, faChalkboardTeacher, 
  faMoneyBillWave, faClipboardList, faBullhorn, faUserPlus, faBars
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const AdminDashboard = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [counts, setCounts] = useState({
    totalDepartments: 0,
    totalStudents: 0,
    totalFaculty: 0,
    totalPendingFees: 0,
    totalUnresolvedReports: 0
  })
  
  // User info for welcome message
  const { user } = useAuth()

  useEffect(() => {
    fetchCounts()
  }, [])

  const fetchCounts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/admin/dashboard/counts')
      setCounts(response.data)
    } catch (error) {
      console.error('Error fetching counts:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { title: 'Departments', count: counts.totalDepartments, path: '/admin/departments', color: 'bg-blue-600', icon: faBuilding },
    { title: 'Students', count: counts.totalStudents, path: '/admin/students', color: 'bg-green-600', icon: faUserGraduate },
    { title: 'Faculty', count: counts.totalFaculty, path: '/admin/faculty', color: 'bg-purple-600', icon: faChalkboardTeacher },
    { title: 'Admissions', count: 'Manage', path: '/admin/admissions', color: 'bg-teal-600', icon: faUserPlus },
    { title: 'Fees Management', count: counts.totalPendingFees, path: '/admin/fees', color: 'bg-yellow-500', icon: faMoneyBillWave },
    { title: 'Announcements', count: 'View', path: '/admin/announcements', color: 'bg-indigo-600', icon: faBullhorn },
    { title: 'Reports', count: counts.totalUnresolvedReports, path: '/admin/reports', color: 'bg-red-500', icon: faClipboardList }
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="text-slate-600 font-medium">Welcome, {user?.username || 'Admin'}</span>
                </div>
            </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Welcome Back, Administrator</h2>
                <p className="opacity-90 text-blue-100">Here's what's happening in your institute today.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r">
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
                  onClick={fetchCounts}
                  className="text-red-700 hover:text-red-900 font-medium text-sm underline"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cards.map((card) => (
                <div
                  key={card.title}
                  onClick={() => navigate(card.path)}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 group flex flex-col justify-between h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${card.color} text-white p-3 rounded-md shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                      <FontAwesomeIcon icon={card.icon} className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold text-slate-700 group-hover:text-slate-900">{card.count}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide group-hover:text-blue-600 transition-colors">{card.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
    </div>
  )
}

export default AdminDashboard
