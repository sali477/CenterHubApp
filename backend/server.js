import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import routes from './src/routes/index.js';
import { errorHandler, notFound } from './src/middleware/errorHandler.js';
import { initializeSocket } from './src/socket/index.js';
import { stripeWebhook } from './src/controllers/paymentController.js';

connectDB();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeSocket(io);
app.set('io', io);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
});

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Stripe webhook needs raw body — must be before express.json()
app.post(
  '/api/payments/webhook/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('   Fix options:');
    console.error(`   1. Run: npm run kill-port`);
    console.error(`   2. Or run: npm run dev:clean`);
    console.error(`   3. Or change PORT in .env (e.g. PORT=5001)\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CentreHub Morocco API running on http://127.0.0.1:${PORT}`);
});

export default app;
