require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', time: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/trades', require('./routes/trades'));
app.use('/api/chat', require('./routes/chat'));

// Socket.io live chat
const connectedUsers = {};

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    connectedUsers[userId] = socket.id;
    socket.join(userId);
  });

  socket.on('sendMessage', ({ senderId, receiverId, message, isAdminReply }) => {
    const payload = { senderId, message, isAdminReply, createdAt: new Date() };
    io.to(receiverId).emit('receiveMessage', payload);
    socket.emit('receiveMessage', payload);
  });

  socket.on('disconnect', () => {
    Object.keys(connectedUsers).forEach(uid => {
      if (connectedUsers[uid] === socket.id) delete connectedUsers[uid];
    });
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
