import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import SQLiteStore from 'connect-sqlite3';

// Load environment variables
dotenv.config();

// Import routes
import routes from './routes';
import healthRouter from './routes/health';
import { initDatabase } from './db/init';

// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 4000;
const SQLiteStoreInstance = SQLiteStore(session);

// Session configuration
app.use(session({
  store: new SQLiteStoreInstance({ db: 'sessions.sqlite', dir: './data' }) as session.Store,
  secret: process.env.SESSION_SECRET || 'Secret_default',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
    sameSite: 'lax', 
    domain: process.env.NODE_ENV === 'production' ? 'docmatrix.zapto.org' : 'localhost'
  }
}));

// Security middleware
app.use(helmet());

// Request logging
app.use(morgan('dev'));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://docmatrix.zapto.org' 
    : true,
  credentials: true
}));

// Body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api', routes);
app.use('/api/health', healthRouter);

// Initialize database
initDatabase();

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
