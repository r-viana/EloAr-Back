import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { config } from './config/environment';
import { pool } from './config/database';
import routes from './routes';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();
const PORT = config.port;

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'eloar-backend',
      version: '1.0.0',
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'eloar-backend',
      version: '1.0.0',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Mount API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.info(`
╔════════════════════════════════════════╗
║   EloAR Backend Server                 ║
║   Sistema de Enturmação Inteligente    ║
╚════════════════════════════════════════╝

🚀 Server running on port ${PORT}
🌍 Environment: ${config.nodeEnv}
📊 Database: ${config.database.host}:${config.database.port}/${config.database.name}
🐍 Python Service: ${config.pythonServiceUrl}
🔗 CORS Origin: ${config.corsOrigin}

Endpoints:
  - Health: http://localhost:${PORT}/health
  - API v1: http://localhost:${PORT}/api/v1
  `);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.info('\n\nShutting down gracefully...');

  server.close(async () => {
    console.info('✓ HTTP server closed');

    try {
      await pool.end();
      console.info('✓ Database connections closed');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
