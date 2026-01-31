import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChartLine, faBuilding, faUserGraduate, faChalkboardTeacher,
  faUserPlus, faMoneyBillWave, faBullhorn, faClipboardList, faSignOutAlt, faTimes,
  faCalendarAlt, faCloudUploadAlt
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext'

const AdminSidebar = ({ isOpen = false, onClose = () => { } }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: faChartLine },
    { title: 'Academic Management', path: '/admin/academic', icon: faCalendarAlt },
    { title: 'Bulk Upload', path: '/admin/bulk-upload', icon: faCloudUploadAlt },
    { title: 'Departments', path: '/admin/departments', icon: faBuilding },
    { title: 'Students', path: '/admin/students', icon: faUserGraduate },
    { title: 'Faculty', path: '/admin/faculty', icon: faChalkboardTeacher },
    { title: 'Admissions', path: '/admin/admissions', icon: faUserPlus },
    { title: 'Fees Management', path: '/admin/fees', icon: faMoneyBillWave },
    { title: 'Announcements', path: '/admin/announcements', icon: faBullhorn },
    { title: 'Reports', path: '/admin/reports', icon: faClipboardList },
  ]

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        w-64 bg-slate-900 text-white min-h-screen fixed left-0 top-0 flex flex-col shadow-xl z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-wider flex items-center gap-2">
            <span className="bg-blue-600 w-8 h-8 rounded flex items-center justify-center text-sm">SB</span>
            <span>ADMIN</span>
          </h2>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-6 py-3 transition-colors duration-200 ${isActive(item.path)
                      ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  <div className="w-6 text-center">
                    <FontAwesomeIcon icon={item.icon} className={isActive(item.path) ? 'text-white' : 'text-slate-500'} />
                  </div>
                  <span className="font-medium">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <div className="w-6 text-center">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminSidebar
