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
    ForbiddenError,
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
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const author = req.query.author as string;
    const type = req.query.type as string;
    const teamId = req.query.teamId as string;

    logger.debug("Fetching reports", {
      userId,
      page,
      limit,
      repoName,
      method,
      startDate,
      endDate,
      author,
      type,
      teamId
    });

    // Construction des filtres
    const where: any = {};

    if (teamId) {
      // Vérifier l'appartenance à l'équipe
      const isMember = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId, teamId } }
      });
      if (!isMember) {
        throw new ForbiddenError("Accès non autorisé aux rapports de cette équipe");
      }
      where.teamId = teamId;
    } else {
      // Par défaut : mes rapports personnels
      where.userId = userId;
      where.teamId = null; // Exclure les rapports d'équipe dans la vue perso ? Ou inclure ?
      // Pour l'instant, séparons clairement : vue perso = mes rapports hors équipe (ou tous mes rapports ?)
      // Si on veut voir "Mes rapports" (y compris ceux faits dans une équipe), on enlève teamId: null.
      // Mais généralement on veut filtrer par contexte. Gardons simple : userId match le créateur.
    }

    if (repoName) {
      where.repoNames = { has: repoName };
    }

    if (method && isValidReportMethod(method)) {
      where.method = method;
    }

    // Filtre par date
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Fin de la journée pour endDate
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    // Filtre par contenu (pseudo type de commit)
    if (type) {
      where.content = { contains: type, mode: "insensitive" };
    }
    
    if (author) {
       where.user = {
         name: { contains: author, mode: "insensitive" }
       };
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

    const formattedReports = reports.map((report: any) => ({
      ...report,
      repoName: report.repoNames.join(', '),
    }));

    logDatabase("READ", "Report", { count: reports.length, userId });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        data: formattedReports,
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

    const formattedReport = {
      ...report,
      repoName: report.repoNames.join(', ')
    };

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
    // Accept repoName for backward compatibility, or repoNames for multi-repo
    const { repoName, repoNames, content, method, sentTo, teamId } = req.body;

    // Validation équipe
    if (teamId) {
      const isMember = await prisma.teamMember.findUnique({
        where: { userId_teamId: { userId, teamId } }
      });
      if (!isMember) {
        throw new ForbiddenError("Vous n'êtes pas membre de cette équipe");
      }
    }

    const finalRepoNames = repoNames || (repoName ? [repoName] : []);

    // Validation des données
    if (!finalRepoNames || !Array.isArray(finalRepoNames) || finalRepoNames.length === 0) {
      throw new ValidationError("Au moins un dépôt est requis");
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
      repoNames: finalRepoNames,
      method,
      sentTo,
    });

    // Créer le rapport dans la base de données
    const report = await prisma.report.create({
      data: {
        userId,
        repoNames: finalRepoNames,
        content,
        method,
        sentTo,
        teamId, // Optional
      },
      include: {
        user: true,
      },
    });

    logDatabase("CREATE", "Report", { reportId: report.id, userId });

    // Exécution ASYNCHRONE (Fire-and-forget) pour ne pas bloquer le client
    // On n'attend pas la fin de l'envoi pour répondre au frontend
    (async () => {
      try {
        if (method === ReportMethod.EMAIL) {
          await emailService.sendReport({
            to: sentTo,
            reportContent: content,
            repoName: finalRepoNames.join(', '),
            reportId: report.id,
          });
          logger.info("Report sent successfully via email (Async)", { reportId: report.id });
        } else if (method === ReportMethod.WHATSAPP) {
          if (!whatsappService.isAvailable()) {
             logger.warn("WhatsApp service not available for report", { reportId: report.id });
             return;
          }
          await whatsappService.sendReport({
            to: sentTo,
            reportContent: content,
            repoName: finalRepoNames.join(', '),
            reportId: report.id,
          });
          logger.info("Report sent successfully via WhatsApp (Async)", { reportId: report.id });
        }
      } catch (sendError) {
        // Log l'erreur mais ne crash pas, car la réponse est déjà partie
        logger.error("Async send failed", {
          error: sendError instanceof Error ? sendError.message : "Unknown error",
          reportId: report.id
        });
        // TODO: Mettre à jour le statut du rapport en 'FAILED' dans la DB si on avait un champ status
      }
    })();

    res.status(201).json({
      success: true,
      data: { ...report, repoName: report.repoNames.join(', ') },
      message: `Rapport créé ! L'envoi est en cours de traitement...`, // Message mis à jour
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

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    // Statistiques globales
    const [
      totalReports,
      reportsByMethod,
      recentReports,
      repoStats,
      dailyReports,
      calendarReports
    ] =
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
            repoNames: true,
            method: true,
            sentTo: true,
            createdAt: true,
          },
        }),

        // Dépôts les plus utilisés (Combinaisons)
        prisma.report.groupBy({
          by: ["repoNames"],
          where: { userId },
          _count: { repoNames: true },
          orderBy: { _count: { repoNames: "desc" } },
          take: 5,
        }),

        // Rapports par jour (30 derniers jours) pour le graph linéaire
        prisma.report.groupBy({
          by: ["createdAt"],
          where: {
            userId,
            createdAt: {
              gte: thirtyDaysAgo
            }
          },
          _count: { id: true },
        }),

        // Rapports pour le calendrier (1 an)
        prisma.report.groupBy({
          by: ["createdAt"],
          where: {
            userId,
            createdAt: {
              gte: oneYearAgo
            }
          },
          _count: { id: true },
        })
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

    const mostUsedRepo = repoStats.length > 0 ? repoStats[0].repoNames.join(', ') : null;

    // Helper pour grouper par date (YYYY-MM-DD)
    const groupByDay = (data: any[]) => {
      const map = new Map<string, number>();
      data.forEach(item => {
        const date = new Date(item.createdAt).toISOString().split('T')[0];
        map.set(date, (map.get(date) || 0) + item._count.id);
      });
      return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
    };

    const stats = {
      totalReports,
      reportsByMethod: methodStats,
      recentReports: recentReports.map((r: any) => ({ ...r, repoName: r.repoNames.join(', ') })), // Map to preserve frontend contract
      mostUsedRepo,
      topRepositories: repoStats.map((stat: any) => ({
        repoName: stat.repoNames.join(', '),
        count: stat._count.repoNames,
      })),
      dailyStats: groupByDay(dailyReports).sort((a, b) => a.date.localeCompare(b.date)),
      calendarStats: groupByDay(calendarReports),
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
