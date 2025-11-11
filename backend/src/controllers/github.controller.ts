/**
 * Controller GitHub pour la gestion des dépôts et commits
 *
 * Ce controller gère les opérations liées à GitHub :
 * - Récupération des dépôts de l'utilisateur
 * - Récupération des commits d'un dépôt
 * - Formatage des données pour le frontend
 *
 * @module controllers/github
 */

import { Response } from "express";
import prisma from "../db";
import { ValidationError } from "../middlewares/error.middleware";
import { GitHubService } from "../services/github.service";
import { AuthenticatedRequest } from "../types";
import logger from "../utils/logger";

/**
 * Récupère la liste des dépôts de l'utilisateur authentifié
 *
 * @route GET /api/github/repos
 * @access Private
 *
 * @queryparam {number} page - Numéro de page (défaut: 1)
 * @queryparam {number} perPage - Nombre de dépôts par page (défaut: 30)
 * @queryparam {string} sort - Tri (created, updated, pushed, full_name)
 * @queryparam {string} direction - Direction (asc, desc)
 */
export const getUserRepositories = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("Utilisateur non authentifié");
    }

    const userId = req.user.userId;

    logger.debug("Fetching user repositories", { userId });

    // Récupérer l'utilisateur avec son token GitHub
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ValidationError("Utilisateur non trouvé");
    }

    // Pour le moment, on utilise le token d'accès stocké lors de l'OAuth
    // TODO: Implémenter le stockage sécurisé du token d'accès GitHub
    // Pour cette démo, on suppose que le token est disponible
    // Dans un vrai projet, il faudrait stocker le token de manière sécurisée

    // Paramètres de requête
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 30;
    const sort = (req.query.sort as any) || "updated";
    const direction = (req.query.direction as any) || "desc";

    // Note: Pour cette version, on retourne un message indiquant qu'il faut
    // implémenter le stockage du token GitHub
    // Dans une vraie implémentation, on appellerait:
    // const repositories = await GitHubService.getUserRepositories(accessToken, { page, perPage, sort, direction });

    logger.warn("GitHub token not stored - returning mock data", { userId });

    // Pour le développement, retourner des données de démonstration
    res.json({
      success: true,
      data: {
        repositories: [],
        message:
          "Pour récupérer vos dépôts, le token d'accès GitHub doit être stocké de manière sécurisée. Cette fonctionnalité sera implémentée dans la prochaine version.",
        pagination: {
          page,
          perPage,
          total: 0,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to fetch user repositories", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
    });

    throw error;
  }
};

/**
 * Récupère les commits d'un dépôt spécifique
 *
 * @route GET /api/github/commits/:owner/:repo
 * @access Private
 *
 * @param {string} owner - Propriétaire du dépôt
 * @param {string} repo - Nom du dépôt
 * @queryparam {string} since - Date de début (ISO 8601)
 * @queryparam {string} until - Date de fin (ISO 8601)
 * @queryparam {number} page - Numéro de page
 * @queryparam {number} perPage - Commits par page
 */
export const getRepositoryCommits = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("Utilisateur non authentifié");
    }

    const { owner, repo } = req.params;
    const userId = req.user.userId;

    // Validation des paramètres
    if (!owner || !repo) {
      throw new ValidationError(
        "Le propriétaire et le nom du dépôt sont requis",
      );
    }

    logger.debug("Fetching repository commits", {
      userId,
      owner,
      repo,
    });

    // Paramètres de requête
    const since = req.query.since as string;
    const until = req.query.until as string;
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 30;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ValidationError("Utilisateur non trouvé");
    }

    // TODO: Implémenter la récupération réelle avec le token GitHub
    // const commits = await GitHubService.getRepositoryCommits(accessToken, {
    //   owner,
    //   repo,
    //   since,
    //   until,
    //   page,
    //   perPage
    // });

    logger.warn("GitHub token not stored - returning mock data", {
      userId,
      owner,
      repo,
    });

    // Données de démonstration basées sur la maquette
    const mockCommits = [
      {
        sha: "abc123def456",
        message: "First commit",
        author: {
          name: user.name || "Unknown",
          email: user.email || "unknown@example.com",
          date: new Date().toISOString(),
        },
        url: `https://github.com/${owner}/${repo}/commit/abc123def456`,
      },
      {
        sha: "def456ghi789",
        message: "Added login form",
        author: {
          name: user.name || "Unknown",
          email: user.email || "unknown@example.com",
          date: new Date(Date.now() - 3600000).toISOString(),
        },
        url: `https://github.com/${owner}/${repo}/commit/def456ghi789`,
      },
      {
        sha: "ghi789jkl012",
        message: "Fixed auth bug",
        author: {
          name: user.name || "Unknown",
          email: user.email || "unknown@example.com",
          date: new Date(Date.now() - 7200000).toISOString(),
        },
        url: `https://github.com/${owner}/${repo}/commit/ghi789jkl012`,
      },
    ];

    res.json({
      success: true,
      data: {
        commits: mockCommits,
        repository: {
          owner,
          repo,
          fullName: `${owner}/${repo}`,
        },
        message:
          "Données de démonstration. Pour récupérer les vrais commits, configurez le stockage sécurisé du token GitHub.",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to fetch repository commits", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
      owner: req.params.owner,
      repo: req.params.repo,
    });

    throw error;
  }
};

/**
 * Formate une liste de commits en texte pour un rapport
 *
 * @route POST /api/github/format-commits
 * @access Private
 *
 * @body {Array} commits - Liste des commits à formater
 * @body {string} repoName - Nom du dépôt
 */
export const formatCommitsForReport = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new ValidationError("Utilisateur non authentifié");
    }

    const { commits, repoName } = req.body;

    if (!commits || !Array.isArray(commits)) {
      throw new ValidationError("La liste des commits est requise");
    }

    if (!repoName || typeof repoName !== "string") {
      throw new ValidationError("Le nom du dépôt est requis");
    }

    logger.debug("Formatting commits for report", {
      userId: req.user.userId,
      repoName,
      commitsCount: commits.length,
    });

    // Utiliser le service GitHub pour formater
    const formattedText = GitHubService.formatCommitsForReport(
      commits,
      repoName,
    );

    res.json({
      success: true,
      data: {
        formatted: formattedText,
        commitsCount: commits.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Failed to format commits", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId: req.user?.userId,
    });

    throw error;
  }
};
