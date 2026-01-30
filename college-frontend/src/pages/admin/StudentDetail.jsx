import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faUserGraduate, faMoneyBillWave, faClipboardList, faChartBar, faGraduationCap } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const StudentDetail = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { registerNumber } = useParams()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDetail()
  }, [registerNumber])

  const fetchDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/students/register/${registerNumber}`)
      setDetail(response.data)
    } catch (error) {
      console.error('Error fetching student detail:', error)
      setError('Failed to load student details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white shadow-sm h-16 flex items-center px-8 sticky top-0 z-10">
        <button 
          onClick={() => navigate('/admin/students')} 
          className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mr-4 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Student Profile</h1>
      </header>

      <div className="p-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
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
                onClick={fetchDetail}
                className="text-red-700 hover:text-red-900 font-medium text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        ) : detail && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 text-4xl" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-gray-800">{detail.student.fullName}</h2>
                  <p className="text-gray-500 font-medium">{detail.student.registerNumber}</p>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Department</p>
                      <p className="text-gray-800 font-medium">{detail.student.department}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Year / Semester</p>
                      <p className="text-gray-800 font-medium">{detail.student.year} / {detail.student.semester}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Admission Type</p>
                      <p className="text-gray-800 font-medium">{detail.student.admissionType}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Scholarship</p>
                      <p className="text-gray-800 font-medium">{detail.student.scholarshipCategory || 'None'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fees Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-green-600" />
                  Fees Summary
                </h3>
                {detail.fees.length === 0 ? (
                  <p className="text-gray-500 italic">No fee records found.</p>
                ) : (
                  <div className="space-y-3">
                    {detail.fees.map((fee) => (
                      <div key={fee.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">Year {fee.year} • Sem {fee.semester}</span>
                          <span className="font-bold text-gray-900">₹{fee.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${fee.pendingAmount === 0 ? 'bg-green-600' : 'bg-yellow-500'}`} 
                            style={{ width: `${Math.min((fee.paidAmount / fee.totalAmount) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-600">
                          <span>Paid: ₹{fee.paidAmount.toLocaleString()}</span>
                          <span className={fee.pendingAmount > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            Pending: ₹{fee.pendingAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attendance & Stats */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <FontAwesomeIcon icon={faClipboardList} className="mr-2 text-indigo-600" />
                    Attendance
                  </h3>
                  <div className="flex items-center justify-center p-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={detail.attendancePercentage >= 75 ? "#10B981" : "#EF4444"}
                          strokeWidth="3"
                          strokeDasharray={`${detail.attendancePercentage}, 100`}
                        />
                        <text x="18" y="20.35" className="text-2xl font-bold fill-current text-gray-700" textAnchor="middle">
                          {Math.round(detail.attendancePercentage)}%
                        </text>
                      </svg>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">Overall Attendance</p>
                </div>
              </div>
            </div>

            {/* Marks */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon icon={faChartBar} className="mr-2 text-purple-600" />
                Academic Performance
              </h3>
              {detail.marks.length === 0 ? (
                <p className="text-gray-500 italic">No marks recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CA</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practical</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detail.marks.map((mark) => (
                        <tr key={mark.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mark.subject}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mark.caMarks}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mark.modelMarks}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mark.practicalMarks}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{mark.totalMarks}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${mark.grade === 'F' ? 'bg-red-100 text-red-800' : 
                                mark.grade === 'A+' || mark.grade === 'O' ? 'bg-green-100 text-green-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                              {mark.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDetail
