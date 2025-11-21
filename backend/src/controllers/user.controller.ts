import { Response } from 'express';
import prisma from '../db';
import { ValidationError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../types';
import logger, { logDatabase } from '../utils/logger';

/**
 * Met à jour les paramètres de l'utilisateur
 *
 * @route PUT /api/user/settings
 * @access Private
 */
export const updateSettings = async (
    req: AuthenticatedRequest,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            throw new ValidationError('Utilisateur non authentifié');
        }

        const userId = req.user.userId;
        console.log('PUT /api/user/settings body:', JSON.stringify(req.body, null, 2));
        const { visibleRepos, settings } = req.body;

        if (visibleRepos && !Array.isArray(visibleRepos)) {
            const receivedType = typeof visibleRepos;
            const receivedValue = JSON.stringify(visibleRepos);
            throw new ValidationError(`visibleRepos doit être un tableau de chaînes. Reçu: ${receivedType} - ${receivedValue}. Body keys: ${Object.keys(req.body).join(',')}`);
        }

        logger.info('Updating user settings', { userId, visibleReposCount: visibleRepos?.length, hasSettings: !!settings });

        const updateData: any = {};
        if (visibleRepos) updateData.visibleRepos = visibleRepos;
        if (settings) updateData.settings = settings;

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                visibleRepos: true,
                settings: true,
            },
        });

        logDatabase('UPDATE', 'User', { userId });

        res.json({
            success: true,
            data: user,
            message: 'Paramètres mis à jour avec succès',
        });
    } catch (error) {
        logger.error('Failed to update user settings', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: req.user?.userId,
        });
        throw error;
    }
};
