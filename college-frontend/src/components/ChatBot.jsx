import { useState, useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentDots, faTimes, faPaperPlane, faRobot, faUser } from '@fortawesome/free-solid-svg-icons'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I can help you with navigation and academic questions. How can I assist you?' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulate bot response time
    setTimeout(() => {
      const response = getBotResponse(input.toLowerCase())
      setMessages(prev => [...prev, { role: 'bot', text: response }])
      setIsTyping(false)
    }, 1000)
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
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 z-50 animate-bounce-subtle"
        >
          <FontAwesomeIcon icon={faCommentDots} className="text-2xl" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 animate-slide-up" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <div>
                <h3 className="font-bold">AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-xs text-blue-100">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-2 transition-colors">
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0">
                    <FontAwesomeIcon icon={faRobot} />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-slate-700 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs flex-shrink-0">
                  <FontAwesomeIcon icon={faRobot} />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatBot
