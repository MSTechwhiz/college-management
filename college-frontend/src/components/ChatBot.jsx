import { useState } from 'react'
import { FiMessageCircle, FiX } from 'react-icons/fi'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I can help you with navigation and academic questions. How can I assist you?' }
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages([...messages, userMessage])
    setInput('')

    // Simple bot responses
    setTimeout(() => {
      const response = getBotResponse(input.toLowerCase())
      setMessages(prev => [...prev, { role: 'bot', text: response }])
    }, 500)
  }

  const getBotResponse = (message) => {
    if (message.includes('dashboard') || message.includes('home')) {
      return 'You can access your dashboard from the navigation menu. Admin, Faculty, and Student dashboards show different information based on your role.'
    }
    if (message.includes('attendance')) {
      return 'Attendance can be viewed in the Attendance section. Faculty can mark attendance, and students can view their attendance percentage.'
    }
    if (message.includes('marks') || message.includes('grades')) {
      return 'Marks are entered by faculty and can be viewed by students. The system automatically calculates totals and grades.'
    }
    if (message.includes('fees')) {
      return 'Fee information is available in the Fees section. Students can view their fee status, and admins can manage fee structures.'
    }
    if (message.includes('announcement')) {
      return 'Announcements are displayed on the login page and in your dashboard. They are sorted by publish date.'
    }
    if (message.includes('report')) {
      return 'Students can create reports for issues related to fees, marks, attendance, or other concerns. Reports are managed by admins.'
    }
    if (message.includes('help') || message.includes('navigation')) {
      return 'I can help with: Navigation, Academic questions about attendance, marks, fees, announcements, and reports. What would you like to know?'
    }
    return 'I can help you with navigation and academic questions. Try asking about dashboard, attendance, marks, fees, announcements, or reports.'
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col" style={{ height: '500px' }}>
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">AI Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 rounded p-1">
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot
