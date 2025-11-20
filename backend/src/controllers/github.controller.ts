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

    logger.debug("User found for repo fetch", {
      userId: user.id,
      hasGithubToken: !!user.githubToken,
      tokenLength: user.githubToken?.length
    });

    if (!user.githubToken) {
      throw new ValidationError(
        "Token GitHub manquant. Veuillez vous reconnecter via GitHub.",
      );
    }

    // Paramètres de requête
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 30;
    const sort = (req.query.sort as any) || "updated";
    const direction = (req.query.direction as any) || "desc";

    const repositories = await GitHubService.getUserRepositories(
      user.githubToken,
      { page, perPage, sort, direction },
    );

    res.json({
      success: true,
      data: {
        repositories,
        pagination: {
          page,
          perPage,
          total: repositories.length, // Note: GitHub API doesn't return total count easily in this endpoint
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

    if (!user.githubToken) {
      throw new ValidationError(
        "Token GitHub manquant. Veuillez vous reconnecter via GitHub.",
      );
    }

    const commits = await GitHubService.getRepositoryCommits(user.githubToken, {
      owner,
      repo,
      since,
      until,
      page,
      perPage,
    });

    res.json({
      success: true,
      data: {
        commits,
        repository: {
          owner,
          repo,
          fullName: `${owner}/${repo}`,
        },
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
