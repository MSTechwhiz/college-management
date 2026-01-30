import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserShield, faChalkboardTeacher, faUserGraduate, faUniversity, faBullhorn, faUserTie } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../utils/api'

const LandingPage = () => {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await api.get('/announcements/public')
        setAnnouncements(response.data)
      } catch (error) {
        // Silent fail to keep landing page clean
      }
    }
    fetchAnnouncements()
  }, [])

  const goToLogin = (role) => {
    navigate(`/login?role=${role}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 py-4 shadow-sm sticky top-0 z-10">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-md">
                <FontAwesomeIcon icon={faUniversity} className="text-xl" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-slate-800 leading-none tracking-tight">SBCEC College Portal</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">Academic Management System</p>
             </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container-page py-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Welcome to SBCEC Portal</h2>
            <p className="text-slate-500 text-lg">Select your portal to sign in</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <button 
              onClick={() => goToLogin('ADMIN')}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center group h-full"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                 <FontAwesomeIcon icon={faUserShield} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">Administrator</h3>
              <p className="text-slate-500 leading-relaxed">System configuration, user management, and overall administration.</p>
            </button>

            <button 
              onClick={() => goToLogin('FACULTY')}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center group h-full"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                 <FontAwesomeIcon icon={faChalkboardTeacher} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-green-700 transition-colors">Faculty</h3>
              <p className="text-slate-500 leading-relaxed">Manage attendance, marks, and view student performance reports.</p>
            </button>

            <button 
              onClick={() => goToLogin('STUDENT')}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center group h-full"
            >
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                 <FontAwesomeIcon icon={faUserGraduate} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-700 transition-colors">Student</h3>
              <p className="text-slate-500 leading-relaxed">Access course materials, view grades, and check attendance records.</p>
            </button>

            <button 
              onClick={() => goToLogin('PRINCIPAL')}
              className="bg-white p-8 rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center group h-full"
            >
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                 <FontAwesomeIcon icon={faUserTie} className="text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-amber-700 transition-colors">Principal</h3>
              <p className="text-slate-500 leading-relaxed">Institutional oversight and analytics dashboard.</p>
            </button>
          </div>

          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <FontAwesomeIcon icon={faBullhorn} />
               </div>
               <h3 className="text-2xl font-bold text-slate-800">Latest Announcements</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {announcements.length === 0 ? (
                 <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                       <FontAwesomeIcon icon={faBullhorn} className="text-2xl" />
                    </div>
                    <p className="text-slate-500">No announcements available.</p>
                 </div>
               ) : announcements.map((a, idx) => (
                 <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-slate-800">{a.title}</h4>
                      <span className="text-xs text-slate-500">{new Date(a.publishDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600 mt-2">{a.content}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LandingPage
