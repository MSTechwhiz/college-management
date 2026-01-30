import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faList, faBook, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Marks = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [year, setYear] = useState(1)
  const [subject, setSubject] = useState('')
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({}) // studentId -> { ca, model, practical, locked }
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    if (!subject) {
      alert('Please enter a subject')
      return
    }
    setLoading(true)
    try {
      // Fetch students and marks in parallel
      const [studentsRes, marksRes] = await Promise.all([
        api.get(`/faculty/dashboard/students/${year}`),
        api.get(`/marks/subject/${subject}`)
      ])

      const fetchedStudents = studentsRes.data
      const fetchedMarks = marksRes.data
      
      setStudents(fetchedStudents)

      // Initialize marks state
      const marksMap = {}
      fetchedStudents.forEach(s => {
        const studentMark = fetchedMarks.find(m => m.studentId === s.id)
        if (studentMark) {
          marksMap[s.id] = {
            caMarks: studentMark.caMarks,
            modelMarks: studentMark.modelMarks,
            practicalMarks: studentMark.practicalMarks,
            locked: studentMark.locked
          }
        } else {
          marksMap[s.id] = {
            caMarks: 0,
            modelMarks: 0,
            practicalMarks: 0,
            locked: false
          }
        }
      })
      setMarks(marksMap)

    } catch (error) {
      console.error('Error fetching data:', error)
      alert(error.userMessage || 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (studentId, field, value) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: Number(value)
      }
    }))
  }

  const handleSubmit = async () => {
    if (!subject) return alert('Please enter a subject')
    
    // Prepare payload
    const payload = students.map(s => {
        const m = marks[s.id]
        if (!m) return null
        return {
            studentId: s.id,
            registerNumber: s.registerNumber,
            subject: subject,
            caMarks: m.caMarks,
            modelMarks: m.modelMarks,
            practicalMarks: m.practicalMarks
        }
    }).filter(item => item !== null) // Filter out any nulls if any

    if (payload.length === 0) return

    setSaving(true)
    try {
      await api.post('/marks/bulk', payload)
      alert('Marks submitted successfully')
      // Refresh data to get locked status etc
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error submitting marks')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/faculty/dashboard')} 
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back
              </button>
              <h1 className="text-xl font-bold text-gray-800">Enter Marks</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faList} className="mr-2 text-gray-400" />
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4].map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FontAwesomeIcon icon={faBook} className="mr-2 text-gray-400" />
                Subject
              </label>
              {dashboardLoading ? (
                <div className="w-full p-2 border rounded bg-gray-100 text-gray-500">Loading subjects...</div>
              ) : assignedSubjects.length > 0 ? (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Subject</option>
                  {assignedSubjects.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter subject code/name"
                />
              )}
            </div>
            <div className="flex items-end">
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-2"/> Loading...</> : 'Load Students'}
                </button>
            </div>
          </div>
        </div>

        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-gray-800">Student List ({students.length})</h2>
               <div className="text-sm text-gray-500 italic">
                 * Marks once submitted cannot be edited if locked
               </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                     <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">CA (25)</th>
                     <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Model (25)</th>
                     <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Practical (50)</th>
                     <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {students.map((student) => {
                     const m = marks[student.id] || { caMarks: 0, modelMarks: 0, practicalMarks: 0, locked: false }
                     const total = m.caMarks + m.modelMarks + m.practicalMarks
                     return (
                       <tr key={student.id} className="hover:bg-gray-50">
                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.registerNumber}</td>
                         <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{student.fullName}</td>
                         <td className="px-4 py-2 whitespace-nowrap text-center">
                           <input
                             type="number"
                             min="0"
                             max="25"
                             value={m.caMarks}
                             onChange={(e) => handleInputChange(student.id, 'caMarks', e.target.value)}
                             disabled={m.locked}
                             className="w-20 p-1 border rounded text-center focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                           />
                         </td>
                         <td className="px-4 py-2 whitespace-nowrap text-center">
                           <input
                             type="number"
                             min="0"
                             max="25"
                             value={m.modelMarks}
                             onChange={(e) => handleInputChange(student.id, 'modelMarks', e.target.value)}
                             disabled={m.locked}
                             className="w-20 p-1 border rounded text-center focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                           />
                         </td>
                         <td className="px-4 py-2 whitespace-nowrap text-center">
                           <input
                             type="number"
                             min="0"
                             max="50"
                             value={m.practicalMarks}
                             onChange={(e) => handleInputChange(student.id, 'practicalMarks', e.target.value)}
                             disabled={m.locked}
                             className="w-20 p-1 border rounded text-center focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                           />
                         </td>
                         <td className="px-4 py-2 whitespace-nowrap text-center font-bold text-gray-700">
                           {total}
                         </td>
                       </tr>
                     )
                   })}
                 </tbody>
               </table>
             </div>
 
             <div className="mt-6 flex justify-end">
               <button
                 onClick={handleSubmit}
                 disabled={saving}
                 className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 shadow-md transform transition hover:-translate-y-0.5 disabled:opacity-50"
               >
                 {saving ? <><FontAwesomeIcon icon={faSpinner} spin className="mr-2"/> Saving...</> : <><FontAwesomeIcon icon={faSave} className="mr-2"/> Save Marks</>}
               </button>
             </div>
           </div>
        )}
      </div>
    </div>
  )
}

export default Marks
