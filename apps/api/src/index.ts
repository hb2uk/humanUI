import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '@humanui/config';
import { prisma } from '@humanui/db';

// Import route generator
import { RouteGenerator } from './generators/route-generator';

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

// --- Auto-generated entity routes ---
(async () => {
  try {
    console.log('🔍 Discovering entities...');
    const routeGen = RouteGenerator.getInstance();
    await routeGen.discoverEntities();
    
    console.log('📋 Registered entities:', Array.from(routeGen.getEntityConfigs().keys()));
    
    const routes = routeGen.generateAllRoutes();
    console.log('🚀 Generated routes:', routes.map(r => `/api/${r.path}`));
    
    for (const { path, router } of routes) {
      app.use(`/api/${path}`, router);
      console.log(`✅ Mounted /api/${path}`);
    }
  } catch (error) {
    console.error('❌ Error setting up auto-generated routes:', error);
  }
})();
// ------------------------------------

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