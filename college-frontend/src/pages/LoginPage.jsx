import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserShield, faChalkboardTeacher, faUserGraduate, faArrowLeft, faSpinner, faUniversity, faUserTie } from '@fortawesome/free-solid-svg-icons'
import api from '../utils/api'

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState(null)
  
  // Login credentials
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const role = params.get('role')
    if (!role) {
      navigate('/')
      return
    }
    setSelectedRole(role)
  }, [location.search])

  const requestPasswordReset = async () => {
    if (selectedRole !== 'ADMIN') return
    const usernameInput = window.prompt('Enter your admin username for password reset:')
    if (!usernameInput) return
    try {
      const resp = await api.post('/auth/request-password-reset', { username: usernameInput })
      const token = resp.data?.resetToken
      alert('If the user exists, a reset token was generated. Token (for demo): ' + (token || 'N/A'))
    } catch (e) {
      alert('Unable to initiate password reset')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    
    if (!username || !password) {
      setErrorMessage('Please enter both username and password')
      return
    }

    setLoading(true)
    try {
      // Format password for Student/Faculty if it matches date pattern YYYY-MM-DD to DD/MM/YYYY
      let loginPassword = password;
      if ((selectedRole === 'STUDENT' || selectedRole === 'FACULTY') && /^\d{4}-\d{2}-\d{2}$/.test(password)) {
          const [year, month, day] = password.split('-');
          loginPassword = `${day}/${month}/${year}`;
      }

      const result = await login(username, loginPassword, selectedRole)
      if (result.success) {
        if (result.needsDepartment) {
          navigate('/select-department')
        } else {
          navigate(getDashboardPath(selectedRole))
        }
      } else {
        setErrorMessage(result.error || 'Login failed')
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getDashboardPath = (role) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard'
      case 'FACULTY': return '/faculty/dashboard'
      case 'STUDENT': return '/student/dashboard'
      case 'PRINCIPAL': return '/principal/dashboard'
      default: return '/login'
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
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

      <main className={`flex-1 container-page py-12 flex flex-col items-center ${selectedRole ? 'justify-center' : ''}`}>
        <div className="w-full max-w-6xl">
           
           {/* Login Form */}
           <div className="w-full flex justify-center">
                <div className="animate-fade-in w-full max-w-md mx-auto">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-2 ${
                        selectedRole === 'ADMIN' ? 'bg-blue-600' :
                        selectedRole === 'FACULTY' ? 'bg-green-600' :
                        selectedRole === 'STUDENT' ? 'bg-purple-600' : 'bg-amber-600'
                     }`}></div>
                    
                    <button onClick={handleBack} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 text-sm font-medium transition-colors">
                       <FontAwesomeIcon icon={faArrowLeft} /> Back to Roles
                    </button>
                    
                    <div className="text-center mb-8">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg ${
                          selectedRole === 'ADMIN' ? 'bg-blue-600' :
                          selectedRole === 'FACULTY' ? 'bg-green-600' :
                          selectedRole === 'STUDENT' ? 'bg-purple-600' : 'bg-amber-600'
                       }`}>
                          <FontAwesomeIcon icon={
                             selectedRole === 'ADMIN' ? faUserShield :
                             selectedRole === 'FACULTY' ? faChalkboardTeacher :
                             selectedRole === 'STUDENT' ? faUserGraduate : faUserTie
                          } className="text-2xl" />
                       </div>
                       <h2 className="text-2xl font-bold text-slate-800">
                          {selectedRole === 'ADMIN' && 'Admin Login'}
                          {selectedRole === 'FACULTY' && 'Faculty Login'}
                          {selectedRole === 'STUDENT' && 'Student Login'}
                          {selectedRole === 'PRINCIPAL' && 'Principal Login'}
                       </h2>
                       <p className="text-slate-500 mt-1 text-sm">Please sign in to continue</p>
                    </div>

                    {errorMessage && (
                      <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r text-sm">
                        <p className="font-bold">Error</p>
                        <p>{errorMessage}</p>
                      </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                       <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            {selectedRole === 'STUDENT' ? 'Register Number' : 
                             selectedRole === 'FACULTY' ? 'Faculty ID' : 'Username'}
                          </label>
                          <input
                             type="text"
                             value={username}
                             onChange={(e) => setUsername(e.target.value)}
                             className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all outline-none"
                             style={{
                                 '--tw-ring-color': selectedRole === 'ADMIN' ? '#2563eb' : selectedRole === 'FACULTY' ? '#16a34a' : selectedRole === 'STUDENT' ? '#9333ea' : '#b45309'
                             }}
                             placeholder={
                                selectedRole === 'STUDENT' ? 'Enter Register Number' : 
                                selectedRole === 'FACULTY' ? 'Enter Faculty ID' : 'Enter your username'
                             }
                             autoFocus
                             disabled={loading}
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                             {selectedRole === 'ADMIN' || selectedRole === 'PRINCIPAL' ? 'Password' : 'Date of Birth'}
                          </label>
                          <input
                             type={(selectedRole === 'ADMIN' || selectedRole === 'PRINCIPAL') ? 'password' : 'date'}
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all outline-none"
                             style={{
                                 '--tw-ring-color': selectedRole === 'ADMIN' ? '#2563eb' : selectedRole === 'FACULTY' ? '#16a34a' : selectedRole === 'STUDENT' ? '#9333ea' : '#b45309'
                             }}
                             placeholder={(selectedRole === 'ADMIN' || selectedRole === 'PRINCIPAL') ? 'Enter your password' : ''}
                             disabled={loading}
                          />
                          <div className="flex justify-end mt-2">
                             <button onClick={requestPasswordReset} type="button" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium bg-transparent border-none p-0 cursor-pointer">
                                Forgot Password?
                             </button>
                          </div>
                       </div>
                       <button 
                          type="submit" 
                          className={`w-full py-3 rounded-lg text-white font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${
                             loading ? 'bg-gray-400 cursor-not-allowed' : 
                             selectedRole === 'ADMIN' ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30' :
                             selectedRole === 'FACULTY' ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/30' :
                             selectedRole === 'STUDENT' ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/30' :
                             'bg-amber-600 hover:bg-amber-700 hover:shadow-amber-500/30'
                          }`}
                          disabled={loading}
                       >
                          {loading ? (
                             <>
                                <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                                Signing In...
                             </>
                          ) : 'Sign In'}
                       </button>
                    </form>
                  </div>
                </div>
            </div>

        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
         <div className="container-page text-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SBCEC College Management System. All rights reserved.</p>
         </div>
      </footer>
    </div>
  )
}

export default LoginPage
