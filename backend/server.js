require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { prisma, connectDB } = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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
  
  // Auto-deploy database schema
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "_prisma_migrations" ("id" VARCHAR(36) PRIMARY KEY, "checksum" VARCHAR(64), "finished_at" TIMESTAMPTZ, "migration_name" VARCHAR(255), "logs" TEXT, "rolled_back_at" TIMESTAMPTZ, "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "applied_steps_count" INTEGER NOT NULL DEFAULT 0);`;
  
  const count = await prisma.plan.count();
  if (count === 0) {
    await prisma.plan.createMany({
      data: [
        { name: 'Starter', roiPercent: 5, minAmount: 100, maxAmount: 999, durationDays: 7, description: 'Daily Returns' },
        { name: 'Growth', roiPercent: 15, minAmount: 1000, maxAmount: 9999, durationDays: 14, description: 'Daily Returns' },
        { name: 'Premium', roiPercent: 30, minAmount: 10000, maxAmount: 49999, durationDays: 30, description: 'Daily Returns' },
        { name: 'Elite', roiPercent: 50, minAmount: 50000, maxAmount: 999999999, durationDays: 60, description: 'Daily Returns' }
      ]
    });
    console.log('Default plans created');
  }
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
