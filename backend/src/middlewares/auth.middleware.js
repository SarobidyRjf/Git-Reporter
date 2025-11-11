"use strict";
/**
 * Middleware d'authentification JWT
 *
 * Ce middleware vérifie et valide les tokens JWT pour protéger les routes de l'API.
 * Il extrait le token du header Authorization, le vérifie, et attache les informations
 * utilisateur à l'objet request pour une utilisation ultérieure.
 *
 * Format du header attendu: "Bearer <token>"
 *
 * @module middlewares/auth
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
exports.decodeToken = exports.verifyToken = exports.generateToken = exports.optionalAuth = exports.authenticateToken = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const types_1 = require("../types");
const logger_1 = __importStar(require("../utils/logger"));
/**
 * Middleware d'authentification JWT
 *
 * Vérifie la présence et la validité du token JWT dans les requêtes.
 * Si le token est valide, attache les données utilisateur à req.user
 *
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction Next pour passer au middleware suivant
 *
 * @throws {401} Si le token est manquant, invalide ou expiré
 *
 * @example
 * ```typescript
 * // Utilisation dans une route
 * router.get('/protected', authenticateToken, (req, res) => {
 *   const userId = req.user.userId;
 *   // ...
 * });
 * ```
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Extraction du token depuis le header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        // Vérification de la présence du token
        if (!token) {
            logger_1.default.warn('Authentication failed: No token provided', {
                ip: req.ip,
                path: req.path,
            });
            res.status(401).json({
                success: false,
                error: {
                    message: 'Token d\'authentification manquant',
                    code: 'NO_TOKEN',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        // Vérification et décodage du token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
        // Validation des données du payload
        if (!decoded.userId || !decoded.githubId) {
            logger_1.default.warn('Authentication failed: Invalid token payload', {
                ip: req.ip,
                path: req.path,
            });
            res.status(401).json({
                success: false,
                error: {
                    message: 'Token invalide',
                    code: 'INVALID_TOKEN_PAYLOAD',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        // Attache les informations utilisateur à la requête
        req.user = {
            userId: decoded.userId,
            githubId: decoded.githubId,
        };
        // Log de l'authentification réussie en mode debug
        logger_1.default.debug('User authenticated successfully', {
            userId: decoded.userId,
            path: req.path,
        });
        next();
    }
    catch (error) {
        // Gestion des erreurs JWT spécifiques
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.default.warn('Authentication failed: Invalid token', {
                error: error.message,
                ip: req.ip,
                path: req.path,
            });
            res.status(401).json({
                success: false,
                error: {
                    message: 'Token invalide',
                    code: 'INVALID_TOKEN',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            logger_1.default.warn('Authentication failed: Token expired', {
                ip: req.ip,
                path: req.path,
            });
            res.status(401).json({
                success: false,
                error: {
                    message: 'Token expiré',
                    code: 'TOKEN_EXPIRED',
                },
                timestamp: new Date().toISOString(),
            });
            return;
        }
        // Erreur inattendue
        logger_1.default.error('Authentication error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            ip: req.ip,
            path: req.path,
        });
        res.status(500).json({
            success: false,
            error: {
                message: 'Erreur lors de l\'authentification',
                code: 'AUTH_ERROR',
            },
            timestamp: new Date().toISOString(),
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware optionnel d'authentification
 *
 * Similaire à authenticateToken mais ne bloque pas la requête si le token est absent.
 * Utile pour les routes qui peuvent fonctionner avec ou sans authentification.
 *
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction Next pour passer au middleware suivant
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
            if (decoded.userId && decoded.githubId) {
                req.user = {
                    userId: decoded.userId,
                    githubId: decoded.githubId,
                };
            }
        }
        next();
    }
    catch (error) {
        // En cas d'erreur, on continue sans bloquer la requête
        logger_1.default.debug('Optional auth failed, continuing without user', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        next();
    }
};
exports.optionalAuth = optionalAuth;
/**
 * Génère un token JWT pour un utilisateur
 *
 * @param userId - ID de l'utilisateur
 * @param githubId - ID GitHub de l'utilisateur
 * @returns Token JWT signé
 *
 * @example
 * ```typescript
 * const token = generateToken(user.id, user.githubId);
 * res.json({ token });
 * ```
 */
const generateToken = (userId, githubId) => {
    const payload = {
        userId,
        githubId,
    };
    const token = jsonwebtoken_1.default.sign(payload, env_1.config.jwt.secret, {
        expiresIn: env_1.config.jwt.expiresIn,
    });
    (0, logger_1.logAuth)('TOKEN_GENERATED', userId);
    return token;
};
exports.generateToken = generateToken;
/**
 * Vérifie si un token est valide sans le décoder complètement
 *
 * @param token - Token JWT à vérifier
 * @returns true si le token est valide, false sinon
 */
const verifyToken = (token) => {
    try {
        jsonwebtoken_1.default.verify(token, env_1.config.jwt.secret);
        return true;
    }
    catch {
        return false;
    }
};
exports.verifyToken = verifyToken;
/**
 * Décode un token JWT sans le vérifier
 * Utile pour extraire des informations d'un token avant vérification
 *
 * @param token - Token JWT à décoder
 * @returns Payload décodé ou null si le décodage échoue
 */
const decodeToken = (token) => {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch {
        return null;
    }
};
exports.decodeToken = decodeToken;
exports.default = exports.authenticateToken;
//# sourceMappingURL=auth.middleware.js.map