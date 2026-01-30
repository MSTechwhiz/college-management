import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faEdit, faTrash, faPlus, faSearch, faTimes, faMoneyBillWave, 
  faCheckCircle, faExclamationCircle, faList, faArrowLeft 
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

const Fees = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  // Data States
  const [fees, setFees] = useState([])
  const [feeStructures, setFeeStructures] = useState([])
  const [departments, setDepartments] = useState([])
  
  // View State
  const [activeView, setActiveView] = useState('overview') // overview, structures, paid, pending
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Modals
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFee, setEditingFee] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  
  // Forms
  const [structureForm, setStructureForm] = useState({
    department: '',
    year: 1,
    semester: 1,
    feeType: 'Tuition',
    amount: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [feesRes, structuresRes, deptsRes] = await Promise.all([
        api.get('/fees'),
        api.get('/fees/structure'),
        api.get('/departments')
      ])
      setFees(feesRes.data || [])
      setFeeStructures(structuresRes.data || [])
      setDepartments(deptsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load fees data.')
    } finally {
      setLoading(false)
    }
  }

  // Derived Data
  const paidFees = fees.filter(f => f.status === 'PAID')
  const pendingFees = fees.filter(f => f.status === 'PENDING' || f.status === 'PARTIAL')
  
  const totalPaidAmount = paidFees.reduce((sum, f) => sum + (f.paidAmount || 0), 0)
  const totalPendingAmount = pendingFees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0)

  // Handlers
  const handleCreateStructure = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/fees/structure', structureForm)
      setShowStructureModal(false)
      fetchData()
      setStructureForm({ department: '', year: 1, semester: 1, feeType: 'Tuition', amount: 0 })
    } catch (error) {
      alert(error.userMessage || 'Error creating fee structure')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (fee) => {
    setEditingFee(fee)
    setEditAmount(fee.totalAmount)
    setShowEditModal(true)
  }

  const handleUpdateFee = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.put(`/fees/${editingFee.id}`, { ...editingFee, totalAmount: Number(editAmount) })
      setShowEditModal(false)
      setEditingFee(null)
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error updating fee')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return
    try {
      await api.delete(`/fees/${id}`)
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error deleting fee')
    }
  }

  const handleDeleteStructure = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fee structure?')) return
    try {
      await api.delete(`/fees/structure/${id}`)
      fetchData()
    } catch (error) {
      alert(error.userMessage || 'Error deleting fee structure')
    }
  }

  const filteredList = (list) => {
    if (!searchTerm) return list
    const lower = searchTerm.toLowerCase()
    return list.filter(item => 
      (item.studentName?.toLowerCase().includes(lower)) ||
      (item.registerNumber?.toLowerCase().includes(lower)) ||
      (item.department?.toLowerCase().includes(lower)) ||
      (item.feeType?.toLowerCase().includes(lower))
    )
  }

  // Render Views
  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Fee Management */}
      <div 
        onClick={() => setActiveView('structures')}
        className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-slate-100 group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
            <FontAwesomeIcon icon={faMoneyBillWave} size="lg" />
          </div>
          <span className="text-3xl font-bold text-slate-800">{feeStructures.length}</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-600 group-hover:text-blue-600">Total / Fees Management</h3>
        <p className="text-sm text-slate-400 mt-2">Manage fee structures & types</p>
      

      {/* Card 2: Completed Payments */}
      <div 
        onClick={() => setActiveView('paid')}
        className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-slate-100 group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="bg-green-600 text-white p-4 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
            <FontAwesomeIcon icon={faCheckCircle} size="lg" />
          </div>
          <div className="text-right">
             <span className="block text-3xl font-bold text-slate-800">₹{totalPaidAmount.toLocaleString()}</span>
             <span className="text-sm text-slate-500">{paidFees.length} Students</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-600 group-hover:text-green-600">Completed Payments</h3>
        <p className="text-sm text-slate-400 mt-2">View fully paid records</p>
      </div>

      {/* Card 3: Pending Payments */}
      <div 
        onClick={() => setActiveView('pending')}
        className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-slate-100 group"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300">
            <FontAwesomeIcon icon={faExclamationCircle} size="lg" />
          </div>
          <div className="text-right">
             <span className="block text-3xl font-bold text-slate-800">₹{totalPendingAmount.toLocaleString()}</span>
             <span className="text-sm text-slate-500">{pendingFees.length} Students</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-600 group-hover:text-yellow-600">Pending Payments</h3>
        <p className="text-sm text-slate-400 mt-2">View outstanding dues</p>
      </div>
    </div>
  )

  const renderStructures = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Fee Structures</h2>
        <button 
          onClick={() => setShowStructureModal(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          Add Structure
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feeStructures.length === 0 ? (
          <p className="text-slate-500 italic">No fee structures defined.</p>
        ) : (
          feeStructures.map((fs) => (
            <div key={fs.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-all relative group">
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteStructure(fs.id); }}
                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Structure"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">{fs.feeType || 'Tuition'}</h3>
                  <p className="text-sm text-slate-500">{fs.department}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                  Yr {fs.year} • Sem {fs.semester}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800">₹{fs.amount.toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderTable = (data, type) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">
          {type === 'paid' ? 'Completed Payments' : 'Pending Payments'}
        </h3>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-2.5 text-slate-400" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Register No</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Dept</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Yr/Sem</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Type</th>
              {type === 'pending' && <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>}
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Paid</th>
              {type === 'pending' && <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</th>}
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredList(data).length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-10 text-center text-slate-500">
                  No records found.
                </td>
              </tr>
            ) : (
              filteredList(data).map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{fee.studentName || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fee.registerNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fee.year}/{fee.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fee.feeType || 'Tuition'}</td>
                  {type === 'pending' && <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">₹{fee.totalAmount.toLocaleString()}</td>}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">₹{fee.paidAmount.toLocaleString()}</td>
                  {type === 'paid' && <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{fee.lastPaymentProcessedAt ? new Date(fee.lastPaymentProcessedAt).toLocaleDateString() : 'N/A'}</td>}
                  {type === 'pending' && <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">₹{fee.pendingAmount.toLocaleString()}</td>}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      fee.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                      fee.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {fee.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <button onClick={() => handleEdit(fee)} className="text-blue-600 hover:text-blue-900" title="Edit">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(fee.id)} className="text-red-600 hover:text-red-900" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-4">
                {activeView !== 'overview' && (
                  <button onClick={() => { setActiveView('overview'); setSearchTerm('') }} className="text-slate-500 hover:text-blue-600">
                    <FontAwesomeIcon icon={faArrowLeft} size="lg" />
                  </button>
                )}
                <h1 className="text-xl font-bold text-slate-800">
                  {activeView === 'overview' ? 'Fees Management' : 
                   activeView === 'structures' ? 'Fee Structures' :
                   activeView === 'paid' ? 'Completed Payments' : 'Pending Payments'}
                </h1>
            </div>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-slate-600 font-medium">{user?.username || 'Admin'}</span>
            </div>
        </header>

        <main className="p-8 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error}</div>
          ) : (
            <>
              {activeView === 'overview' && renderOverview()}
              {activeView === 'structures' && renderStructures()}
              {activeView === 'paid' && renderTable(paidFees, 'paid')}
              {activeView === 'pending' && renderTable(pendingFees, 'pending')}
            </>
          )}
        </main>
      </div>

      
      {showStructureModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Define Fee Structure</h2>
            <form onSubmit={handleCreateStructure} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fee Type</label>
                <select
                  value={structureForm.feeType}
                  onChange={(e) => setStructureForm({ ...structureForm, feeType: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="Tuition">Tuition Fees</option>
                  <option value="Term">Term Fees</option>
                  <option value="Exam">Exam Fees</option>
                  <option value="Bus">Bus Fees</option>
                  <option value="Hostel">Hostel Fees</option>
                  <option value="Semester">Semester Fees</option>
                  <option value="Common">Common / Breakage Fees</option>
                  <option value="Other">Other Fees</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={structureForm.department}
                  onChange={(e) => setStructureForm({ ...structureForm, department: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={structureForm.year}
                    onChange={(e) => setStructureForm({ ...structureForm, year: parseInt(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={structureForm.semester}
                    onChange={(e) => setStructureForm({ ...structureForm, semester: parseInt(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={structureForm.amount}
                  onChange={(e) => setStructureForm({ ...structureForm, amount: parseFloat(e.target.value) })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Structure'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowStructureModal(false)} 
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Edit Fee Amount</h2>
            <form onSubmit={handleUpdateFee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Fee'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Fees
