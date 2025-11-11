"use strict";
/**
 * Middleware de gestion d'erreurs centralisée
 *
 * Ce middleware intercepte toutes les erreurs dans l'application Express
 * et les formate de manière cohérente avant de les renvoyer au client.
 *
 * Il gère :
 * - Les erreurs de validation
 * - Les erreurs de base de données (Prisma)
 * - Les erreurs d'authentification
 * - Les erreurs 404 (route non trouvée)
 * - Les erreurs internes du serveur
 *
 * @module middlewares/error
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeErrorHandlers = exports.handleSIGTERM = exports.handleUnhandledRejections = exports.handleUncaughtExceptions = exports.notFoundHandler = exports.errorHandler = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.NotFoundError = exports.OperationalError = void 0;
const express_1 = require("express");
const env_1 = require("../config/env");
const generated_1 = require("../generated");
const types_1 = require("../types");
const logger_1 = __importStar(require("../utils/logger"));
/**
 * Classe d'erreur personnalisée pour les erreurs opérationnelles
 */
class OperationalError extends Error {
    statusCode;
    code;
    isOperational = true;
    constructor(message, statusCode = 500, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'OperationalError';
        // Maintient la stack trace correcte
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.OperationalError = OperationalError;
/**
 * Erreurs spécifiques pour différents cas d'usage
 */
class NotFoundError extends OperationalError {
    constructor(resource = 'Ressource') {
        super(`${resource} non trouvée`, 404, 'NOT_FOUND');
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ValidationError extends OperationalError {
    constructor(message = 'Données invalides') {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends OperationalError {
    constructor(message = 'Non autorisé') {
        super(message, 401, 'UNAUTHORIZED');
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends OperationalError {
    constructor(message = 'Accès interdit') {
        super(message, 403, 'FORBIDDEN');
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends OperationalError {
    constructor(message = 'Conflit détecté') {
        super(message, 409, 'CONFLICT');
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
/**
 * Détermine si une erreur est une erreur opérationnelle attendue
 */
const isOperationalError = (error) => {
    if (error instanceof OperationalError) {
        return error.isOperational;
    }
    return false;
};
/**
 * Gère les erreurs Prisma spécifiques et les convertit en erreurs opérationnelles
 */
const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P2002':
            // Violation de contrainte unique
            const target = error.meta?.target || [];
            return new ConflictError(`Un enregistrement avec ce ${target.join(', ')} existe déjà`);
        case 'P2025':
            // Enregistrement non trouvé
            return new NotFoundError('Enregistrement');
        case 'P2003':
            // Violation de contrainte de clé étrangère
            return new ValidationError('Référence invalide vers un enregistrement lié');
        case 'P2014':
            // Violation de relation requise
            return new ValidationError('La relation requise n\'a pas pu être satisfaite');
        case 'P2000':
            // Valeur trop longue pour la colonne
            return new ValidationError('Une ou plusieurs valeurs dépassent la taille maximale autorisée');
        case 'P2001':
            // L'enregistrement recherché n'existe pas
            return new NotFoundError();
        default:
            // Autres erreurs Prisma
            logger_1.default.error('Unhandled Prisma error', { code: error.code, meta: error.meta });
            return {
                name: 'DatabaseError',
                message: 'Erreur de base de données',
                statusCode: 500,
                code: 'DATABASE_ERROR',
            };
    }
};
/**
 * Formate une réponse d'erreur standardisée
 */
const formatErrorResponse = (error, includeStack = false) => {
    const response = {
        success: false,
        error: {
            message: error.message || 'Une erreur est survenue',
            code: error.code,
        },
        timestamp: new Date().toISOString(),
    };
    // Inclut la stack trace en développement
    if (includeStack && error.stack) {
        response.error.details = {
            stack: error.stack,
        };
    }
    return response;
};
/**
 * Middleware de gestion d'erreurs principal
 *
 * Ce middleware doit être ajouté après toutes les routes.
 * Il intercepte les erreurs et renvoie une réponse formatée au client.
 *
 * @param err - Erreur interceptée
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction Next
 */
const errorHandler = (err, req, res, next) => {
    // Si les headers ont déjà été envoyés, délègue à Express
    if (res.headersSent) {
        return next(err);
    }
    let error = err;
    // Gestion des erreurs Prisma
    if (err instanceof generated_1.Prisma.PrismaClientKnownRequestError) {
        error = handlePrismaError(err);
    }
    else if (err instanceof generated_1.Prisma.PrismaClientValidationError) {
        error = new ValidationError('Erreur de validation des données');
    }
    else if (err instanceof generated_1.Prisma.PrismaClientInitializationError) {
        error = {
            name: 'DatabaseConnectionError',
            message: 'Impossible de se connecter à la base de données',
            statusCode: 503,
            code: 'DATABASE_CONNECTION_ERROR',
        };
    }
    // Définit le statut code par défaut si non défini
    const statusCode = error.statusCode || 500;
    // Log l'erreur selon sa sévérité
    if (statusCode >= 500) {
        // Erreurs serveur - log complet avec stack trace
        (0, logger_1.logError)('Server error', err, {
            path: req.path,
            method: req.method,
            ip: req.ip,
            userId: req.user?.userId,
        });
    }
    else if (statusCode >= 400) {
        // Erreurs client - log warning
        logger_1.default.warn('Client error', {
            message: error.message,
            code: error.code,
            path: req.path,
            method: req.method,
            statusCode,
        });
    }
    // Détermine si on doit inclure les détails (mode développement uniquement)
    const includeDetails = env_1.config.nodeEnv === 'development';
    // Formate et envoie la réponse d'erreur
    const errorResponse = formatErrorResponse(error, includeDetails);
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * Middleware pour gérer les routes non trouvées (404)
 *
 * Ce middleware doit être ajouté après toutes les routes définies
 * mais avant le middleware errorHandler.
 */
const notFoundHandler = (req, res, next) => {
    const error = new NotFoundError(`Route ${req.method} ${req.path}`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
/**
 * Gestionnaire d'erreurs non gérées (uncaught exceptions)
 * À appeler au démarrage de l'application
 */
const handleUncaughtExceptions = () => {
    process.on('uncaughtException', (error) => {
        logger_1.default.error('UNCAUGHT EXCEPTION! Shutting down...', {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        });
        // Donne le temps aux logs d'être écrits
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    });
};
exports.handleUncaughtExceptions = handleUncaughtExceptions;
/**
 * Gestionnaire de rejets de promesses non gérés (unhandled promise rejections)
 * À appeler au démarrage de l'application
 */
const handleUnhandledRejections = () => {
    process.on('unhandledRejection', (reason) => {
        logger_1.default.error('UNHANDLED REJECTION! Shutting down...', {
            reason: reason instanceof Error ? {
                name: reason.name,
                message: reason.message,
                stack: reason.stack,
            } : reason,
        });
        // Donne le temps aux logs d'être écrits
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    });
};
exports.handleUnhandledRejections = handleUnhandledRejections;
/**
 * Gestionnaire de signal SIGTERM (pour les arrêts gracieux)
 */
const handleSIGTERM = (cleanup) => {
    process.on('SIGTERM', async () => {
        logger_1.default.info('SIGTERM received. Shutting down gracefully...');
        if (cleanup) {
            try {
                await cleanup();
                logger_1.default.info('Cleanup completed successfully');
            }
            catch (error) {
                logger_1.default.error('Error during cleanup', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }
        process.exit(0);
    });
};
exports.handleSIGTERM = handleSIGTERM;
/**
 * Initialise tous les gestionnaires d'erreurs globaux
 */
const initializeErrorHandlers = (cleanup) => {
    (0, exports.handleUncaughtExceptions)();
    (0, exports.handleUnhandledRejections)();
    (0, exports.handleSIGTERM)(cleanup);
};
exports.initializeErrorHandlers = initializeErrorHandlers;
exports.default = exports.errorHandler;
//# sourceMappingURL=error.middleware.js.map