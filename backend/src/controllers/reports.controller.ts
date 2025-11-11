/**
 * Controller de gestion des rapports
 *
 * Ce controller gère toutes les opérations CRUD sur les rapports :
 * - Création et envoi de rapports
 * - Récupération des rapports (liste et détails)
 * - Suppression de rapports
 * - Statistiques utilisateur
 *
 * @module controllers/reports
 */

import { Response } from "express";
import prisma from "../db";
import {
    NotFoundError,
    ValidationError,
} from "../middlewares/error.middleware";
import emailService from "../services/email.service";
import whatsappService from "../services/whatsapp.service";
import {
    AuthenticatedRequest,
    ReportMethod,
    isValidReportMethod
} from "../types";
import logger, { logDatabase } from "../utils/logger";

/**
 * Récupère la liste des rapports de l'utilisateur connecté
 *
 * Supporte la pagination et les filtres.
 *
 * @route GET /api/reports
 * @access Private
 *
 * @queryparam {number} page - Numéro de page (défaut: 1)
 * @queryparam {number} limit - Nombre d'éléments par page (défaut: 10)
 * @queryparam {string} repoName - Filtrer par nom de dépôt
 * @queryparam {string} method - Filtrer par méthode (email/whatsapp)
 */
export const getReports = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("Utilisateur non authentifié");
    }

    const userId = req.user.userId;

    // Paramètres de pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Paramètres de filtrage
    const repoName = req.query.repoName as string;
    const method = req.query.method as string;

    logger.debug("Fetching reports", {
      userId,
      page,
      limit,
      repoName,
      method,
    });

    // Construction des filtres
    const where: any = { userId };

    if (repoName) {
      where.repoName = { contains: repoName, mode: "insensitive" };
    }

    if (method && isValidReportMethod(method)) {
      where.method = method;
    }

    // Récupération des rapports avec pagination
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    logDatabase("READ", "Report", { count: reports.length, userId });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to fetch reports", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
    });

    throw error;
  }
};

/**
 * Récupère les détails d'un rapport spécifique
 *
 * @route GET /api/reports/:id
 * @access Private
 */
export const getReport = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("Utilisateur non authentifié");
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.debug("Fetching report details", { reportId: id, userId });

    const report = await prisma.report.findFirst({
      where: {
        id,
        userId, // S'assurer que le rapport appartient à l'utilisateur
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundError("Rapport");
    }

    logDatabase("READ", "Report", { reportId: id, userId });

    res.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to fetch report", {
      error: error instanceof Error ? error.message : "Unknown error",
      reportId: req.params.id,
      userId: req.user?.userId,
    });

    throw error;
  }
};

/**
 * Crée et envoie un nouveau rapport
 *
 * @route POST /api/reports
 * @access Private
 *
 * @body {string} repoName - Nom du dépôt
 * @body {string} content - Contenu du rapport
 * @body {string} method - Méthode d'envoi (email ou whatsapp)
 * @body {string} sentTo - Destinataire (email ou numéro WhatsApp)
 */
export const createReport = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("Utilisateur non authentifié");
    }

    const userId = req.user.userId;
    const { repoName, content, method, sentTo } = req.body;

    // Validation des données
    if (!repoName || typeof repoName !== "string") {
      throw new ValidationError("Le nom du dépôt est requis");
    }

    if (!content || typeof content !== "string") {
      throw new ValidationError("Le contenu du rapport est requis");
    }

    if (!method || !isValidReportMethod(method)) {
      throw new ValidationError(
        "La méthode d'envoi doit être 'email' ou 'whatsapp'",
      );
    }

    if (!sentTo || typeof sentTo !== "string") {
      throw new ValidationError("Le destinataire est requis");
    }

    logger.info("Creating new report", {
      userId,
      repoName,
      method,
      sentTo,
    });

    // Créer le rapport dans la base de données
    const report = await prisma.report.create({
      data: {
        userId,
        repoName,
        content,
        method,
        sentTo,
      },
      include: {
        user: true,
      },
    });

    logDatabase("CREATE", "Report", { reportId: report.id, userId });

    // Envoyer le rapport selon la méthode choisie
    let sendSuccess = false;

    try {
      if (method === ReportMethod.EMAIL) {
        await emailService.sendReport({
          to: sentTo,
          reportContent: content,
          repoName,
          reportId: report.id,
        });
        sendSuccess = true;
        logger.info("Report sent successfully via email", {
          reportId: report.id,
          to: sentTo,
        });
      } else if (method === ReportMethod.WHATSAPP) {
        if (!whatsappService.isAvailable()) {
          throw new ValidationError(
            "Le service WhatsApp n'est pas configuré",
          );
        }

        await whatsappService.sendReport({
          to: sentTo,
          reportContent: content,
          repoName,
          reportId: report.id,
        });
        sendSuccess = true;
        logger.info("Report sent successfully via WhatsApp", {
          reportId: report.id,
          to: sentTo,
        });
      }
    } catch (sendError) {
      logger.error("Failed to send report", {
        error: sendError instanceof Error ? sendError.message : "Unknown error",
        reportId: report.id,
        method,
      });

      // Le rapport est créé mais l'envoi a échoué
      res.status(500).json({
        success: false,
        error: {
          message: `Le rapport a été créé mais l'envoi a échoué: ${
            sendError instanceof Error ? sendError.message : "Erreur inconnue"
          }`,
          code: "SEND_FAILED",
          reportId: report.id,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: report,
      message: `Rapport créé et envoyé avec succès via ${method}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to create report", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
    });

    throw error;
  }
};

/**
 * Supprime un rapport
 *
 * @route DELETE /api/reports/:id
 * @access Private
 */
export const deleteReport = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("Utilisateur non authentifié");
    }

    const { id } = req.params;
    const userId = req.user.userId;

    logger.info("Deleting report", { reportId: id, userId });

    // Vérifier que le rapport existe et appartient à l'utilisateur
    const report = await prisma.report.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!report) {
      throw new NotFoundError("Rapport");
    }

    // Supprimer le rapport
    await prisma.report.delete({
      where: { id },
    });

    logDatabase("DELETE", "Report", { reportId: id, userId });

    res.json({
      success: true,
      message: "Rapport supprimé avec succès",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to delete report", {
      error: error instanceof Error ? error.message : "Unknown error",
      reportId: req.params.id,
      userId: req.user?.userId,
    });

    throw error;
  }
};

/**
 * Récupère les statistiques des rapports de l'utilisateur
 *
 * @route GET /api/reports/stats
 * @access Private
 */
export const getUserStats = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("Utilisateur non authentifié");
    }

    const userId = req.user.userId;

    logger.debug("Fetching user statistics", { userId });

    // Statistiques globales
    const [totalReports, reportsByMethod, recentReports, repoStats] =
      await Promise.all([
        // Total des rapports
        prisma.report.count({ where: { userId } }),

        // Rapports par méthode
        prisma.report.groupBy({
          by: ["method"],
          where: { userId },
          _count: { method: true },
        }),

        // 5 derniers rapports
        prisma.report.findMany({
          where: { userId },
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            repoName: true,
            method: true,
            sentTo: true,
            createdAt: true,
          },
        }),

        // Dépôts les plus utilisés
        prisma.report.groupBy({
          by: ["repoName"],
          where: { userId },
          _count: { repoName: true },
          orderBy: { _count: { repoName: "desc" } },
          take: 5,
        }),
      ]);

    // Formater les statistiques par méthode
    const methodStats = {
      email: 0,
      whatsapp: 0,
    };

    reportsByMethod.forEach((stat) => {
      if (stat.method === "email") {
        methodStats.email = stat._count.method;
      } else if (stat.method === "whatsapp") {
        methodStats.whatsapp = stat._count.method;
      }
    });

    const mostUsedRepo = repoStats.length > 0 ? repoStats[0].repoName : null;

    const stats = {
      totalReports,
      reportsByMethod: methodStats,
      recentReports,
      mostUsedRepo,
      topRepositories: repoStats.map((stat) => ({
        repoName: stat.repoName,
        count: stat._count.repoName,
      })),
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to fetch user statistics", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
    });

    throw error;
  }
};
