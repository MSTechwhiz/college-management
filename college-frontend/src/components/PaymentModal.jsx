import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faCreditCard, faLock, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import api from '../utils/api'

const PaymentModal = ({ fee, onClose, onSuccess }) => {
  const [amount, setAmount] = useState(fee.pendingAmount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('input') // input, processing, success, failure
  const [receipt, setReceipt] = useState(null)

  const handlePayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Initiate Payment
      const initResponse = await api.post('/payments/initiate', {
        feeId: fee.id,
        amount: parseFloat(amount),
        returnUrl: window.location.href
      })

      const { transactionId, paymentUrl } = initResponse.data

      // 2. Simulate Redirect / Processing (Mock Gateway)
      setStep('processing')
      
      // Simulate delay for user experience
      setTimeout(async () => {
        try {
            // 3. Verify Payment
            const verifyResponse = await api.post('/payments/verify', {
                transactionId,
                feeId: fee.id,
                amount: parseFloat(amount)
            })

            if (verifyResponse.data.status === 'SUCCESS') {
                setStep('success')
                setReceipt(verifyResponse.data)
                setTimeout(() => {
                    onSuccess()
                }, 2000)
            } else {
                setStep('failure')
                setError('Payment verification failed.')
            }
        } catch (verifyErr) {
            setStep('failure')
            setError('Payment verification failed: ' + verifyErr.message)
        } finally {
            setLoading(false)
        }
      }, 2000)

    } catch (err) {
      console.error('Payment error:', err)
      setError(err.response?.data?.message || 'Payment initiation failed')
      setLoading(false)
      setStep('input')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faCreditCard} className="text-blue-600" />
            Secure Payment
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'input' && (
            <form onSubmit={handlePayment}>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Fee Type</p>
                <p className="font-medium text-gray-800">{fee.feeType}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    max={fee.pendingAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max payable: ₹{fee.pendingAmount}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={faExclamationCircle} />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between mt-8">
                <div className="flex items-center gap-2 text-green-600 text-xs font-medium">
                  <FontAwesomeIcon icon={faLock} />
                  256-bit SSL Encrypted
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50 font-medium"
                >
                  {loading ? 'Processing...' : `Pay ₹${amount}`}
                </button>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-medium text-gray-900">Processing Payment...</h4>
              <p className="text-sm text-gray-500 mt-2">Please do not close this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-3xl" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h4>
              <p className="text-gray-600 mb-6">Transaction ID: {receipt?.transactionId}</p>
              <button
                onClick={onSuccess}
                className="bg-green-600 text-white px-8 py-2.5 rounded-lg hover:bg-green-700 transition-colors shadow-md font-medium"
              >
                Done
              </button>
            </div>
          )}
          
          {step === 'failure' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faExclamationCircle} className="text-red-600 text-3xl" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h4>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => setStep('input')}
                className="bg-gray-800 text-white px-8 py-2.5 rounded-lg hover:bg-gray-900 transition-colors shadow-md font-medium"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
