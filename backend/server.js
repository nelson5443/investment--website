require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

connectDB().then(async () => {
  const Plan = require('./models/Plan');
  const count = await Plan.countDocuments();
  if (count === 0) {
    await Plan.insertMany([
      { name: 'Starter', roiPercent: 5, minAmount: 100, maxAmount: 999, durationDays: 7, description: 'Daily Returns' },
      { name: 'Growth', roiPercent: 15, minAmount: 1000, maxAmount: 9999, durationDays: 14, description: 'Daily Returns' },
      { name: 'Premium', roiPercent: 30, minAmount: 10000, maxAmount: 49999, durationDays: 30, description: 'Daily Returns' },
      { name: 'Elite', roiPercent: 50, minAmount: 50000, maxAmount: 999999999, durationDays: 60, description: 'Daily Returns' }
    ]);
    console.log('Default plans created');
  }
});

app.use(cors());
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

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
    // Send to receiver
    io.to(receiverId).emit('receiveMessage', payload);
    // Echo back to sender
    socket.emit('receiveMessage', payload);
  });

  socket.on('disconnect', () => {
    Object.keys(connectedUsers).forEach(uid => {
      if (connectedUsers[uid] === socket.id) delete connectedUsers[uid];
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
