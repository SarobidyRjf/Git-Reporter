"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.logout = exports.getCurrentUser = exports.githubCallback = exports.githubLogin = void 0;
const crypto_1 = __importDefault(require("crypto"));
const express_1 = require("express");
const env_1 = require("../config/env");
const db_1 = __importDefault(require("../db"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const error_middleware_1 = require("../middlewares/error.middleware");
const github_service_1 = require("../services/github.service");
const types_1 = require("../types");
const logger_1 = __importStar(require("../utils/logger"));
/**
 * Store temporaire pour les états CSRF (en production, utiliser Redis)
 * Map<state, timestamp>
 */
const stateStore = new Map();
/**
 * Nettoie les états expirés (plus de 10 minutes)
 */
const cleanupExpiredStates = () => {
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
const generateState = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
/**
 * Valide un état CSRF
 */
const validateState = (state) => {
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
const githubLogin = async (req, res) => {
    try {
        logger_1.default.info('Initiating GitHub OAuth login');
        // Vérifie que les credentials GitHub sont configurés
        if (!env_1.config.github.clientId || !env_1.config.github.clientSecret) {
            throw new error_middleware_1.UnauthorizedError('GitHub OAuth is not configured. Please check your environment variables.');
        }
        // Génère un état CSRF unique
        const state = generateState();
        stateStore.set(state, Date.now());
        // Génère l'URL d'autorisation GitHub
        const authUrl = github_service_1.GitHubService.getAuthorizationUrl(state);
        logger_1.default.debug('Generated GitHub authorization URL', { state });
        // Redirige vers GitHub
        res.json({
            success: true,
            data: {
                authUrl,
                state, // Retourne l'état pour que le frontend puisse le vérifier
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error('Failed to initiate GitHub login', {
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
exports.githubLogin = githubLogin;
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
const githubCallback = async (req, res) => {
    try {
        const { code, state } = req.query;
        logger_1.default.info('GitHub OAuth callback received', { hasCode: !!code, hasState: !!state });
        // Validation des paramètres
        if (!code || typeof code !== 'string') {
            throw new error_middleware_1.UnauthorizedError('Code d\'autorisation manquant');
        }
        if (!state || typeof state !== 'string') {
            throw new error_middleware_1.UnauthorizedError('État CSRF manquant');
        }
        // Valide l'état CSRF
        if (!validateState(state)) {
            logger_1.default.warn('Invalid or expired CSRF state', { state });
            throw new error_middleware_1.UnauthorizedError('État CSRF invalide ou expiré');
        }
        // Échange le code contre un token d'accès
        logger_1.default.debug('Exchanging authorization code for access token');
        const accessToken = await github_service_1.GitHubService.getAccessToken(code);
        // Récupère les informations utilisateur depuis GitHub
        logger_1.default.debug('Fetching GitHub user information');
        const githubUser = await github_service_1.GitHubService.getUserInfo(accessToken);
        // Vérifie si l'utilisateur existe déjà en base
        let user = await db_1.default.user.findUnique({
            where: { githubId: githubUser.id.toString() },
        });
        if (user) {
            // Met à jour les informations utilisateur
            logger_1.default.debug('Updating existing user', { userId: user.id });
            user = await db_1.default.user.update({
                where: { id: user.id },
                data: {
                    name: githubUser.name,
                    email: githubUser.email,
                    avatarUrl: githubUser.avatar_url,
                },
            });
            (0, logger_1.logDatabase)('UPDATE', 'User', { userId: user.id });
            (0, logger_1.logAuth)('LOGIN', user.id, { githubId: githubUser.id });
        }
        else {
            // Crée un nouvel utilisateur
            logger_1.default.debug('Creating new user', { githubId: githubUser.id });
            user = await db_1.default.user.create({
                data: {
                    githubId: githubUser.id.toString(),
                    name: githubUser.name,
                    email: githubUser.email,
                    avatarUrl: githubUser.avatar_url,
                },
            });
            (0, logger_1.logDatabase)('CREATE', 'User', { userId: user.id });
            (0, logger_1.logAuth)('REGISTER', user.id, { githubId: githubUser.id });
        }
        // Génère un JWT pour l'authentification
        const token = (0, auth_middleware_1.generateToken)(user.id, user.githubId);
        logger_1.default.info('GitHub authentication successful', {
            userId: user.id,
            githubId: user.githubId,
            isNewUser: !user,
        });
        // Redirige vers le frontend avec le token
        const redirectUrl = `${env_1.config.frontendUrl}/auth/callback?token=${token}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        logger_1.default.error('GitHub OAuth callback failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        // Redirige vers le frontend avec une erreur
        const errorMessage = error instanceof Error ? error.message : 'Authentification échouée';
        const redirectUrl = `${env_1.config.frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`;
        res.redirect(redirectUrl);
    }
};
exports.githubCallback = githubCallback;
/**
 * Récupère les informations de l'utilisateur authentifié
 *
 * @route GET /auth/me
 * @access Private (requires JWT)
 */
const getCurrentUser = async (req, res) => {
    try {
        if (!req.user) {
            throw new error_middleware_1.UnauthorizedError('Utilisateur non authentifié');
        }
        logger_1.default.debug('Fetching current user info', { userId: req.user.userId });
        // Récupère l'utilisateur depuis la base de données
        const user = await db_1.default.user.findUnique({
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
            throw new error_middleware_1.NotFoundError('Utilisateur');
        }
        logger_1.default.debug('User info fetched successfully', { userId: user.id });
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
    }
    catch (error) {
        logger_1.default.error('Failed to fetch current user', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: req.user?.userId,
        });
        if (error instanceof error_middleware_1.UnauthorizedError || error instanceof error_middleware_1.NotFoundError) {
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
exports.getCurrentUser = getCurrentUser;
/**
 * Déconnexion de l'utilisateur
 *
 * Côté serveur, il n'y a rien à faire car on utilise des JWT stateless.
 * Le frontend doit simplement supprimer le token.
 *
 * @route POST /auth/logout
 * @access Private (requires JWT)
 */
const logout = async (req, res) => {
    try {
        if (req.user) {
            (0, logger_1.logAuth)('LOGOUT', req.user.userId);
            logger_1.default.info('User logged out', { userId: req.user.userId });
        }
        res.json({
            success: true,
            message: 'Déconnexion réussie',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        logger_1.default.error('Logout failed', {
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
exports.logout = logout;
/**
 * Vérifie la validité d'un token JWT
 *
 * @route GET /auth/verify
 * @access Public
 */
const verifyToken = async (req, res) => {
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
        const authenticatedReq = req;
        res.json({
            success: true,
            data: {
                valid: !!authenticatedReq.user,
                userId: authenticatedReq.user?.userId,
            },
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
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
exports.verifyToken = verifyToken;
//# sourceMappingURL=auth.controller.js.map