import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const Fees = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [fees, setFees] = useState([])
  const [feeStructures, setFeeStructures] = useState([])
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [structureForm, setStructureForm] = useState({
    department: '',
    year: 1,
    semester: 1,
    amount: 0
  })

  useEffect(() => {
    fetchFees()
    fetchFeeStructures()
  }, [])

  const fetchFees = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/fees')
      setFees(response.data)
    } catch (error) {
      console.error('Error fetching fees:', error)
    }
  }

  const fetchFeeStructures = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/fees/structure')
      setFeeStructures(response.data)
    } catch (error) {
      console.error('Error fetching fee structures:', error)
    }
  }

  const handleCreateStructure = async () => {
    try {
      await axios.post('http://localhost:8080/api/fees/structure', structureForm)
      setShowStructureModal(false)
      fetchFeeStructures()
    } catch (error) {
      alert(error.response?.data || 'Error creating fee structure')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Fees Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowStructureModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Define Fee Structure
              </button>
              <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Fee Structures</h2>
          <div className="space-y-2">
            {feeStructures.map((fs) => (
              <div key={fs.id} className="border-b pb-2">
                <p>{fs.department} - Year {fs.year} Sem {fs.semester}: ₹{fs.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year/Sem</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{fee.registerNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fee.year}/{fee.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.paidAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{fee.pendingAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showStructureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Define Fee Structure</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Department"
                value={structureForm.department}
                onChange={(e) => setStructureForm({ ...structureForm, department: e.target.value })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Year"
                value={structureForm.year}
                onChange={(e) => setStructureForm({ ...structureForm, year: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Semester"
                value={structureForm.semester}
                onChange={(e) => setStructureForm({ ...structureForm, semester: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Amount"
                value={structureForm.amount}
                onChange={(e) => setStructureForm({ ...structureForm, amount: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
              />
              <div className="flex space-x-4">
                <button onClick={handleCreateStructure} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Create
                </button>
                <button onClick={() => setShowStructureModal(false)} className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fees
