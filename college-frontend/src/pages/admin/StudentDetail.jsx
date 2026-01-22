import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const StudentDetail = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { registerNumber } = useParams()
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    fetchDetail()
  }, [registerNumber])

  const fetchDetail = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/students/register/${registerNumber}`)
      setDetail(response.data)
    } catch (error) {
      console.error('Error fetching student detail:', error)
    }
  }

  if (!detail) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/admin/students')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Student Detail</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <p><strong>Register Number:</strong> {detail.student.registerNumber}</p>
            <p><strong>Name:</strong> {detail.student.fullName}</p>
            <p><strong>Department:</strong> {detail.student.department}</p>
            <p><strong>Year:</strong> {detail.student.year}</p>
            <p><strong>Semester:</strong> {detail.student.semester}</p>
            <p><strong>Admission Type:</strong> {detail.student.admissionType}</p>
            <p><strong>Quota:</strong> {detail.student.quota}</p>
            <p><strong>Scholarship:</strong> {detail.student.scholarshipCategory}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Fees Summary</h2>
          <div className="space-y-2">
            {detail.fees.map((fee) => (
              <div key={fee.id} className="border-b pb-2">
                <p>Year {fee.year} Sem {fee.semester}: Total ₹{fee.totalAmount}, Paid ₹{fee.paidAmount}, Pending ₹{fee.pendingAmount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Attendance: {detail.attendancePercentage.toFixed(2)}%</h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Marks</h2>
          <div className="space-y-2">
            {detail.marks.map((mark) => (
              <div key={mark.id} className="border-b pb-2">
                <p><strong>{mark.subject}:</strong> CA: {mark.caMarks}, Model: {mark.modelMarks}, Practical: {mark.practicalMarks}, Total: {mark.totalMarks}, Grade: {mark.grade}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetail
