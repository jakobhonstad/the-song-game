import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import gameRoutes, { games, players } from './routes/game';
import songRoutes from './routes/songs';
import { initWebSocketServer, setGameStorage } from './websocket/server';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
}));

// Routes
app.get('/', (c) => {
  return c.json({ message: 'The Song Game API' });
});

app.route('/api/games', gameRoutes);
app.route('/api/songs', songRoutes);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server starting on port ${port}...`);

const server = serve({
  fetch: app.fetch,
  port,
}) as any;

// Initialize WebSocket server and share storage
setGameStorage(games, players);
initWebSocketServer(server);

console.log(`✅ Server running on http://localhost:${port}`);
