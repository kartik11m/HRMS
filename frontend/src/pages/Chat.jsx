import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContextData } from '../context/UserContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { showMessageNotification } from '../utils/toast';

const Chat = () => {
  const { user } = useContext(UserContextData);

  const [messages, setMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const allUsersRef = useRef([]); // REF to avoid re-running socket effect
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [unreadCounts, setUnreadCounts] = useState({}); // { userId: count }
  const [totalUnread, setTotalUnread] = useState(0); // total unread count

  const socketRef = useRef(null);
  const messagesLoadedRef = useRef(false);
  const handlersRef = useRef({});
  const markedAsReadRef = useRef(new Set());
  const processedMessageIdsRef = useRef(new Set()); // server ids
  const processedSignaturesRef = useRef(new Set()); // client signatures for dedupe
  const selectedUserRef = useRef(null);
  const audioRef = useRef(null);
  const toastShownRef = useRef(new Set()); // track shown notifications (by signature)

  const BACKEND = import.meta.env.VITE_BASE_URL || 'http://localhost:4000';
  const currentUserId = user?._id || user?.email;

  // Keep refs in sync
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);
  useEffect(() => { allUsersRef.current = allUsers; }, [allUsers]);

  // helper to build a stable signature when server doesn't provide id
  const getSignature = (from, text, time) => `${from}::${text}::${time || ''}`;

  // Calculate total unread whenever unreadCounts changes
  useEffect(() => {
    const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
    setTotalUnread(total);
    document.title = total > 0 ? `(${total}) Chat - HRMS` : 'Chat - HRMS';
  }, [unreadCounts]);

  // Prepare audio and request Notification permission
  useEffect(() => {
    try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(()=>{}); } catch (e) {}
    audioRef.current = new Audio('/ping.mp3');
  }, []);

  // Load messages from localStorage once and populate processed IDs/signatures
  useEffect(() => {
    if (!messagesLoadedRef.current) {
      const saved = localStorage.getItem('chatMessages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed);
          parsed.forEach(m => {
            if (m.id) processedMessageIdsRef.current.add(m.id);
            const sig = m.signature || getSignature(m.from, m.text, m.time);
            processedSignaturesRef.current.add(sig);
          });
          console.log('Loaded', parsed.length, 'messages from localStorage');
        } catch (e) {
          console.error('Failed to parse saved chatMessages', e);
        }
      }
      messagesLoadedRef.current = true;
    }
  }, []);

  // Persist messages
  useEffect(() => {
    try { localStorage.setItem('chatMessages', JSON.stringify(messages)); } catch (e) {}
  }, [messages]);

  // Fetch users
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await axios.get(`${BACKEND}/users/all`);
        const myId = currentUserId;
        const filtered = Array.isArray(res.data) ? res.data.filter(u => (u._id || u.email) !== myId) : [];
        setAllUsers(filtered);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    })();
  }, [user, BACKEND, currentUserId]);

  // Socket setup
  useEffect(() => {
    if (!user) return;

    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const s = io(BACKEND, {
      transports: ['websocket','polling'],
      forceNew: true,
      reconnection: true
    });
    socketRef.current = s;

    const myId = currentUserId || `anon-${Date.now()}`;
    const name = `${user?.fullname?.firstname || ''} ${user?.fullname?.lastname || ''}`.trim() || user?.email || 'Unknown';

    s.once('connect', () => { s.emit('join', { userId: myId, name }); });

    s.on('connect_error', (err) => console.error('Socket connect error', err));

    const handleOnlineUsers = (list) => {
      const ids = new Set(list.map(u => u.id));
      setOnlineUserIds(ids);
    };

    const handlePrivateMessage = ({ fromId, message, id: incomingId, time: incomingTime }) => {
      const signature = incomingId ? incomingId : getSignature(fromId, message, incomingTime);

      // If message is from self: update local message status instead of adding/notify
      if (fromId === myId) {
        // try update by server id or by signature
        if (incomingId && processedMessageIdsRef.current.has(incomingId)) {
          setMessages(prev => prev.map(m => m.id === incomingId ? { ...m, status: 'sent', time: incomingTime || m.time } : m));
        } else if (processedSignaturesRef.current.has(signature)) {
          setMessages(prev => prev.map(m => m.signature === signature ? { ...m, status: 'sent', time: incomingTime || m.time, id: incomingId || m.id } : m));
          if (incomingId) processedMessageIdsRef.current.add(incomingId);
        }
        return;
      }

      if (processedMessageIdsRef.current.has(signature) || processedSignaturesRef.current.has(signature)) {
        return;
      }

      processedSignaturesRef.current.add(signature);
      if (incomingId) processedMessageIdsRef.current.add(incomingId);

      setMessages(prev => {
        if (prev.some(m => (incomingId && m.id === incomingId) || m.signature === signature)) return prev;

        const msg = {
          id: incomingId || signature,
          signature,
          from: fromId,
          to: myId,
          text: message,
          time: incomingTime || new Date().toLocaleString(),
          status: 'received'
        };

        const viewingSender = selectedUserRef.current && selectedUserRef.current._id === fromId;
        const pageFocused = document.hasFocus();

        if (!viewingSender || !pageFocused) {
          setUnreadCounts(prevCounts => {
            const next = { ...prevCounts };
            next[fromId] = (next[fromId] || 0) + 1;
            return next;
          });

          // play sound
          try { audioRef.current?.play().catch(()=>{}); } catch (e) {}

          // show toast once per signature
          if (!toastShownRef.current.has(signature)) {
            toastShownRef.current.add(signature);
            setTimeout(() => toastShownRef.current.delete(signature), 2 * 60 * 1000);
            const senderName = allUsersRef.current.find(u => u._id === fromId)?.fullname?.firstname || 'Someone';
            showMessageNotification(senderName, message);
          }

          // desktop notification
          try {
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
              const senderUser = allUsersRef.current.find(u => u._id === fromId);
              const senderDisplayName = senderUser ? `${senderUser.fullname?.firstname} ${senderUser.fullname?.lastname}` : 'New message';
              const body = message.length > 80 ? message.slice(0,77) + '...' : message;
              const n = new Notification(senderDisplayName, { body, tag: signature, renotify: true });
              n.onclick = () => { window.focus(); n.close(); };
            }
          } catch (e) {}
        }

        return [...prev, msg];
      });
    };

    const handleDeleteRequest = ({ messageId, fromId }) => {
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === messageId);
        if (idx === -1) { s.emit('deleteMessageResponse', { messageId, fromId, success: true }); return prev; }
        const msg = prev[idx];
        if (msg.status === 'read') { s.emit('deleteMessageResponse', { messageId, fromId, success: false }); return prev; }
        const updated = [...prev.slice(0, idx), ...prev.slice(idx + 1)];
        s.emit('deleteMessageResponse', { messageId, fromId, success: true });
        return updated;
      });
    };

    const handleDeleteResponse = ({ messageId, success }) => {
      setMessages(prev => success ? prev.filter(m => m.id !== messageId) : prev.map(m => m.id === messageId ? { ...m, deleting: false, cannotDelete: true } : m));
    };

    const handleDeleteQueued = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };

    const handleMessageRead = ({ messageId }) => {
      if (markedAsReadRef.current.has(messageId)) { markedAsReadRef.current.delete(messageId); return; }
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'read' } : m));
    };

    handlersRef.current = { handleOnlineUsers, handlePrivateMessage, handleDeleteRequest, handleDeleteResponse, handleDeleteQueued, handleMessageRead };

    s.on('onlineUsers', handleOnlineUsers);
    s.on('privateMessage', handlePrivateMessage);
    s.on('deleteMessageRequest', handleDeleteRequest);
    s.on('deleteMessageResponse', handleDeleteResponse);
    s.on('deleteMessageQueued', handleDeleteQueued);
    s.on('messageRead', handleMessageRead);

    return () => {
      if (socketRef.current) {
        const h = handlersRef.current;
        socketRef.current.off('onlineUsers', h.handleOnlineUsers);
        socketRef.current.off('privateMessage', h.handlePrivateMessage);
        socketRef.current.off('deleteMessageRequest', h.handleDeleteRequest);
        socketRef.current.off('deleteMessageResponse', h.handleDeleteResponse);
        socketRef.current.off('deleteMessageQueued', h.handleDeleteQueued);
        socketRef.current.off('messageRead', h.handleMessageRead);
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, BACKEND, currentUserId]); // allUsers handled via ref

  // Retry pending messages when recipient becomes online
  useEffect(() => {
    if (!socketRef.current || !user) return;
    setMessages(prev => prev.map(m => {
      if (m.status === 'pending' && onlineUserIds.has(m.to)) {
        socketRef.current.emit('privateMessage', { toId: m.to, fromId: m.from, message: m.text, id: m.id, time: m.time });
        return { ...m, status: 'sent' };
      }
      return m;
    }));
  }, [onlineUserIds, user]);

  // Mark messages as read when opening conversation and clear unread badge
  useEffect(() => {
    if (!selectedUser || !socketRef.current || !currentUserId) return;

    setMessages(prev => {
      const unread = prev.filter(m => m.to === currentUserId && m.from === selectedUser._id && m.status !== 'read');
      if (!unread.length) return prev;

      unread.forEach(m => {
        markedAsReadRef.current.add(m.id);
        socketRef.current.emit('messageRead', { messageId: m.id, fromId: m.from });
      });

      // Clear unread badge for this user
      setUnreadCounts(prevCounts => {
        const next = { ...prevCounts };
        delete next[selectedUser._id];
        return next;
      });

      return prev.map(m => unread.find(u => u.id === m.id) ? { ...m, status: 'read' } : m);
    });
  }, [selectedUser, currentUserId]);

  // Send message
  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedUser) return;

    const fromId = currentUserId;
    const toId = selectedUser._id;
    const isOnline = onlineUserIds.has(toId);
    const messageTime = new Date().toLocaleString();
    const msgId = `${fromId}_${Date.now()}_${Math.random()}`;
    const signature = getSignature(fromId, inputMessage.trim(), messageTime);

    const newMsg = {
      id: msgId,
      signature,
      from: fromId,
      to: toId,
      text: inputMessage.trim(),
      time: messageTime,
      status: isOnline ? 'sent' : 'pending'
    };

    // mark id and signature as processed before emitting so echoed event is ignored
    processedMessageIdsRef.current.add(newMsg.id);
    processedSignaturesRef.current.add(signature);
    setMessages(prev => [...prev, newMsg]);

    if (isOnline && socketRef.current) {
      socketRef.current.emit('privateMessage', { toId, fromId, message: newMsg.text, id: newMsg.id, time: messageTime });
    }

    setInputMessage('');
  };

  // Request delete
  const handleDeleteMessage = msg => {
    if (!msg || msg.from !== currentUserId) return;
    if (msg.status === 'read') { alert('Cannot delete a message that has already been read.'); return; }
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, deleting: true } : m));
    socketRef.current?.emit('deleteMessage', { messageId: msg.id, toId: msg.to, fromId: msg.from });
  };

  const conversation = messages.filter(m =>
    selectedUser && ((m.from === currentUserId && m.to === selectedUser._id) || (m.to === currentUserId && m.from === selectedUser._id))
  );

  const onlineUsers = allUsers.filter(u => onlineUserIds.has(u._id));
  const offlineUsers = allUsers.filter(u => !onlineUserIds.has(u._id));

  return (
    <div className="flex h-screen bg-gray-100">
      <ToastContainer />

      <div className="w-80 bg-white border-r border-gray-300 p-3 overflow-y-auto shadow-md">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h1 className="font-bold text-lg text-blue-600">💬 Chat</h1>
          {totalUnread > 0 && <div className="text-sm text-red-600 mt-1">📨 {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}</div>}
        </div>

        {onlineUsers.length > 0 && (
          <div className="mb-4">
            <h2 className="font-bold mb-2 text-green-600 text-sm">🟢 Online ({onlineUsers.length})</h2>
            {onlineUsers.map(u => (
              <button key={u._id} onClick={() => setSelectedUser(u)} className={`w-full text-left p-2 rounded mb-1 transition-all ${selectedUser?._id === u._id ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-400 text-white flex items-center justify-center text-xs font-semibold">{(u.fullname?.firstname || u.email || 'U')[0].toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{u.fullname?.firstname} {u.fullname?.lastname}</div>
                    <div className="text-xs text-green-600">● Online</div>
                  </div>
                  {unreadCounts[u._id] > 0 && <div className="ml-2 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">{unreadCounts[u._id]}</div>}
                </div>
              </button>
            ))}
          </div>
        )}

        {offlineUsers.length > 0 && (
          <div>
            <h2 className="font-bold mb-2 mt-4 text-gray-600 text-sm">⚫ Offline ({offlineUsers.length})</h2>
            {offlineUsers.map(u => (
              <button key={u._id} onClick={() => setSelectedUser(u)} className={`w-full text-left p-2 rounded mb-1 transition-all opacity-75 ${selectedUser?._id === u._id ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">{(u.fullname?.firstname || u.email || 'U')[0].toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{u.fullname?.firstname} {u.fullname?.lastname}</div>
                    <div className="text-xs text-gray-500">● Offline</div>
                  </div>
                  {unreadCounts[u._id] > 0 && <div className="ml-2 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">{unreadCounts[u._id]}</div>}
                </div>
              </button>
            ))}
          </div>
        )}

        {allUsers.length === 0 && <div className="text-center text-gray-500 mt-8">No users available</div>}
      </div>

      <div className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${onlineUserIds.has(selectedUser._id) ? 'bg-green-400' : 'bg-gray-400'}`}>{(selectedUser.fullname?.firstname || selectedUser.email || 'U')[0].toUpperCase()}</div>
                <div>
                  <div className="font-semibold">{selectedUser.fullname?.firstname} {selectedUser.fullname?.lastname}</div>
                  <div className={`text-xs ${onlineUserIds.has(selectedUser._id) ? 'text-green-600' : 'text-gray-500'}`}>{onlineUserIds.has(selectedUser._id) ? '● Online' : '● Offline'}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              {conversation.length > 0 ? conversation.map(m => (
                <div key={m.id} className={`flex ${m.from === currentUserId ? 'justify-end' : 'justify-start'}`}>
                  <div className="relative">
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${m.from === currentUserId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                      <div className="text-sm break-words">{m.text}</div>
                      <div className={`text-xs mt-1 ${m.from === currentUserId ? 'text-blue-100' : 'text-gray-600'}`}>{m.time}</div>
                      {m.from === currentUserId && <div className="text-xs mt-1">[{m.status === 'read' ? '✓✓' : '✓'}]</div>}
                    </div>

                    {m.from === currentUserId && m.status !== 'read' && !m.cannotDelete && (
                      <button onClick={() => handleDeleteMessage(m)} className="absolute -bottom-6 right-0 text-xs text-red-600 hover:text-red-800 underline">Delete</button>
                    )}
                  </div>
                </div>
              )) : <div className="flex items-center justify-center h-full text-gray-500">No messages yet. Start the conversation!</div>}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center gap-2">
                <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder={`Message ${selectedUser.fullname?.firstname || selectedUser.email}...`} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                <button onClick={handleSendMessage} disabled={!inputMessage.trim()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">Send</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-xl font-semibold mb-2">No Chat Selected</div>
              <div className="text-sm">Select a user from the left to start chatting</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;