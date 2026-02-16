import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import themeRoutes from './routes/theme.routes';

dotenv.config();

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware
app.use(express.json());
app.use(cors()); // Allow all origins for now (adjust for prod)
app.use(helmet());
app.use(morgan('dev'));
app.use(limiter); // Apply rate limiting to all requests

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/theme', themeRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
