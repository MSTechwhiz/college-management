import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faArrowRight, faSpinner, faUniversity } from '@fortawesome/free-solid-svg-icons'

const DepartmentSelect = () => {
  const { user, selectDepartment } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSelect = async () => {
    if (!selected) {
      alert('Please select a department')
      return
    }

    setLoading(true)
    const result = await selectDepartment(selected)
    if (result.success) {
      navigate(getDashboardPath(user.role))
    } else {
      alert(result.error || 'Failed to select department')
      setLoading(false)
    }
  }

  const getDashboardPath = (role) => {
    switch (role) {
      case 'FACULTY': return '/faculty/dashboard'
      case 'STUDENT': return '/student/dashboard'
      default: return '/login'
    }
  }

  const departments = user?.departments || []

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
            <FontAwesomeIcon icon={faUniversity} className="text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Select Department</h2>
          <p className="text-slate-500 mt-2">Please choose your department to continue</p>
        </div>

        <div className="space-y-3 mb-8">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelected(dept)}
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 group text-left ${
                selected === dept
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-gray-100 hover:border-blue-400 hover:bg-slate-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                selected === dept ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'
              }`}>
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <span className={`font-semibold ${selected === dept ? 'text-blue-900' : 'text-slate-700'}`}>{dept}</span>
              
              {selected === dept && (
                <div className="ml-auto text-blue-600">
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSelect}
          disabled={!selected || loading}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin />
              Processing...
            </>
          ) : (
            <>
              Continue to Dashboard
              <FontAwesomeIcon icon={faArrowRight} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default DepartmentSelect
