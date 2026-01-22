import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const FeesView = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [fees, setFees] = useState([])

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    try {
      // Get student ID from user context or token
      const studentId = user?.username // Assuming username is register number
      const response = await axios.get(`http://localhost:8080/api/fees/student/${studentId}`)
      setFees(response.data)
    } catch (error) {
      console.error('Error fetching fees:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/student/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Fees</h1>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year/Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">Year {fee.year} Sem {fee.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.paidAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.pendingAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FeesView
