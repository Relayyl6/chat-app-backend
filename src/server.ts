import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.ts';
import { initializeSocket } from './socket/socket.manager.ts';
import { connectToDatabase } from './config/database.ts';
import { connectRedis } from './config/redis.ts';
import channelRouter from './routes/channel.routes.ts';
import messageRouter from './routes/message.routes.ts';
import { setupDNS } from './utils/dns-resolver.ts';
import { startHealthCheckJob } from './cron/cron.ts';
import { REDIS_URL } from './config/env.config.ts'

dotenv.config();

console.log('REDIS_URL:', REDIS_URL); // 👈 add this
const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/channels', channelRouter);
app.use('/api/messages', messageRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: "Backed is up and running", timestamp: Date.now().toString() });
});

// Initialize Socket.IO and make it accessible in routes
const io = initializeSocket(httpServer);
app.set('io', io);

// Start server
const PORT = process.env.PORT || 3000;



const startServer = async () => {
  try {
    await connectToDatabase();
    await connectRedis();
    startHealthCheckJob()
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

setupDNS();
startServer();