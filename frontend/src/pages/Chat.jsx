import React, { useState, useContext, useEffect, useRef } from 'react'
import { UserContextData } from '../context/UserContext'
import { io } from "socket.io-client";
import axios from 'axios';

const Chat = () => {
  const { user } = useContext(UserContextData);

  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const socketRef = useRef(null);
  const messagesLoadedRef = useRef(false); // track if we've loaded from localStorage

  //Loading messages from localStorage on mount (run only once)
  useEffect(() => {
    if (!messagesLoadedRef.current) {
      const saved = localStorage.getItem('chatMessages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
          console.log('Loaded messages from localStorage:', parsed.length);
        } catch (e) {
          console.error('Failed to parse saved messages', e);
        }
      }
      messagesLoadedRef.current = true;
    }
  }, []);

  // Saving messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Fetching all the users from backend
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BASE_URL || 'http://localhost:4000'}/users/all`);
        const userId = user?._id || user?.email;
        const filtered = res.data.filter(u => u._id !== userId && u.email !== userId);
        setAllUsers(filtered);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    if (user) fetchAllUsers();
  }, [user]);

  // Socket setup: join and receive events
  useEffect(() => {
    if (!user) return;
    
    socketRef.current = io(import.meta.env.VITE_BASE_URL || 'http://localhost:4000');

    const userId = user?._id || user?.email || `anon-${Date.now()}`;
    const name = `${user?.fullname?.firstname || ''} ${user?.fullname?.lastname || ''}`.trim() || user?.email || 'Unknown';

    socketRef.current.emit('join', { userId, name });

    socketRef.current.on('onlineUsers', (list) => {
      const onlineIds = new Set(list.map(u => u.id));
      setOnlineUserIds(onlineIds);
    });

    socketRef.current.on('privateMessage', ({ fromId, message }) => {
      // incoming message from someone else
      const msg = {
        id: `${Date.now()}_${Math.random()}`,
        from: fromId,
        to: userId,
        text: message,
        time: new Date().toLocaleString(),
        status: 'received'
      };
      // append to existing messages (don't replace)
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // Retry sending pending messages when online list changes
  useEffect(() => {
    if (!socketRef.current) return;
    const userId = user?._id || user?.email;
    
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.status === 'pending' && onlineUserIds.has(m.to)) {
          socketRef.current.emit('privateMessage', { toId: m.to, fromId: m.from, message: m.text });
          return { ...m, status: 'sent' };
        }
        return m;
      });
      return updated;
    });
  }, [onlineUserIds]); // eslint-disable-line

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedUser) return;
    const fromId = user?._id || user?.email;
    const toId = selectedUser._id;
    const isOnline = onlineUserIds.has(toId);

    const newMsg = {
      id: `${Date.now()}_${Math.random()}`,
      from: fromId,
      to: toId,
      text: inputMessage.trim(),
      time: new Date().toLocaleString(),
      status: isOnline ? 'sent' : 'pending'
    };

    // store locally first
    setMessages(prev => [...prev, newMsg]);

    // if online, send immediately
    if (isOnline && socketRef.current) {
      socketRef.current.emit('privateMessage', { toId, fromId, message: newMsg.text });
    }

    setInputMessage('');
  };

  // helpers to get conversation with selected user
  const currentUserId = user?._id || user?.email;
  const conversation = messages.filter(m =>
    (m.from === currentUserId && m.to === selectedUser?._id) ||
    (m.to === currentUserId && m.from === selectedUser?._id)
  );

  // separate online and offline users
  const onlineUsers = allUsers.filter(u => onlineUserIds.has(u._id));
  const offlineUsers = allUsers.filter(u => !onlineUserIds.has(u._id));

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-80 bg-white border-r p-2 overflow-y-auto">
        <h2 className="font-bold mb-2 text-green-600">Online ({onlineUsers.length})</h2>
        {onlineUsers.map(u => (
          <button key={u._id} onClick={() => setSelectedUser(u)} className={`w-full text-left p-2 rounded mb-1 ${selectedUser?._id === u._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-400 text-white flex items-center justify-center text-xs font-semibold">
                {(u.fullname?.firstname || u.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{u.fullname?.firstname} {u.fullname?.lastname}</div>
                <div className="text-xs text-green-600">● Online</div>
              </div>
            </div>
          </button>
        ))}

        <h2 className="font-bold mb-2 mt-4 text-gray-600">Offline ({offlineUsers.length})</h2>
        {offlineUsers.map(u => (
          <button key={u._id} onClick={() => setSelectedUser(u)} className={`w-full text-left p-2 rounded mb-1 ${selectedUser?._id === u._id ? 'bg-blue-50' : ''}`}>
            <div className="flex items-center gap-2 opacity-80">
              <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                {(u.fullname?.firstname || u.email || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{u.fullname?.firstname} {u.fullname?.lastname}</div>
                <div className="text-xs text-gray-500">● Offline</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="bg-white border-b p-4">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${onlineUserIds.has(selectedUser._id) ? 'bg-green-400' : 'bg-gray-400'}`}>
                  {(selectedUser.fullname?.firstname || selectedUser.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{selectedUser.fullname?.firstname} {selectedUser.fullname?.lastname}</div>
                  <div className={`text-xs ${onlineUserIds.has(selectedUser._id) ? 'text-green-600' : 'text-gray-500'}`}>
                    {onlineUserIds.has(selectedUser._id) ? '● Online' : '● Offline'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {conversation.length > 0 ? (
                conversation.map(m => (
                  <div key={m.id} className={`mb-3 ${m.from === currentUserId ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-3 py-2 rounded ${m.from === currentUserId ? 'bg-blue-300' : 'bg-gray-200'}`}>
                      <div className="text-sm">{m.text}</div>
                      <div className="text-xs text-gray-600">
                        {m.time} {m.from === currentUserId && <span className="ml-2 text-xs">[{m.status}]</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No messages yet</div>
              )}
            </div>

            <div className="border-t p-3 bg-blue-50">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${selectedUser.fullname?.firstname || selectedUser.email}`}
                  className="flex-1 border px-3 py-2 rounded"
                />
                <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">Select a user to chat</div>
        )}
      </div>
    </div>
  )
}

export default Chat;