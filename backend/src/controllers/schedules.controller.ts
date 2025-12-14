/**
 * Controller de gestion des rapports planifiés
 * 
 * Ce controller gère toutes les opérations sur les schedules :
 * - Création de planifications
 * - Récupération des planifications (liste et détails)
 * - Modification de planifications
 * - Suppression de planifications
 * - Activation/Désactivation
 * - Exécution manuelle
 * 
 * @module controllers/schedules
 */

import { Response } from 'express';
import prisma from '../db';
import { NotFoundError, ValidationError } from '../middlewares/error.middleware';
import schedulerService from '../services/scheduler.service';
import { AuthenticatedRequest } from '../types';
import { ScheduleDto, UpdateScheduleDto } from '../types/template.types';
import logger, { logDatabase } from '../utils/logger';

/**
 * Récupère la liste des schedules de l'utilisateur
 * 
 * @route GET /api/schedules
 * @access Private
 */
export const getSchedules = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const userId = req.user.userId;
    logger.info('📋 Fetching schedules', { userId });

    const schedules = await prisma.scheduledReport.findMany({
      where: { userId },
      include: {
        reportTemplate: true
      }
      orderBy: { createdAt: 'desc' }
    });

    logDatabase('READ', 'ScheduledReport', { userId, count: schedules.length });
    logger.info('✅ Schedules fetched successfully', { count: schedules.length });

    res.json({
      success: true,
      data: schedules,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching schedules', { error });
    throw error;
  }
};

/**
 * Récupère un schedule par son ID
 * 
 * @route GET /api/schedules/:id
 * @access Private
 */
export const getSchedule = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.info('🔍 Fetching schedule', { scheduleId: id, userId });

    const schedule = await prisma.scheduledReport.findFirst({
      where: { id, userId },
      include: {
        reportTemplate: true
      }
    });

    if (!schedule) {
      throw new NotFoundError('Schedule non trouvé');
    }

    logDatabase('READ', 'ScheduledReport', { scheduleId: id, userId });
    logger.info('✅ Schedule fetched successfully', { scheduleId: id });

    res.json({
      success: true,
      data: schedule,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching schedule', { error });
    throw error;
  }
};

/**
 * Crée un nouveau schedule
 * 
 * @route POST /api/schedules
 * @access Private
 */
export const createSchedule = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const userId = req.user.userId;
    const { templateId, repoName, cronExpression, method, recipient }: ScheduleDto = req.body;

    logger.info('➕ Creating schedule', { userId, repoName, cronExpression });

    // Validation
    if (!repoName || !cronExpression || !method || !recipient) {
      throw new ValidationError('Tous les champs sont requis');
    }

    // Vérifier la limite de schedules (max 10 par utilisateur)
    const count = await prisma.scheduledReport.count({
      where: { userId, isActive: true }
    });

    if (count >= 10) {
      throw new ValidationError('Limite de 10 schedules actifs atteinte');
    }

    // Calculer la prochaine exécution
    const nextRun = schedulerService.getNextRun(cronExpression);

    // Créer le schedule
    const schedule = await prisma.scheduledReport.create({
      data: {
        userId,
        templateId,
        repoName,
        cronExpression,
        method,
        recipient,
        nextRun,
        isActive: true
      },
      include: {
        reportTemplate: true
      }
    });

    // Ajouter au scheduler
    await schedulerService.addJob(schedule);

    logDatabase('CREATE', 'ScheduledReport', { scheduleId: schedule.id, userId });
    logger.info('✅ Schedule created successfully', { 
      scheduleId: schedule.id, 
      nextRun: nextRun.toISOString() 
    });

    res.status(201).json({
      success: true,
      data: schedule,
      message: 'Schedule créé avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error creating schedule', { error });
    throw error;
  }
};

/**
 * Met à jour un schedule
 * 
 * @route PUT /api/schedules/:id
 * @access Private
 */
export const updateSchedule = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const updateData: UpdateScheduleDto = req.body;

    logger.info('🔄 Updating schedule', { scheduleId: id, userId });

    // Vérifier que le schedule existe et appartient à l'utilisateur
    const existing = await prisma.scheduledReport.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new NotFoundError('Schedule non trouvé ou non autorisé');
    }

    // Calculer la nouvelle nextRun si cron expression change
    let nextRun = existing.nextRun;
    if (updateData.cronExpression && updateData.cronExpression !== existing.cronExpression) {
      nextRun = schedulerService.getNextRun(updateData.cronExpression);
    }

    // Mettre à jour
    const schedule = await prisma.scheduledReport.update({
      where: { id },
      data: {
        ...updateData,
        nextRun
      },
      include: {
        reportTemplate: true
      }
    });

    // Mettre à jour dans le scheduler
    await schedulerService.updateJob(schedule);

    logDatabase('UPDATE', 'ScheduledReport', { scheduleId: id, userId });
    logger.info('✅ Schedule updated successfully', { scheduleId: id });

    res.json({
      success: true,
      data: schedule,
      message: 'Schedule mis à jour avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error updating schedule', { error });
    throw error;
  }
};

/**
 * Supprime un schedule
 * 
 * @route DELETE /api/schedules/:id
 * @access Private
 */
export const deleteSchedule = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.info('🗑️ Deleting schedule', { scheduleId: id, userId });

    // Vérifier que le schedule existe et appartient à l'utilisateur
    const existing = await prisma.scheduledReport.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new NotFoundError('Schedule non trouvé ou non autorisé');
    }

    // Supprimer du scheduler
    schedulerService.removeJob(id);

    // Supprimer de la base de données
    await prisma.scheduledReport.delete({
      where: { id }
    });

    logDatabase('DELETE', 'ScheduledReport', { scheduleId: id, userId });
    logger.info('✅ Schedule deleted successfully', { scheduleId: id });

    res.json({
      success: true,
      message: 'Schedule supprimé avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error deleting schedule', { error });
    throw error;
  }
};

/**
 * Active/Désactive un schedule
 * 
 * @route POST /api/schedules/:id/toggle
 * @access Private
 */
export const toggleSchedule = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.info('🔄 Toggling schedule', { scheduleId: id, userId });

    // Récupérer le schedule
    const existing = await prisma.scheduledReport.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new NotFoundError('Schedule non trouvé ou non autorisé');
    }

    const newStatus = !existing.isActive;

    // Mettre à jour
    const schedule = await prisma.scheduledReport.update({
      where: { id },
      data: { isActive: newStatus },
      include: {
        reportTemplate: true
      }
    });

    // Mettre à jour dans le scheduler
    if (newStatus) {
      await schedulerService.addJob(schedule);
    } else {
      schedulerService.removeJob(id);
    }

    logDatabase('UPDATE', 'ScheduledReport', { scheduleId: id, userId, isActive: newStatus });
    logger.info('✅ Schedule toggled successfully', { scheduleId: id, isActive: newStatus });

    res.json({
      success: true,
      data: schedule,
      message: `Schedule ${newStatus ? 'activé' : 'désactivé'} avec succès`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error toggling schedule', { error });
    throw error;
  }
};

/**
 * Exécute un schedule manuellement
 * 
 * @route POST /api/schedules/:id/run
 * @access Private
 */
export const runSchedule = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.info('▶️ Running schedule manually', { scheduleId: id, userId });

    // Vérifier que le schedule existe et appartient à l'utilisateur
    const existing = await prisma.scheduledReport.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new NotFoundError('Schedule non trouvé ou non autorisé');
    }

    // Exécuter le job
    await schedulerService.runJob(id);

    logger.info('✅ Schedule executed successfully', { scheduleId: id });

    res.json({
      success: true,
      message: 'Schedule exécuté avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error running schedule', { error });
    throw error;
  }
};

/**
 * Récupère le statut du scheduler
 * 
 * @route GET /api/schedules/status
 * @access Private
 */
export const getSchedulerStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    logger.info('📊 Fetching scheduler status');

    const status = schedulerService.getStatus();

    logger.info('✅ Scheduler status fetched', status);

    res.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching scheduler status', { error });
    throw error;
  }
};
