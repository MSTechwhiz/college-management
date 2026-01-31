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
            <div className="animate-fade-in w-full max-w-lg mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100 relative overflow-hidden" style={{
                boxShadow: selectedRole === 'ADMIN' ? '0 25px 50px -12px rgba(37, 99, 235, 0.25), 0 0 0 1px rgba(37, 99, 235, 0.05)' :
                  selectedRole === 'FACULTY' ? '0 25px 50px -12px rgba(22, 163, 74, 0.25), 0 0 0 1px rgba(22, 163, 74, 0.05)' :
                    selectedRole === 'STUDENT' ? '0 25px 50px -12px rgba(147, 51, 234, 0.25), 0 0 0 1px rgba(147, 51, 234, 0.05)' :
                      '0 25px 50px -12px rgba(180, 83, 9, 0.25), 0 0 0 1px rgba(180, 83, 9, 0.05)'
              }}>
                <div className={`absolute top-0 left-0 w-full h-2 ${selectedRole === 'ADMIN' ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
                  selectedRole === 'FACULTY' ? 'bg-gradient-to-r from-green-600 to-green-500' :
                    selectedRole === 'STUDENT' ? 'bg-gradient-to-r from-purple-600 to-purple-500' :
                      'bg-gradient-to-r from-amber-600 to-amber-500'
                  }`}></div>

                <button onClick={handleBack} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 text-sm font-medium transition-colors">
                  <FontAwesomeIcon icon={faArrowLeft} /> Back to Roles
                </button>

                <div className="text-center mb-8">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg ring-4 ring-opacity-20 ${selectedRole === 'ADMIN' ? 'bg-gradient-to-br from-blue-600 to-blue-700 ring-blue-200' :
                    selectedRole === 'FACULTY' ? 'bg-gradient-to-br from-green-600 to-green-700 ring-green-200' :
                      selectedRole === 'STUDENT' ? 'bg-gradient-to-br from-purple-600 to-purple-700 ring-purple-200' :
                        'bg-gradient-to-br from-amber-600 to-amber-700 ring-amber-200'
                    }`} style={{
                      boxShadow: selectedRole === 'ADMIN' ? '0 10px 25px -5px rgba(37, 99, 235, 0.4)' :
                        selectedRole === 'FACULTY' ? '0 10px 25px -5px rgba(22, 163, 74, 0.4)' :
                          selectedRole === 'STUDENT' ? '0 10px 25px -5px rgba(147, 51, 234, 0.4)' :
                            '0 10px 25px -5px rgba(180, 83, 9, 0.4)'
                    }}>
                    <FontAwesomeIcon icon={
                      selectedRole === 'ADMIN' ? faUserShield :
                        selectedRole === 'FACULTY' ? faChalkboardTeacher :
                          selectedRole === 'STUDENT' ? faUserGraduate : faUserTie
                    } className="text-3xl" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                    {selectedRole === 'ADMIN' && 'Admin Login'}
                    {selectedRole === 'FACULTY' && 'Faculty Login'}
                    {selectedRole === 'STUDENT' && 'Student Login'}
                    {selectedRole === 'PRINCIPAL' && 'Principal Login'}
                  </h2>
                  <p className="text-slate-500 mt-2 text-sm font-medium">Secure access to your dashboard</p>
                </div>

                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold mb-1">Authentication Failed</p>
                        <p className="text-red-600">{errorMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2.5">
                      {selectedRole === 'STUDENT' ? 'Register Number' :
                        selectedRole === 'FACULTY' ? 'Faculty ID' : 'Username'}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all outline-none text-slate-800 font-medium"
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
                    <label className="block text-sm font-bold text-slate-700 mb-2.5">
                      {selectedRole === 'ADMIN' || selectedRole === 'PRINCIPAL' ? 'Password' : 'Date of Birth'}
                    </label>
                    <input
                      type={(selectedRole === 'ADMIN' || selectedRole === 'PRINCIPAL') ? 'password' : 'date'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition-all outline-none text-slate-800 font-medium"
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
                    className={`w-full py-4 rounded-lg text-white font-bold shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-base ${loading ? 'bg-gray-400 cursor-not-allowed opacity-70' :
                        selectedRole === 'ADMIN' ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl' :
                          selectedRole === 'FACULTY' ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl' :
                            selectedRole === 'STUDENT' ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:shadow-xl' :
                              'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 hover:shadow-xl'
                      }`}
                    style={!loading ? {
                      boxShadow: selectedRole === 'ADMIN' ? '0 10px 25px -5px rgba(37, 99, 235, 0.5)' :
                        selectedRole === 'FACULTY' ? '0 10px 25px -5px rgba(22, 163, 74, 0.5)' :
                          selectedRole === 'STUDENT' ? '0 10px 25px -5px rgba(147, 51, 234, 0.5)' :
                            '0 10px 25px -5px rgba(180, 83, 9, 0.5)'
                    } : {}}
                    disabled={loading}
                  >                 {loading ? (
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
