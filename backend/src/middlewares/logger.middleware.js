"use strict";
/**
 * Middleware de logging des requêtes HTTP
 *
 * Ce middleware enregistre automatiquement toutes les requêtes HTTP entrantes
 * avec des informations détaillées pour faciliter le débogage et le monitoring.
 *
 * Informations enregistrées :
 * - Méthode HTTP (GET, POST, etc.)
 * - URL de la requête
 * - Code de statut de la réponse
 * - Temps de réponse
 * - Adresse IP du client
 * - User Agent
 *
 * @module middlewares/logger
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
exports.debugHeadersLogger = exports.bodyParserErrorLogger = exports.skipLoggingForPaths = exports.userContextLogger = exports.slowRequestLogger = exports.requestLogger = void 0;
const express_1 = require("express");
const logger_1 = __importStar(require("../utils/logger"));
/**
 * Middleware de logging des requêtes HTTP
 *
 * Enregistre chaque requête avec sa méthode, URL, statut de réponse et temps d'exécution.
 * Les logs sont colorisés selon le code de statut HTTP :
 * - 2xx : info (succès)
 * - 3xx : info (redirection)
 * - 4xx : warn (erreur client)
 * - 5xx : error (erreur serveur)
 *
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction Next pour passer au middleware suivant
 *
 * @example
 * ```typescript
 * import { requestLogger } from './middlewares/logger.middleware';
 *
 * app.use(requestLogger);
 * ```
 */
const requestLogger = (req, res, next) => {
    // Enregistre le temps de début de la requête
    const startTime = Date.now();
    // Capture l'URL complète
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    // Log de la requête entrante en mode debug
    logger_1.default.debug('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
    // Intercepte la méthode res.json pour logger après l'envoi de la réponse
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        // Calcule le temps de réponse
        const duration = Date.now() - startTime;
        // Log la requête complétée
        (0, logger_1.logRequest)(req.method, req.originalUrl, res.statusCode, duration);
        // Log additionnel en mode debug avec plus de détails
        if (process.env.LOG_LEVEL === 'debug') {
            logger_1.default.debug('Request completed', {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                responseSize: JSON.stringify(body).length,
            });
        }
        return originalJson(body);
    };
    // Intercepte aussi la méthode res.send
    const originalSend = res.send.bind(res);
    res.send = function (body) {
        const duration = Date.now() - startTime;
        (0, logger_1.logRequest)(req.method, req.originalUrl, res.statusCode, duration);
        if (process.env.LOG_LEVEL === 'debug') {
            logger_1.default.debug('Request completed (send)', {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
            });
        }
        return originalSend(body);
    };
    next();
};
exports.requestLogger = requestLogger;
/**
 * Middleware pour logger les requêtes lentes
 *
 * Enregistre un avertissement pour les requêtes qui prennent plus de temps qu'un seuil défini.
 * Utile pour identifier les problèmes de performance.
 *
 * @param thresholdMs - Seuil en millisecondes (par défaut 1000ms)
 * @returns Middleware Express
 *
 * @example
 * ```typescript
 * app.use(slowRequestLogger(500)); // Alerte pour les requêtes > 500ms
 * ```
 */
const slowRequestLogger = (thresholdMs = 1000) => {
    return (req, res, next) => {
        const startTime = Date.now();
        // Intercepte la fin de la réponse
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            if (duration > thresholdMs) {
                logger_1.default.warn('Slow request detected', {
                    method: req.method,
                    url: req.originalUrl,
                    duration: `${duration}ms`,
                    threshold: `${thresholdMs}ms`,
                    statusCode: res.statusCode,
                });
            }
        });
        next();
    };
};
exports.slowRequestLogger = slowRequestLogger;
/**
 * Middleware pour logger les informations de l'utilisateur authentifié
 *
 * Ajoute l'ID utilisateur aux logs si la requête est authentifiée.
 *
 * @param req - Requête Express (potentiellement authentifiée)
 * @param res - Réponse Express
 * @param next - Fonction Next
 */
const userContextLogger = (req, res, next) => {
    if (req.user && req.user.userId) {
        logger_1.default.debug('Authenticated request', {
            userId: req.user.userId,
            method: req.method,
            url: req.originalUrl,
        });
    }
    next();
};
exports.userContextLogger = userContextLogger;
/**
 * Middleware pour ignorer certaines routes du logging
 *
 * Utile pour éviter de logger les requêtes de health check ou de monitoring
 * qui peuvent polluer les logs.
 *
 * @param paths - Tableau de chemins à ignorer
 * @returns Middleware Express
 *
 * @example
 * ```typescript
 * app.use(skipLoggingForPaths(['/health', '/metrics']));
 * app.use(requestLogger);
 * ```
 */
const skipLoggingForPaths = (paths) => {
    return (req, res, next) => {
        // Si le path correspond à un des chemins à ignorer, skip le logging
        if (paths.some(path => req.path === path || req.path.startsWith(path))) {
            req.skipLogging = true;
        }
        next();
    };
};
exports.skipLoggingForPaths = skipLoggingForPaths;
/**
 * Middleware pour logger les erreurs de parsing du body
 *
 * Capture les erreurs de parsing JSON ou URL encoded et les log proprement.
 *
 * @param err - Erreur
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction Next
 */
const bodyParserErrorLogger = (err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        logger_1.default.error('Body parsing error', {
            method: req.method,
            url: req.originalUrl,
            error: err.message,
            type: err.type || 'unknown',
        });
        res.status(400).json({
            success: false,
            error: {
                message: 'Format de données invalide',
                code: 'INVALID_BODY_FORMAT',
            },
            timestamp: new Date().toISOString(),
        });
        return;
    }
    next(err);
};
exports.bodyParserErrorLogger = bodyParserErrorLogger;
/**
 * Middleware pour logger les headers de la requête (mode debug)
 *
 * Utile pour déboguer les problèmes d'authentification ou de CORS.
 * Utilisé uniquement en environnement de développement.
 *
 * @param req - Requête Express
 * @param res - Réponse Express
 * @param next - Fonction Next
 */
const debugHeadersLogger = (req, res, next) => {
    if (process.env.NODE_ENV === 'development' && process.env.LOG_LEVEL === 'debug') {
        logger_1.default.debug('Request headers', {
            method: req.method,
            url: req.originalUrl,
            headers: req.headers,
        });
    }
    next();
};
exports.debugHeadersLogger = debugHeadersLogger;
exports.default = exports.requestLogger;
//# sourceMappingURL=logger.middleware.js.map