import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint, faTimes, faCheckCircle } from '@fortawesome/free-solid-svg-icons'

const ReceiptModal = ({ transaction, fee, student, onClose }) => {
  if (!transaction) return null

  const handlePrint = () => {
    const printContent = document.getElementById('receipt-content')
    const windowUrl = 'about:blank'
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    
    printWindow.document.write('<html><head><title>Receipt</title>')
    printWindow.document.write('<style>')
    printWindow.document.write(`
      body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; }
      .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
      .logo { font-size: 24px; font-weight: bold; color: #1a56db; margin-bottom: 5px; }
      .college-name { font-size: 18px; font-weight: bold; text-transform: uppercase; }
      .receipt-title { text-align: center; font-size: 20px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
      .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
      .label { font-weight: bold; color: #555; }
      .value { font-weight: normal; }
      .amount-box { border: 2px solid #333; padding: 10px; text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; }
      .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
      .stamp { text-align: right; margin-top: 30px; font-style: italic; }
      @media print { .no-print { display: none; } }
    `)
    printWindow.document.write('</style></head><body>')
    printWindow.document.write(printContent.innerHTML)
    printWindow.document.write('</body></html>')
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 250)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Payment Receipt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {/* Receipt Preview */}
        <div className="p-8 bg-gray-50 flex-1 overflow-y-auto">
          <div id="receipt-content" className="bg-white p-8 shadow-sm border border-gray-200 mx-auto max-w-lg">
            <div className="header">
              <div className="logo">SBCEC</div>
              <div className="college-name">St. Peter's College of Engineering</div>
              <div className="text-sm text-gray-500">Avadi, Chennai - 600054</div>
            </div>

            <div className="receipt-title">OFFICIAL RECEIPT</div>

            <div className="grid">
              <div>
                <div className="text-xs text-gray-500 uppercase">Receipt No</div>
                <div className="font-mono font-bold text-sm">{transaction.idempotencyKey || transaction.transactionId?.substring(0, 12)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase">Date</div>
                <div className="font-bold text-sm">
                  {new Date(transaction.processedAt).toLocaleDateString()} {new Date(transaction.processedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase mb-1">Received From</div>
              <div className="font-bold text-lg">{student?.fullName || 'Student'}</div>
              <div className="text-sm text-gray-600">Reg No: {transaction.registerNumber || student?.registerNumber}</div>
              <div className="text-sm text-gray-600">Dept: {transaction.department || student?.department}</div>
            </div>

            <div className="mb-6">
              <div className="text-xs text-gray-500 uppercase mb-1">Payment For</div>
              <div className="row">
                <span className="label">Fee Type</span>
                <span className="value">{fee?.feeType || 'Tuition Fees'}</span>
              </div>
              <div className="row">
                <span className="label">Academic Year</span>
                <span className="value">{fee?.academicYear || '2025-2026'}</span>
              </div>
              <div className="row">
                <span className="label">Payment Mode</span>
                <span className="value uppercase">{transaction.paymentMethod}</span>
              </div>
              <div className="row">
                <span className="label">Transaction Ref</span>
                <span className="value font-mono text-xs">{transaction.transactionId?.substring(0, 12)}...</span>
              </div>
            </div>

            <div className="amount-box">
              AMOUNT PAID: ₹{transaction.amount?.toLocaleString()}
            </div>

            <div className="stamp">
              <div className="text-green-600 font-bold border-2 border-green-600 inline-block px-4 py-1 rotate-[-12deg] opacity-80">
                PAID <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div className="text-xs text-gray-500 mt-1">Authorized Signature</div>
            </div>

            <div className="footer">
              <p>This is a computer generated receipt and does not require a physical signature.</p>
              <p>Generated on {new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-4 bg-white">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
          <button 
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center gap-2 transition-colors"
          >
            <FontAwesomeIcon icon={faPrint} />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal
