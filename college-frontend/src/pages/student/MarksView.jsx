import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const MarksView = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [marks, setMarks] = useState([])

  useEffect(() => {
    fetchMarks()
  }, [])

  const fetchMarks = async () => {
    try {
      const studentId = user?.username // This would need to be actual student ID
      const response = await axios.get(`http://localhost:8080/api/marks/student/${studentId}`)
      setMarks(response.data)
    } catch (error) {
      console.error('Error fetching marks:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/student/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Marks</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Practical</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marks.map((mark) => (
                <tr key={mark.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{mark.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{mark.caMarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{mark.modelMarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{mark.practicalMarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{mark.totalMarks}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">{mark.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MarksView
