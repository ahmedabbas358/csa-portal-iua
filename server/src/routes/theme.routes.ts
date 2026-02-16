import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET USER THEME
router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // @ts-ignore
        const userId = req.user.id;

        const settings = await prisma.themeSettings.findUnique({ where: { userId } });
        res.json(settings || {});
    } catch (e) {
        next(e);
    }
});

// UPDATE USER THEME
router.put('/', authenticate, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { primaryColor, secondaryColor, pattern, borderRadius, animationSpeed, fontStyle, iconStyle } = req.body;

        const settings = await prisma.themeSettings.upsert({
            where: { userId },
            update: {
                primaryColor, secondaryColor, pattern, borderRadius, animationSpeed, fontStyle, iconStyle
            },
            create: {
                userId, primaryColor, secondaryColor, pattern, borderRadius, animationSpeed, fontStyle, iconStyle
            }
        });

        res.json(settings);
    } catch (e) {
        next(e);
    }
});

export default router;
