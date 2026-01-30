import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const DepartmentDetail = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDetail()
  }, [id])

  const fetchDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/departments/${id}`)
      setDetail(response.data)
    } catch (error) {
      console.error('Error fetching department detail:', error)
      setError('Failed to load department details.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl text-red-600 mb-4">{error}</h2>
        <button onClick={() => navigate('/admin/departments')} className="text-blue-600 hover:underline">
          Back to Departments
        </button>
      </div>
    </div>
  )

  if (!detail) return null

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white shadow-sm h-16 flex items-center px-8 sticky top-0 z-10">
        <button onClick={() => navigate('/admin/departments')} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mr-4 transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{detail.department.name}</h1>
      </header>

      <div className="p-8 flex-1 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">HOD Details</h2>
            {!isEditingHod ? (
              <button 
                onClick={() => {
                  setIsEditingHod(true)
                  setSelectedHodId(detail.department.hodId || '')
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
              >
                {detail.department.hodName ? 'Change HOD' : 'Assign HOD'}
              </button>
            ) : (
              <div className="space-x-2">
                <button 
                  onClick={handleSaveHod}
                  disabled={savingHod}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingHod ? 'Saving...' : 'Save'}
                </button>
                <button 
                  onClick={() => setIsEditingHod(false)}
                  className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {isEditingHod ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Faculty</label>
              <select
                value={selectedHodId}
                onChange={(e) => setSelectedHodId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Select Faculty --</option>
                {detail.faculty.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.facultyId})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            detail.department.hodName ? (
              <div>
                <p><strong>Name:</strong> {detail.department.hodName}</p>
                <p><strong>Faculty ID:</strong> {detail.department.hodId}</p>
              </div>
            ) : (
              <p className="text-gray-500">No HOD assigned</p>
            )
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Faculty List</h2>
          <div className="space-y-2">
            {detail.faculty.map((f) => (
              <div key={f.id} className="border-b pb-2">
                <p><strong>{f.name}</strong> - {f.role} ({f.facultyId})</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Student List</h2>
          <div className="space-y-2">
            {detail.students.map((s) => (
              <div
                key={s.id}
                onClick={() => navigate(`/admin/students/${s.registerNumber}`)}
                className="border-b pb-2 cursor-pointer hover:text-blue-600"
              >
                <p><strong>{s.registerNumber}</strong> - {s.fullName} (Year {s.year})</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepartmentDetail
