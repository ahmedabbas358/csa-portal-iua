import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load server/.env first (DATABASE_URL), then root .env (JWT_SECRET)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'csa-portal-secret-key-2024-change-in-production';
const SALT_ROUNDS = 10;

// ─── Middleware ─────────────────────────────────────────────────────
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// ─── File Upload Setup ──────────────────────────────────────────────
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg|mp4|mov|webm)$/i;
        if (allowed.test(path.extname(file.originalname))) {
            cb(null, true);
        } else {
            cb(new Error('Unsupported file type'));
        }
    }
});

// Error wrapper
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// ─── Auth Middleware ────────────────────────────────────────────────
const verifyDeanToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'dean') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // Verify session is still active in DB
        const session = await prisma.deanSession.findFirst({
            where: { token, isActive: true, expiresAt: { gt: new Date() } }
        });
        if (!session) {
            return res.status(401).json({ error: 'Session expired or revoked' });
        }
        // Update lastUsed
        await prisma.deanSession.update({ where: { id: session.id }, data: { lastUsed: new Date() } });
        (req as any).deanSession = session;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const verifyAdminToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const session = await prisma.adminSession.findFirst({
            where: { id: decoded.sessionId, isActive: true }
        });
        if (!session) {
            return res.status(401).json({ error: 'Session revoked' });
        }
        (req as any).adminSession = session;
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ─── Health Check / Root Route ──────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({ status: 'ok', message: 'CSA Portal API is running', version: '1.0.0' });
});
app.get('/api', (_req, res) => {
    res.json({ status: 'ok', endpoints: ['/api/events', '/api/members', '/api/news', '/api/timeline', '/api/settings'] });
});

// ═══════════════════════════════════════════════════════════════════
// PUBLIC ROUTES (No login required for regular users)
// ═══════════════════════════════════════════════════════════════════

// ─── Events (Public Read) ───────────────────────────────────────────
app.get('/api/events', asyncHandler(async (_req, res) => {
    const events = await prisma.event.findMany({ orderBy: { date: 'desc' } });
    res.json(events);
}));

// ─── Members (Public Read) ──────────────────────────────────────────
app.get('/api/members', asyncHandler(async (_req, res) => {
    const members = await prisma.member.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(members);
}));

// ─── News (Public Read) ─────────────────────────────────────────────
app.get('/api/news', asyncHandler(async (_req, res) => {
    const news = await prisma.news.findMany({ orderBy: { createdAt: 'desc' } });
    // Parse JSON fields
    const parsed = news.map(n => ({
        ...n,
        tags: (() => { try { return JSON.parse(n.tags); } catch { return []; } })(),
        design: n.design ? (() => { try { return JSON.parse(n.design); } catch { return null; } })() : null,
    }));
    res.json(parsed);
}));

// ─── Timeline (Public Read) ─────────────────────────────────────────
app.get('/api/timeline', asyncHandler(async (_req, res) => {
    const items = await prisma.timelineItem.findMany({ orderBy: { year: 'asc' } });
    res.json(items);
}));

// ─── Settings (Public Read) ─────────────────────────────────────────
app.get('/api/settings', asyncHandler(async (_req, res) => {
    let settings = await prisma.appSetting.findFirst({ where: { id: 'main' } });
    if (!settings) {
        settings = await prisma.appSetting.create({ data: { id: 'main' } });
    }
    res.json(settings);
}));

// ═══════════════════════════════════════════════════════════════════
// DEAN AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════

// Dean Login → Creates long-lived session
app.post('/api/auth/dean/login', asyncHandler(async (req, res) => {
    const { masterKey } = req.body;
    if (!masterKey) {
        return res.status(400).json({ error: 'Master key required' });
    }

    const config = await prisma.deanConfig.findFirst({ where: { id: 'config' } });
    if (!config) {
        return res.status(500).json({ error: 'System not initialized' });
    }

    const isValid = await bcrypt.compare(masterKey, config.masterKey);
    if (!isValid) {
        return res.status(401).json({ error: 'Invalid master key' });
    }

    // Create long-lived session token (365 days)
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year

    const jwtToken = jwt.sign(
        { type: 'dean', sessionToken },
        JWT_SECRET,
        { expiresIn: '365d' }
    );

    await prisma.deanSession.create({
        data: {
            token: jwtToken,
            deviceInfo: req.headers['user-agent'] || 'Unknown',
            ipAddress: req.ip || null,
            expiresAt,
            isActive: true,
        }
    });

    res.json({ token: jwtToken, expiresAt: expiresAt.toISOString() });
}));

// Dean Session Verification (called on app load to check if session is still valid)
app.post('/api/auth/dean/verify', asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ valid: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'dean') return res.json({ valid: false });

        const session = await prisma.deanSession.findFirst({
            where: { token, isActive: true, expiresAt: { gt: new Date() } }
        });

        if (!session) return res.json({ valid: false });

        // Refresh lastUsed
        await prisma.deanSession.update({ where: { id: session.id }, data: { lastUsed: new Date() } });
        return res.json({ valid: true });
    } catch {
        return res.json({ valid: false });
    }
}));

// Dean Logout
app.post('/api/auth/dean/logout', asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (token) {
        await prisma.deanSession.updateMany({ where: { token }, data: { isActive: false } });
    }
    res.json({ success: true });
}));

// Dean Recovery - Security Question
app.post('/api/auth/dean/recover/question', asyncHandler(async (req, res) => {
    const config = await prisma.deanConfig.findFirst({ where: { id: 'config' } });
    if (!config) return res.status(500).json({ error: 'Not initialized' });
    res.json({ question: config.securityQuestion });
}));

app.post('/api/auth/dean/recover/verify-answer', asyncHandler(async (req, res) => {
    const { answer } = req.body;
    const config = await prisma.deanConfig.findFirst({ where: { id: 'config' } });
    if (!config) return res.status(500).json({ error: 'Not initialized' });

    if (answer?.trim().toLowerCase() === config.securityAnswer.trim().toLowerCase()) {
        // Issue a temporary reset token
        const resetToken = jwt.sign({ type: 'dean-reset' }, JWT_SECRET, { expiresIn: '10m' });
        return res.json({ success: true, resetToken });
    }
    return res.status(401).json({ error: 'Incorrect answer' });
}));

app.post('/api/auth/dean/recover/verify-backup', asyncHandler(async (req, res) => {
    const { backupCode } = req.body;
    const config = await prisma.deanConfig.findFirst({ where: { id: 'config' } });
    if (!config) return res.status(500).json({ error: 'Not initialized' });

    if (backupCode?.trim() === config.backupCode) {
        const resetToken = jwt.sign({ type: 'dean-reset' }, JWT_SECRET, { expiresIn: '10m' });
        return res.json({ success: true, resetToken });
    }
    return res.status(401).json({ error: 'Invalid backup code' });
}));

app.post('/api/auth/dean/recover/reset', asyncHandler(async (req, res) => {
    const { resetToken, newMasterKey } = req.body;
    if (!resetToken || !newMasterKey || newMasterKey.length < 8) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        const decoded = jwt.verify(resetToken, JWT_SECRET) as any;
        if (decoded.type !== 'dean-reset') {
            return res.status(403).json({ error: 'Invalid reset token' });
        }
    } catch {
        return res.status(403).json({ error: 'Reset token expired' });
    }

    const hashed = await bcrypt.hash(newMasterKey, SALT_ROUNDS);
    await prisma.deanConfig.update({
        where: { id: 'config' },
        data: { masterKey: hashed }
    });

    res.json({ success: true });
}));

// ═══════════════════════════════════════════════════════════════════
// ADMIN TOKEN LOGIN (Generated by Dean)
// ═══════════════════════════════════════════════════════════════════

app.post('/api/auth/admin/login', asyncHandler(async (req, res) => {
    const { token: inputToken } = req.body;
    if (!inputToken) return res.status(400).json({ error: 'Token required' });

    const accessKey = await prisma.accessKey.findFirst({
        where: { token: inputToken, isUsed: false, expiresAt: { gt: new Date() } }
    });

    if (!accessKey) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Mark as used
    await prisma.accessKey.update({ where: { id: accessKey.id }, data: { isUsed: true } });

    // Create admin session
    const session = await prisma.adminSession.create({
        data: {
            tokenUsed: accessKey.token,
            role: accessKey.role,
            deviceInfo: req.headers['user-agent'] || 'Unknown',
            ipAddress: req.ip || null,
        }
    });

    const jwtToken = jwt.sign(
        { type: 'admin', sessionId: session.id, role: accessKey.role },
        JWT_SECRET,
        { expiresIn: '30d' }
    );

    res.json({ token: jwtToken, role: accessKey.role, sessionId: session.id });
}));

app.post('/api/auth/admin/verify', asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) return res.json({ valid: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type !== 'admin') return res.json({ valid: false });

        const session = await prisma.adminSession.findFirst({
            where: { id: decoded.sessionId, isActive: true }
        });
        if (!session) return res.json({ valid: false });
        return res.json({ valid: true, role: session.role });
    } catch {
        return res.json({ valid: false });
    }
}));

app.post('/api/auth/admin/logout', asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as any;
            if (decoded.sessionId) {
                await prisma.adminSession.update({
                    where: { id: decoded.sessionId },
                    data: { isActive: false }
                });
            }
        } catch { /* ignore */ }
    }
    res.json({ success: true });
}));

// ═══════════════════════════════════════════════════════════════════
// DEAN-PROTECTED ROUTES (Manage system)
// ═══════════════════════════════════════════════════════════════════

// ─── Access Key Management ──────────────────────────────────────────
app.get('/api/dean/access-keys', verifyDeanToken, asyncHandler(async (_req, res) => {
    const keys = await prisma.accessKey.findMany({ orderBy: { generatedAt: 'desc' } });
    res.json(keys);
}));

app.post('/api/dean/access-keys', verifyDeanToken, asyncHandler(async (req, res) => {
    const { role, expiresInDays = 30 } = req.body;
    const token = `CSA-${role?.replace(/\s+/g, '').toUpperCase().slice(0, 4)}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const key = await prisma.accessKey.create({
        data: { token, role: role || 'Admin', expiresAt }
    });
    res.json(key);
}));

app.delete('/api/dean/access-keys/:id', verifyDeanToken, asyncHandler(async (req, res) => {
    await prisma.accessKey.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

// ─── Session Management (Dean views all sessions) ───────────────────
app.get('/api/dean/sessions', verifyDeanToken, asyncHandler(async (_req, res) => {
    const deanSessions = await prisma.deanSession.findMany({ orderBy: { createdAt: 'desc' } });
    const adminSessions = await prisma.adminSession.findMany({ orderBy: { loginTime: 'desc' } });
    res.json({ deanSessions, adminSessions });
}));

app.post('/api/dean/sessions/revoke', verifyDeanToken, asyncHandler(async (req, res) => {
    const { sessionId, type } = req.body;
    if (type === 'dean') {
        await prisma.deanSession.update({ where: { id: sessionId }, data: { isActive: false } });
    } else {
        await prisma.adminSession.update({ where: { id: sessionId }, data: { isActive: false } });
    }
    res.json({ success: true });
}));

// ─── Dean Config Management ────────────────────────────────────────
app.get('/api/dean/config', verifyDeanToken, asyncHandler(async (_req, res) => {
    const config = await prisma.deanConfig.findFirst({ where: { id: 'config' } });
    if (!config) return res.status(404).json({ error: 'Not initialized' });
    // Don't send the hashed key back
    res.json({
        securityQuestion: config.securityQuestion,
        backupCode: config.backupCode,
        updatedAt: config.updatedAt,
    });
}));

app.put('/api/dean/config', verifyDeanToken, asyncHandler(async (req, res) => {
    const { newMasterKey, securityQuestion, securityAnswer, backupCode } = req.body;

    const updateData: any = {};
    if (newMasterKey && newMasterKey.length >= 8) {
        updateData.masterKey = await bcrypt.hash(newMasterKey, SALT_ROUNDS);
    }
    if (securityQuestion) updateData.securityQuestion = securityQuestion;
    if (securityAnswer) updateData.securityAnswer = securityAnswer;
    if (backupCode) updateData.backupCode = backupCode;

    const config = await prisma.deanConfig.update({
        where: { id: 'config' },
        data: updateData,
    });

    res.json({ success: true, updatedAt: config.updatedAt });
}));

// ═══════════════════════════════════════════════════════════════════
// ADMIN + DEAN PROTECTED ROUTES (Content Management)
// ═══════════════════════════════════════════════════════════════════

// Middleware that accepts either Dean or Admin token
const verifyAnyAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        if (decoded.type === 'dean') {
            const session = await prisma.deanSession.findFirst({
                where: { token, isActive: true, expiresAt: { gt: new Date() } }
            });
            if (session) { (req as any).authUser = { type: 'dean' }; return next(); }
        } else if (decoded.type === 'admin') {
            const session = await prisma.adminSession.findFirst({
                where: { id: decoded.sessionId, isActive: true }
            });
            if (session) { (req as any).authUser = { type: 'admin', role: session.role }; return next(); }
        }
        return res.status(401).json({ error: 'Session invalid' });
    } catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ─── Events CRUD ────────────────────────────────────────────────────
app.post('/api/events', verifyAnyAuth, asyncHandler(async (req, res) => {
    const event = await prisma.event.create({ data: req.body });
    res.json(event);
}));

app.put('/api/events/:id', verifyAnyAuth, asyncHandler(async (req, res) => {
    const event = await prisma.event.update({ where: { id: req.params.id }, data: req.body });
    res.json(event);
}));

app.delete('/api/events/:id', verifyAnyAuth, asyncHandler(async (req, res) => {
    await prisma.event.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

// ─── Members CRUD ───────────────────────────────────────────────────
app.post('/api/members', verifyAnyAuth, asyncHandler(async (req, res) => {
    const member = await prisma.member.create({ data: req.body });
    res.json(member);
}));

app.put('/api/members/:id', verifyAnyAuth, asyncHandler(async (req, res) => {
    const member = await prisma.member.update({ where: { id: req.params.id }, data: req.body });
    res.json(member);
}));

app.delete('/api/members/:id', verifyAnyAuth, asyncHandler(async (req, res) => {
    await prisma.member.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

// ─── News CRUD ──────────────────────────────────────────────────────
app.post('/api/news', verifyAnyAuth, asyncHandler(async (req, res) => {
    const { tags, design, ...rest } = req.body;
    const news = await prisma.news.create({
        data: {
            ...rest,
            tags: JSON.stringify(tags || []),
            design: design ? JSON.stringify(design) : null,
        }
    });
    res.json(news);
}));

app.put('/api/news/:id', verifyAnyAuth, asyncHandler(async (req, res) => {
    const { tags, design, ...rest } = req.body;
    const data: any = { ...rest };
    if (tags !== undefined) data.tags = JSON.stringify(tags);
    if (design !== undefined) data.design = design ? JSON.stringify(design) : null;
    const news = await prisma.news.update({ where: { id: req.params.id }, data });
    res.json(news);
}));

app.delete('/api/news/:id', verifyAnyAuth, asyncHandler(async (req, res) => {
    await prisma.news.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

// ─── Timeline CRUD ──────────────────────────────────────────────────
app.post('/api/timeline', verifyAnyAuth, asyncHandler(async (req, res) => {
    const item = await prisma.timelineItem.create({ data: req.body });
    res.json(item);
}));

app.put('/api/timeline/:id', verifyAnyAuth, asyncHandler(async (req, res) => {
    const item = await prisma.timelineItem.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
}));

app.delete('/api/timeline/:id', verifyAnyAuth, asyncHandler(async (req, res) => {
    await prisma.timelineItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

// ─── Settings ───────────────────────────────────────────────────────
app.put('/api/settings', verifyAnyAuth, asyncHandler(async (req, res) => {
    const settings = await prisma.appSetting.upsert({
        where: { id: 'main' },
        update: req.body,
        create: { id: 'main', ...req.body },
    });
    res.json(settings);
}));

// ═══════════════════════════════════════════════════════════════════
// DEAN MANAGEMENT (requires Dean auth)
// ═══════════════════════════════════════════════════════════════════

// ─── Access Keys CRUD ───────────────────────────────────────────────
app.get('/api/dean/access-keys', verifyDeanToken, asyncHandler(async (_req, res) => {
    const keys = await prisma.accessKey.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(keys);
}));

app.post('/api/dean/access-keys', verifyDeanToken, asyncHandler(async (req, res) => {
    const { role, expiresInDays = 1 } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required' });

    // Generate secure token: CSA-[ROLE_PREFIX]-[32 random chars]
    const prefix = role.replace(/\s+/g, '').substring(0, 3).toUpperCase();
    const random = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    const token = `CSA-${prefix}-${random}`;

    const key = await prisma.accessKey.create({
        data: {
            token,
            role,
            isUsed: false,
            expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
            generatedBy: 'Dean',
        }
    });
    res.json(key);
}));

app.delete('/api/dean/access-keys/:id', verifyDeanToken, asyncHandler(async (req, res) => {
    await prisma.accessKey.delete({ where: { id: req.params.id } });
    res.json({ success: true });
}));

// ─── Sessions Management ────────────────────────────────────────────
app.get('/api/dean/sessions', verifyDeanToken, asyncHandler(async (_req, res) => {
    const deanSessions = await prisma.deanSession.findMany({ orderBy: { createdAt: 'desc' } });
    const adminSessions = await prisma.adminSession.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ deanSessions, adminSessions });
}));

app.post('/api/dean/sessions/revoke', verifyDeanToken, asyncHandler(async (req, res) => {
    const { sessionId, type } = req.body;
    if (type === 'dean') {
        await prisma.deanSession.update({ where: { id: sessionId }, data: { isActive: false } });
    } else if (type === 'admin') {
        await prisma.adminSession.update({ where: { id: sessionId }, data: { isActive: false } });
    }
    res.json({ success: true });
}));

// ─── Dean Config ────────────────────────────────────────────────────
app.get('/api/dean/config', verifyDeanToken, asyncHandler(async (_req, res) => {
    const config = await prisma.deanConfig.findFirst({ where: { id: 'config' } });
    if (!config) return res.status(404).json({ error: 'Config not found' });
    // Don't expose hashed key — send metadata only
    res.json({
        securityQuestion: config.securityQuestion,
        backupCode: config.backupCode,
        lastChanged: config.updatedAt,
    });
}));

app.put('/api/dean/config', verifyDeanToken, asyncHandler(async (req, res) => {
    const { newMasterKey, securityQuestion, securityAnswer, backupCode } = req.body;
    const updateData: any = {};

    if (newMasterKey) {
        updateData.masterKey = await bcrypt.hash(newMasterKey, 10);
    }
    if (securityQuestion) updateData.securityQuestion = securityQuestion;
    if (securityAnswer) updateData.securityAnswer = securityAnswer;
    if (backupCode) updateData.backupCode = backupCode;

    const config = await prisma.deanConfig.update({
        where: { id: 'config' },
        data: updateData,
    });
    res.json({ success: true, lastChanged: config.updatedAt });
}));

// ═══════════════════════════════════════════════════════════════════
// FILE UPLOAD ENDPOINT
// ═══════════════════════════════════════════════════════════════════

app.post('/api/upload', verifyAnyAuth, upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }
    // Build public URL
    const protocol = req.protocol;
    const host = req.get('host') || 'localhost:3001';
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({
        url,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
    });
});

// Delete uploaded file
app.delete('/api/upload/:filename', verifyAnyAuth, asyncHandler(async (req, res) => {
    const filePath = path.join(uploadsDir, String(req.params.filename));
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
    res.json({ success: true });
}));

// ═══════════════════════════════════════════════════════════════════
// SERVE FRONTEND (PRODUCTION)
// ═══════════════════════════════════════════════════════════════════

// API 404 Handler (Keep API errors as JSON)
app.use('/api/{*path}', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Serve Static Frontend
const distPath = path.resolve(__dirname, '../../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('{*path}', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// ═══════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// ═══════════════════════════════════════════════════════════════════

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server Error:', err.message || err);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

// ═══════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`🚀 CSA API Server running on http://localhost:${PORT}`);
});
