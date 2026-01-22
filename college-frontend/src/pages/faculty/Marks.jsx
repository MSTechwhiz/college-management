import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const Marks = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    studentId: '',
    registerNumber: '',
    subject: '',
    caMarks: 0,
    modelMarks: 0,
    practicalMarks: 0
  })

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:8080/api/marks', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      alert('Marks submitted successfully')
      setFormData({
        studentId: '',
        registerNumber: '',
        subject: '',
        caMarks: 0,
        modelMarks: 0,
        practicalMarks: 0
      })
    } catch (error) {
      alert(error.response?.data || 'Error submitting marks')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/faculty/dashboard')} className="text-blue-600">← Back</button>
              <h1 className="text-xl font-bold text-gray-800">Enter Marks</h1>
            </div>
            <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Enter Marks</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Student ID"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Register Number"
              value={formData.registerNumber}
              onChange={(e) => setFormData({ ...formData, registerNumber: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="CA Marks"
              value={formData.caMarks}
              onChange={(e) => setFormData({ ...formData, caMarks: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Model Marks"
              value={formData.modelMarks}
              onChange={(e) => setFormData({ ...formData, modelMarks: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Practical Marks"
              value={formData.practicalMarks}
              onChange={(e) => setFormData({ ...formData, practicalMarks: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Submit Marks
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Marks
