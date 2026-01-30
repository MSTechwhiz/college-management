import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faMoneyBillWave, faReceipt, faSignOutAlt, faCreditCard, faHistory, faPrint, faFileInvoice } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import PaymentModal from '../../components/PaymentModal'
import ReceiptModal from '../../components/ReceiptModal'

const FeesView = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFee, setSelectedFee] = useState(null)
  
  // History & Receipt State
  const [showHistory, setShowHistory] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    if (user && user.username) {
        fetchFees()
    }
  }, [user])

  useEffect(() => {
      if (showHistory && user && user.username && paymentHistory.length === 0) {
          fetchPaymentHistory()
      }
  }, [showHistory, user])

  const fetchFees = async () => {
    setLoading(true)
    try {
      const studentId = user?.username
      const response = await api.get(`/fees/student/${studentId}`)
      setFees(response.data)
    } catch (error) {
      console.error('Error fetching fees:', error)
      alert(error.userMessage || 'Error fetching fees')
    } finally {
        setLoading(false)
    }
  }

  const fetchPaymentHistory = async () => {
      setHistoryLoading(true)
      try {
          const studentId = user?.username
          const response = await api.get(`/fees/student/${studentId}/payments`)
          setPaymentHistory(response.data)
      } catch (error) {
          console.error('Error fetching payment history:', error)
      } finally {
          setHistoryLoading(false)
      }
  }

  const handlePaymentSuccess = () => {
      setSelectedFee(null)
      fetchFees() // Refresh fees
      fetchPaymentHistory() // Refresh history
  }

  const handleShowReceipt = (payment) => {
      // Find the fee details for this payment to show feeType etc on receipt
      const relatedFee = fees.find(f => f.id === payment.feeId)
      setSelectedReceipt({
          transaction: payment,
          fee: relatedFee,
          student: {
              fullName: payment.studentId, // We might need to fetch student name if not in payment
              registerNumber: payment.registerNumber,
              department: payment.department
          }
      })
  }

  // Find fee type for a payment record
  const getFeeType = (feeId) => {
      const fee = fees.find(f => f.id === feeId)
      return fee ? fee.feeType : 'Fee'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/student/dashboard')} 
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span className="font-medium">Back</span>
              </button>
              <h1 className="text-xl font-bold text-gray-800 border-l-2 border-gray-300 pl-4">
                My Fees
              </h1>
            </div>
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                        showHistory ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {showHistory ? <FontAwesomeIcon icon={faMoneyBillWave} /> : <FontAwesomeIcon icon={faHistory} />}
                    {showHistory ? 'View Current Fees' : 'Payment History'}
                </button>
                <button 
                    onClick={logout} 
                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Logout
                </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {showHistory ? (
                // Payment History View
                <div className="overflow-x-auto">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FontAwesomeIcon icon={faHistory} className="text-blue-600" />
                            Transaction History
                        </h2>
                    </div>
                    {historyLoading ? (
                        <div className="flex justify-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : paymentHistory.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <FontAwesomeIcon icon={faFileInvoice} size="3x" className="mb-4 text-gray-300" />
                            <p>No payment history found.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paymentHistory.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(payment.processedAt).toLocaleDateString()}
                                            <span className="block text-xs text-gray-400">{new Date(payment.processedAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                            {payment.idempotencyKey || payment.transactionId?.substring(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                            {getFeeType(payment.feeId)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                            ₹{payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 uppercase">
                                            {payment.paymentMethod}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleShowReceipt(payment)}
                                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                                            >
                                                <FontAwesomeIcon icon={faPrint} />
                                                Receipt
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                // Current Fees View
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faReceipt} />
                                Period
                            </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {fees.map((fee) => (
                        <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                            {fee.feeType || 'Tuition'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                            Year {fee.year} / Sem {fee.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold">₹{fee.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">₹{fee.paidAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-red-600 font-medium">₹{fee.pendingAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                fee.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                                fee.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                                {fee.status || 'PENDING'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {fee.status !== 'PAID' && (
                                <button
                                    onClick={() => setSelectedFee(fee)}
                                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded shadow-sm text-xs flex items-center gap-1 ml-auto"
                                >
                                    <FontAwesomeIcon icon={faCreditCard} />
                                    Pay Now
                                </button>
                            )}
                            {fee.status === 'PAID' && (
                                <span className="text-green-600 text-xs flex items-center gap-1 ml-auto justify-end">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    Paid
                                </span>
                            )}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {fees.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        <FontAwesomeIcon icon={faMoneyBillWave} size="3x" className="mb-4 text-gray-300" />
                        <p>No fee records found</p>
                    </div>
                )}
                </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedFee && (
        <PaymentModal 
            fee={selectedFee} 
            onClose={() => setSelectedFee(null)} 
            onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
          <ReceiptModal 
              transaction={selectedReceipt.transaction}
              fee={selectedReceipt.fee}
              student={selectedReceipt.student}
              onClose={() => setSelectedReceipt(null)}
          />
      )}
    </div>
  )
}

export default FeesView
