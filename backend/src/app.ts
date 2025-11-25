import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config';
import registerRoutes from './routes/register';

const app: Application = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow frontend assets to load
}));

// CORS configuration
app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to registration endpoint
app.use('/api/register', limiter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api', registerRoutes);

// Serve static frontend files in production
if (config.nodeEnv === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
  
  // Handle client-side routing - serve index.html for root and other routes
  // This must come after API and health routes to avoid overriding them
  app.use((_req: Request, res: Response, next: NextFunction) => {
    // Skip if it's an API or health route
    if (_req.path.startsWith('/api') || _req.path === '/health') {
      return next();
    }
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // 404 handler for development (API only)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
    });
  });
}

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(JSON.stringify({
    level: 'error',
    message: err.message,
    stack: err.stack,
  }));

  res.status(500).json({
    success: false,
    message: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

export default app;
