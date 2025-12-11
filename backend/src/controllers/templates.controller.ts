/**
 * Controller de gestion des templates de rapports
 * 
 * Ce controller gère toutes les opérations CRUD sur les templates :
 * - Création de templates
 * - Récupération des templates (liste et détails)
 * - Modification de templates
 * - Suppression de templates
 * - Prévisualisation de templates
 * 
 * @module controllers/templates
 */

import { Response } from 'express';
import prisma from '../db';
import { NotFoundError, ValidationError } from '../middlewares/error.middleware';
import templateService from '../services/template.service';
import { AuthenticatedRequest } from '../types';
import { CreateTemplateDto, UpdateTemplateDto, TemplateRenderData } from '../types/template.types';
import logger, { logDatabase } from '../utils/logger';

/**
 * Récupère la liste des templates de l'utilisateur
 * 
 * @route GET /api/templates
 * @access Private
 */
export const getTemplates = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const userId = req.user.userId;
    logger.info('📋 Fetching templates', { userId });

    const templates = await prisma.reportTemplate.findMany({
      where: {
        OR: [
          { userId },
          { isDefault: true }
        ]
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    logDatabase('READ', 'ReportTemplate', { userId, count: templates.length });
    logger.info('✅ Templates fetched successfully', { count: templates.length });

    res.json({
      success: true,
      data: templates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching templates', { error });
    throw error;
  }
};

/**
 * Récupère un template par son ID
 * 
 * @route GET /api/templates/:id
 * @access Private
 */
export const getTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.info('🔍 Fetching template', { templateId: id, userId });

    const template = await prisma.reportTemplate.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { isDefault: true }
        ]
      }
    });

    if (!template) {
      throw new NotFoundError('Template non trouvé');
    }

    logDatabase('READ', 'ReportTemplate', { templateId: id, userId });
    logger.info('✅ Template fetched successfully', { templateId: id });

    res.json({
      success: true,
      data: template,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching template', { error });
    throw error;
  }
};

/**
 * Crée un nouveau template
 * 
 * @route POST /api/templates
 * @access Private
 */
export const createTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const userId = req.user.userId;
    const { name, description, content, variables = [] }: CreateTemplateDto = req.body;

    logger.info('➕ Creating template', { userId, name });

    // Validation
    if (!name || !content) {
      throw new ValidationError('Le nom et le contenu sont requis');
    }

    // Valider le template
    if (!templateService.validateTemplate(content, variables)) {
      throw new ValidationError('Template invalide');
    }

    // Créer le template
    const template = await prisma.reportTemplate.create({
      data: {
        userId,
        name,
        description,
        content,
        variables: variables as any,
        isDefault: false
      }
    });

    logDatabase('CREATE', 'ReportTemplate', { templateId: template.id, userId });
    logger.info('✅ Template created successfully', { templateId: template.id, name });

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template créé avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error creating template', { error });
    throw error;
  }
};

/**
 * Met à jour un template
 * 
 * @route PUT /api/templates/:id
 * @access Private
 */
export const updateTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const updateData: UpdateTemplateDto = req.body;

    logger.info('🔄 Updating template', { templateId: id, userId });

    // Vérifier que le template existe et appartient à l'utilisateur
    const existing = await prisma.reportTemplate.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new NotFoundError('Template non trouvé ou non autorisé');
    }

    if (existing.isDefault) {
      throw new ValidationError('Impossible de modifier un template par défaut');
    }

    // Valider le nouveau contenu si fourni
    if (updateData.content) {
      const variables = updateData.variables || existing.variables as any;
      if (!templateService.validateTemplate(updateData.content, variables)) {
        throw new ValidationError('Template invalide');
      }
    }

    // Mettre à jour
    const template = await prisma.reportTemplate.update({
      where: { id },
      data: {
        ...updateData,
        variables: updateData.variables as any
      }
    });

    logDatabase('UPDATE', 'ReportTemplate', { templateId: id, userId });
    logger.info('✅ Template updated successfully', { templateId: id });

    res.json({
      success: true,
      data: template,
      message: 'Template mis à jour avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error updating template', { error });
    throw error;
  }
};

/**
 * Supprime un template
 * 
 * @route DELETE /api/templates/:id
 * @access Private
 */
export const deleteTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.info('🗑️ Deleting template', { templateId: id, userId });

    // Vérifier que le template existe et appartient à l'utilisateur
    const existing = await prisma.reportTemplate.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      throw new NotFoundError('Template non trouvé ou non autorisé');
    }

    if (existing.isDefault) {
      throw new ValidationError('Impossible de supprimer un template par défaut');
    }

    // Supprimer
    await prisma.reportTemplate.delete({
      where: { id }
    });

    logDatabase('DELETE', 'ReportTemplate', { templateId: id, userId });
    logger.info('✅ Template deleted successfully', { templateId: id });

    res.json({
      success: true,
      message: 'Template supprimé avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error deleting template', { error });
    throw error;
  }
};

/**
 * Prévisualise un template avec des données
 * 
 * @route POST /api/templates/:id/preview
 * @access Private
 */
export const previewTemplate = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const data: TemplateRenderData = req.body;

    logger.info('👁️ Previewing template', { templateId: id, userId });

    // Récupérer le template
    const template = await prisma.reportTemplate.findFirst({
      where: {
        id,
        OR: [
          { userId },
          { isDefault: true }
        ]
      }
    });

    if (!template) {
      throw new NotFoundError('Template non trouvé');
    }

    // Rendre le template
    const rendered = templateService.renderTemplate(template.content, data);

    logger.info('✅ Template preview generated', { templateId: id });

    res.json({
      success: true,
      data: {
        rendered,
        template: template.content
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error previewing template', { error });
    throw error;
  }
};

/**
 * Initialise les templates par défaut pour un utilisateur
 * 
 * @route POST /api/templates/init-defaults
 * @access Private
 */
export const initDefaultTemplates = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError('Utilisateur non authentifié');
    }

    const userId = req.user.userId;
    logger.info('🎨 Initializing default templates', { userId });

    // Vérifier si les templates par défaut existent déjà
    const existingDefaults = await prisma.reportTemplate.count({
      where: { isDefault: true }
    });

    if (existingDefaults > 0) {
      logger.info('ℹ️ Default templates already exist', { count: existingDefaults });
      res.json({
        success: true,
        message: 'Templates par défaut déjà initialisés',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Créer les templates par défaut
    const defaultTemplates = templateService.getDefaultTemplates();
    const created = await Promise.all(
      defaultTemplates.map(template =>
        prisma.reportTemplate.create({
          data: {
            userId,
            name: template.name,
            description: template.description,
            content: template.content,
            variables: template.variables as any,
            isDefault: true
          }
        })
      )
    );

    logDatabase('CREATE', 'ReportTemplate', { userId, count: created.length, type: 'defaults' });
    logger.info('✅ Default templates initialized', { count: created.length });

    res.status(201).json({
      success: true,
      data: created,
      message: `${created.length} templates par défaut créés`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error initializing default templates', { error });
    throw error;
  }
};
