// src/index.ts
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './config/database';
import authRoutes from './routes/auth.routes';
import authMiddleware from './middleware/auth';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());

// Authentication routes
app.use('/auth', authRoutes);

// Protected route example
app.get('/protected', authMiddleware, (req, res) => {
  res.send('This is a protected route');
});

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  socket.on('message', (data) => {
    console.log('message received:', data);
    //message back to the client
    // socket.emit('message', `Server get: ${data}`);
    // Broadcast the received message to all connected clients
    io.emit('message', `Server get: ${data}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(express.static(path.join(__dirname, 'public')));

// Sync Sequelize models and start the server
sequelize.sync().then(() => {
  httpServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Unable to sync database:', error);
});
