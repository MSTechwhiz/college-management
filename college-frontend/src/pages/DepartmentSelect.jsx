import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DepartmentSelect = () => {
  const { user, selectDepartment } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('')

  const handleSelect = async () => {
    if (!selected) {
      alert('Please select a department')
      return
    }

    const result = await selectDepartment(selected)
    if (result.success) {
      navigate(getDashboardPath(user.role))
    } else {
      alert(result.error || 'Failed to select department')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Select Department</h2>
        <div className="space-y-3">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelected(dept)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selected === dept
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        <button
          onClick={handleSelect}
          disabled={!selected}
          className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default DepartmentSelect
