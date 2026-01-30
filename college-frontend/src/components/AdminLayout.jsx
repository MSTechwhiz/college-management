import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import AdminSidebar from './AdminSidebar'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 h-full">
        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between shrink-0 z-20 relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-slate-600 hover:text-blue-600 p-1"
            >
              <FontAwesomeIcon icon={faBars} size="lg" />
            </button>
            <span className="font-bold text-slate-800">Admin Panel</span>
          </div>
          <div className="text-xs text-slate-400">SBCEC</div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
