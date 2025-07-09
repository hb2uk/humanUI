import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '@humanui/config';
import { prisma } from '@humanui/db';

// Import routes
import itemRoutes from './api/item';
import itemIdRoutes from './api/item/[id]';

const app = express();
const port = env.API_PORT;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/items', itemIdRoutes);

// Users API (legacy - can be moved to separate route file later)
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({
      data: { email, name },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.listen(port, () => {
  console.log(`🚀 API server running on http://localhost:${port}`);
}); 