import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const API_BASE_URL = process.env.API_BASE_URL || 'http://54.81.174.174:8000';
const API_KEY = process.env.API_KEY || 'mackenzie-fintech-2026';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy Routes
  app.post('/api/transactions', async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to proxy request', details: error.message });
    }
  });

  app.post('/api/transactions/:id/verify', async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${req.params.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to proxy request' });
    }
  });

  app.get('/api/transactions/:id', async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${req.params.id}/`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to proxy request' });
    }
  });

  app.get('/api/fintech/:fintech_id/history', async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/fintech/${req.params.fintech_id}/history`, {
        headers: {
          'x-api-key': API_KEY,
        },
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to proxy request' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
