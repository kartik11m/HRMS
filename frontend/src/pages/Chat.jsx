import React, { useState } from 'react'

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: 'Meg Griffin',
      role: 'Web Dev,Django Guy',
      message: 'Sent you a message',
      time: '34m',
      avatar: 'M',
      unread: true,
      status: 'online'
    },
    {
      id: 2,
      name: 'The Boyz',
      role: 'joe68: sent a message',
      message: 'Group message',
      time: '34m',
      avatar: 'B',
      unread: true,
      status: 'online'
    },
    {
      id: 3,
      name: 'Stewie Griffin',
      role: 'Sent you a message',
      message: 'Group message',
      time: '17h',
      avatar: 'S',
      unread: false,
      status: 'offline'
    },
    {
      id: 4,
      name: 'Glenn Quagmire',
      role: 'The silence lmaoo',
      message: 'Message',
      time: '20h',
      avatar: 'G',
      unread: false,
      status: 'offline'
    },
    {
      id: 5,
      name: 'Herbert',
      role: 'Active',
      message: 'Message',
      time: '6m ago',
      avatar: 'H',
      unread: false,
      status: 'online'
    }
  ])

  const [selectedChat, setSelectedChat] = useState(1)
  const [inputMessage, setInputMessage] = useState('')
  const [chatListOpen, setChatListOpen] = useState(true)

  const selectedChatData = messages.find(m => m.id === selectedChat)

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setInputMessage('')
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat List Sidebar */}
      <div className={`${
        chatListOpen ? 'block' : 'hidden'
      } md:block w-full md:w-80 bg-white border-r border-gray-200 overflow-y-auto`}>
        {/* Messages Header */}
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <button
              onClick={() => setChatListOpen(false)}
              className="md:hidden text-gray-600"
            >
              <svg className="w-6 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center bg-blue-50 rounded-lg px-3 py-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search Chats....."
              className="bg-transparent ml-2 w-full text-sm outline-none text-gray-600 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="divide-y divide-gray-100">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => {
                setSelectedChat(msg.id)
                setChatListOpen(false)
              }}
              className={`w-full p-2.5 text-left transition-colors ${
                selectedChat === msg.id ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-semibold shrink-0 text-sm">
                  {msg.avatar}
                </div>
                
                {/* Message Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 truncate text-sm">{msg.name}</h3>
                    {msg.status === 'online' && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{msg.role}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500">{msg.time}</p>
                    {msg.unread && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${
        chatListOpen ? 'hidden' : 'flex'
      } md:flex flex-1 flex-col bg-white`}>
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-3 md:p-4 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <button
              onClick={() => setChatListOpen(true)}
              className="md:hidden text-gray-600 shrink-0"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-linear-to-br from-gray-400 to-gray-600 text-white flex items-center justify-center font-semibold shrink-0 text-sm md:text-base">
              {selectedChatData?.avatar}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 truncate text-sm md:text-base">{selectedChatData?.name}</h3>
              <p className="text-xs md:text-sm text-gray-500 truncate">{selectedChatData?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button className="text-gray-600 hover:text-gray-800 p-1 md:p-2">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 p-1 md:p-2 hidden sm:block">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 p-1 md:p-2">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Sample messages */}
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-3 md:px-4 py-2 max-w-xs md:max-w-md">
              <p className="text-sm">Hey Eric, have you collaborated with Fred yet?</p>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-3 md:px-4 py-2 max-w-xs md:max-w-md">
              <p className="text-sm">So.. question. How long has server been unconscious?</p>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-blue-300 text-gray-800 rounded-lg px-3 md:px-4 py-2 max-w-xs md:max-w-md">
              <p className="text-sm">Oh my god, Chris. The server is not working and it is showing some problem indication...</p>
            </div>
          </div>

          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-3 md:px-4 py-2 max-w-xs md:max-w-md">
              <p className="text-sm">Y fear when Chris is here... I've taught you well. You have the right instincts...</p>
            </div>
          </div>

          <div className="flex justify-start mt-6 mb-4">
            <button className="px-3 md:px-4 py-1 bg-gray-100 text-gray-600 text-xs md:text-sm border border-gray-300 rounded hover:bg-gray-50">
              Section 3
            </button>
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-3 md:p-4 bg-blue-50">
          <div className="flex items-center gap-2 md:gap-3">
            <button className="text-blue-500 hover:text-blue-600 shrink-0 p-1">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
              </svg>
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="What would you like to say?"
              className="flex-1 bg-white border border-gray-300 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendMessage}
              className="text-gray-600 hover:text-gray-800 shrink-0 p-1"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 C22.9702544,11.6889879 22.9702544,11.6889879 22.9702544,11.6889879 L4.13399899,1.16151493 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.98722579 L3.03521743,10.4282188 C3.03521743,10.5853161 3.19218622,10.7424135 3.50612381,10.7424135 L16.6915026,11.5279004 C16.6915026,11.5279004 17.1624089,11.5279004 17.1624089,12.0991925 C17.1624089,12.6704847 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat