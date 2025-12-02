const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET','POST']
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('join', ({ userId, name }) => {
    if (!userId) return;
    onlineUsers.set(userId, { socketId: socket.id, name });
    io.emit('onlineUsers', Array.from(onlineUsers.entries()).map(([id, info]) => ({ id, name: info.name })));
  });

  socket.on('privateMessage', ({ toId, fromId, message }) => {
    const entry = onlineUsers.get(toId);
    if (entry) {
      io.to(entry.socketId).emit('privateMessage', { fromId, message });
    }
  });

  socket.on('disconnect', () => {
    // remove any user that had this socket id
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