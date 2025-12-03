const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || [
      'http://localhost:5173',  // local dev
      'https://hrms11m.netlify.app'  // production
    ],
    methods: ['GET','POST']
  }
});

const onlineUsers = new Map();
const pendingDeletes = new Map();

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join', ({ userId, name }) => {
    if (!userId) return;
    socket.userId = userId; // track on socket
    onlineUsers.set(userId, { socketId: socket.id, name });

    // deliver any pending delete requests to this user
    const pend = pendingDeletes.get(userId) || [];
    for (const pd of pend) {
      io.to(socket.id).emit('deleteMessageRequest', { messageId: pd.messageId, fromId: pd.fromId });
    }
    pendingDeletes.delete(userId);

    io.emit('onlineUsers', Array.from(onlineUsers.entries()).map(([id, info]) => ({ id, name: info.name })));
  });

  // forward private message (existing)
    socket.on('privateMessage', ({ toId, fromId, message, id, time }) => {
    console.log('Backend received privateMessage:', { toId, fromId, message, id });
    const entry = onlineUsers.get(toId);
    if (entry) {
        // Forward with ID and time so receiver can dedupe
        io.to(entry.socketId).emit('privateMessage', { 
        fromId, 
        message,
        id,        // Include ID
        time       // Include time
        });
    }
    });

  // Sender requests message deletion
  socket.on('deleteMessage', ({ messageId, toId, fromId }) => {
    const entry = onlineUsers.get(toId);
    if (entry) {
      // forward request to recipient
      io.to(entry.socketId).emit('deleteMessageRequest', { messageId, fromId });
    } else {
      // recipient offline -> queue request and notify sender that it's queued
      const arr = pendingDeletes.get(toId) || [];
      arr.push({ messageId, fromId });
      pendingDeletes.set(toId, arr);
      socket.emit('deleteMessageQueued', { messageId });
    }
  });

  // Recipient response to delete request: { messageId, fromId, success }
  socket.on('deleteMessageResponse', ({ messageId, fromId, success }) => {
    const senderEntry = onlineUsers.get(fromId);
    if (senderEntry) {
      io.to(senderEntry.socketId).emit('deleteMessageResponse', { messageId, success });
    }
  });

  // Recipient notifies sender that message was read
  socket.on('messageRead', ({ messageId, fromId }) => {
    const senderEntry = onlineUsers.get(fromId);
    if (senderEntry) {
      io.to(senderEntry.socketId).emit('messageRead', { messageId, by: socket.userId });
    }
  });

  socket.on('disconnect', () => {
    for (const [id, info] of onlineUsers.entries()) {
      if (info.socketId === socket.id) {
        onlineUsers.delete(id);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.entries()).map(([id, info]) => ({ id, name: info.name })));
    console.log('socket disconnected', socket.id);
  });
});

server.listen(port , ()=>{
    console.log(`Server is running on port ${port}`);
});