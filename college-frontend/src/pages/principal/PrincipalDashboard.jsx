import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faSchool } from '@fortawesome/free-solid-svg-icons'

const PrincipalDashboard = () => {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const resp = await api.get('/admin/dashboard/counts')
        setSummary(resp.data)
      } catch (e) {
        setError('Unable to load institutional summary')
      } finally {
        setLoading(false)
      }
    }
    fetchSummary()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-page py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center">
            <FontAwesomeIcon icon={faSchool} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Principal Dashboard</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-500 text-sm">Signed in as</p>
              <p className="text-slate-800 font-semibold">{user?.username}</p>
            </div>
            <div className="text-amber-600">
              <FontAwesomeIcon icon={faChartLine} className="text-2xl" />
            </div>
          </div>

          {loading && <div className="py-8 text-center text-slate-500">Loading...</div>}
          {error && <div className="py-8 text-center text-red-600">{error}</div>}

          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 text-sm">Departments</p>
                <p className="text-2xl font-bold text-slate-800">{summary.departments}</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 text-sm">Students</p>
                <p className="text-2xl font-bold text-slate-800">{summary.students}</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-slate-500 text-sm">Faculty</p>
                <p className="text-2xl font-bold text-slate-800">{summary.faculty}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrincipalDashboard
