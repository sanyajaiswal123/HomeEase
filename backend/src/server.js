const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Store connected users for real-time notification matching
const connectedUsers = new Map(); // userId -> socketId
const providerLocations = new Map(); // providerId -> { lat, lng }

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Register user with their socket ID
  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered to socket ${socket.id}`);
  });

  // Track provider location updates
  socket.on('update_location', ({ providerId, coordinates }) => {
    providerLocations.set(providerId, coordinates);
    // Broadcast location to customers tracking this provider
    io.to(`booking_track_${providerId}`).emit('location_updated', {
      providerId,
      coordinates
    });
  });

  // Join tracking room
  socket.on('join_tracking', ({ providerId }) => {
    socket.join(`booking_track_${providerId}`);
    console.log(`Socket ${socket.id} joined tracking for provider ${providerId}`);
    // Immediately send current location if available
    const location = providerLocations.get(providerId);
    if (location) {
      socket.emit('location_updated', { providerId, coordinates: location });
    }
  });

  // Leaving tracking room
  socket.on('leave_tracking', ({ providerId }) => {
    socket.leave(`booking_track_${providerId}`);
    console.log(`Socket ${socket.id} left tracking for provider ${providerId}`);
  });

  socket.on('disconnect', () => {
    // Clean up
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Share io instance globally by attaching it to app
app.set('io', io);
app.set('connectedUsers', connectedUsers);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
