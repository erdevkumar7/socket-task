// src/index.ts
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sequelize from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import path from 'path';
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
// Middlewares
app.use(express.json());
app.use(cookieParser());

// Authentication routes
app.use(authRoutes);
// User routes
app.use(userRoutes)

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  // Join a room
  socket.join('room1');
  socket.on('message', (data) => {
    console.log('message received:', data);
    // Broadcast the message to all clients in the 'room1' room
    io.to('room1').emit('message', `${data}`);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache static assets for 1 day
  setHeaders: (res, path) => {
    if (express.static.mime.lookup(path) === 'text/html') {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

sequelize.sync().then(() => {
  httpServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}).catch(error => {
  console.error('Unable to sync database:', error);
});
