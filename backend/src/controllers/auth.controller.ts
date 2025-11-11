/**
 * Controller d'authentification GitHub OAuth
 *
 * Ce controller gère le flux d'authentification OAuth avec GitHub :
 * 1. Redirection vers GitHub pour autorisation
 * 2. Callback avec le code d'autorisation
 * 3. Échange du code contre un token d'accès
 * 4. Récupération des informations utilisateur
 * 5. Création/mise à jour de l'utilisateur en base
 * 6. Génération d'un JWT pour l'authentification
 *
 * @module controllers/auth
 */

import crypto from 'crypto';
import { Request, Response } from 'express';
import { config } from '../config/env';
import prisma from '../db';
import { generateToken } from '../middlewares/auth.middleware';
import { NotFoundError, UnauthorizedError } from '../middlewares/error.middleware';
import { GitHubService } from '../services/github.service';
import { AuthenticatedRequest } from '../types';
import logger, { logAuth, logDatabase } from '../utils/logger';

/**
 * Store temporaire pour les états CSRF (en production, utiliser Redis)
 * Map<state, timestamp>
 */
const stateStore = new Map<string, number>();

/**
 * Nettoie les états expirés (plus de 10 minutes)
 */
const cleanupExpiredStates = (): void => {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  for (const [state, timestamp] of stateStore.entries()) {
    if (now - timestamp > tenMinutes) {
      stateStore.delete(state);
    }
  }
};

// Nettoie les états expirés toutes les 5 minutes
setInterval(cleanupExpiredStates, 5 * 60 * 1000);

/**
 * Génère un état aléatoire pour CSRF protection
 */
const generateState = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Valide un état CSRF
 */
const validateState = (state: string): boolean => {
  if (!stateStore.has(state)) {
    return false;
  }

  // Supprime l'état après validation (usage unique)
  stateStore.delete(state);
  return true;
};

/**
 * Initie le flux d'authentification OAuth GitHub
 *
 * Génère un état CSRF, le stocke, et redirige l'utilisateur vers GitHub
 * pour autorisation.
 *
 * @route GET /auth/github/login
 * @access Public
 */
export const githubLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Initiating GitHub OAuth login');

    // Vérifie que les credentials GitHub sont configurés
    if (!config.github.clientId || !config.github.clientSecret) {
      throw new UnauthorizedError(
        'GitHub OAuth is not configured. Please check your environment variables.'
      );
    }

    // Génère un état CSRF unique
    const state = generateState();
    stateStore.set(state, Date.now());

    // Génère l'URL d'autorisation GitHub
    const authUrl = GitHubService.getAuthorizationUrl(state);

    logger.debug('Generated GitHub authorization URL', { state });

    // Redirige vers GitHub
    res.json({
      success: true,
      data: {
        authUrl,
        state, // Retourne l'état pour que le frontend puisse le vérifier
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to initiate GitHub login', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Impossible d\'initier l\'authentification GitHub',
        code: 'GITHUB_AUTH_INIT_FAILED',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Callback OAuth GitHub
 *
 * Reçoit le code d'autorisation de GitHub, l'échange contre un token,
 * récupère les informations utilisateur, et crée/met à jour l'utilisateur
 * en base de données.
 *
 * @route GET /auth/github/callback
 * @access Public
 */
export const githubCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query;

    logger.info('GitHub OAuth callback received', { hasCode: !!code, hasState: !!state });

    // Validation des paramètres
    if (!code || typeof code !== 'string') {
      throw new UnauthorizedError('Code d\'autorisation manquant');
    }

    if (!state || typeof state !== 'string') {
      throw new UnauthorizedError('État CSRF manquant');
    }

    // Valide l'état CSRF
    if (!validateState(state)) {
      logger.warn('Invalid or expired CSRF state', { state });
      throw new UnauthorizedError('État CSRF invalide ou expiré');
    }

    // Échange le code contre un token d'accès
    logger.debug('Exchanging authorization code for access token');
    const accessToken = await GitHubService.getAccessToken(code);

    // Récupère les informations utilisateur depuis GitHub
    logger.debug('Fetching GitHub user information');
    const githubUser = await GitHubService.getUserInfo(accessToken);

    // Vérifie si l'utilisateur existe déjà en base
    let user = await prisma.user.findUnique({
      where: { githubId: githubUser.id.toString() },
    });

    if (user) {
      // Met à jour les informations utilisateur
      logger.debug('Updating existing user', { userId: user.id });

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: githubUser.name,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
        },
      });

      logDatabase('UPDATE', 'User', { userId: user.id });
      logAuth('LOGIN', user.id, { githubId: githubUser.id });
    } else {
      // Crée un nouvel utilisateur
      logger.debug('Creating new user', { githubId: githubUser.id });

      user = await prisma.user.create({
        data: {
          githubId: githubUser.id.toString(),
          name: githubUser.name,
          email: githubUser.email,
          avatarUrl: githubUser.avatar_url,
        },
      });

      logDatabase('CREATE', 'User', { userId: user.id });
      logAuth('REGISTER', user.id, { githubId: githubUser.id });
    }

    // Génère un JWT pour l'authentification
    const token = generateToken(user.id, user.githubId);

    logger.info('GitHub authentication successful', {
      userId: user.id,
      githubId: user.githubId,
      isNewUser: !user,
    });

    // Redirige vers le frontend avec le token
    const redirectUrl = `${config.frontendUrl}/auth/callback?token=${token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    logger.error('GitHub OAuth callback failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // Redirige vers le frontend avec une erreur
    const errorMessage = error instanceof Error ? error.message : 'Authentification échouée';
    const redirectUrl = `${config.frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`;
    res.redirect(redirectUrl);
  }
};

/**
 * Récupère les informations de l'utilisateur authentifié
 *
 * @route GET /auth/me
 * @access Private (requires JWT)
 */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Utilisateur non authentifié');
    }

    logger.debug('Fetching current user info', { userId: req.user.userId });

    // Récupère l'utilisateur depuis la base de données
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        githubId: true,
        name: true,
        email: true,
        avatarUrl: true,
        _count: {
          select: { reports: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur');
    }

    logger.debug('User info fetched successfully', { userId: user.id });

    res.json({
      success: true,
      data: {
        id: user.id,
        githubId: user.githubId,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        reportsCount: user._count.reports,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to fetch current user', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.user?.userId,
    });

    if (error instanceof UnauthorizedError || error instanceof NotFoundError) {
      throw error;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Impossible de récupérer les informations utilisateur',
        code: 'USER_FETCH_FAILED',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Déconnexion de l'utilisateur
 *
 * Côté serveur, il n'y a rien à faire car on utilise des JWT stateless.
 * Le frontend doit simplement supprimer le token.
 *
 * @route POST /auth/logout
 * @access Private (requires JWT)
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      logAuth('LOGOUT', req.user.userId);
      logger.info('User logged out', { userId: req.user.userId });
    }

    res.json({
      success: true,
      message: 'Déconnexion réussie',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Logout failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la déconnexion',
        code: 'LOGOUT_FAILED',
      },
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Vérifie la validité d'un token JWT
 *
 * @route GET /auth/verify
 * @access Public
 */
export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    if (!token) {
      res.json({
        success: true,
        data: {
          valid: false,
          message: 'No token provided',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Le middleware d'authentification a déjà validé le token
    // Si on arrive ici, c'est que le token est valide
    const authenticatedReq = req as AuthenticatedRequest;

    res.json({
      success: true,
      data: {
        valid: !!authenticatedReq.user,
        userId: authenticatedReq.user?.userId,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        valid: false,
        message: 'Invalid token',
      },
      timestamp: new Date().toISOString(),
    });
  }
};
