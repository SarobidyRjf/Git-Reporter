"use strict";
/**
 * Système de logging centralisé avec Winston
 *
 * Ce module configure Winston pour fournir des logs structurés et professionnels
 * avec différents niveaux de logs (error, warn, info, debug) et formats selon l'environnement.
 *
 * Niveaux de logs:
 * - error: Erreurs critiques nécessitant une attention immédiate
 * - warn: Avertissements sur des situations potentiellement problématiques
 * - info: Informations générales sur le fonctionnement de l'application
 * - debug: Informations détaillées pour le débogage
 *
 * @module utils/logger
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logReportSent = exports.logAuth = exports.logExternalAPI = exports.logDatabase = exports.logError = exports.logRequest = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../config/env");
/**
 * Format personnalisé pour les logs en développement
 * Affiche les logs de manière lisible avec couleurs
 */
const devFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaString = '';
    if (Object.keys(meta).length > 0) {
        metaString = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `[${timestamp}] ${level}: ${message}${metaString}`;
}));
/**
 * Format pour les logs en production
 * Format JSON pour une meilleure intégration avec les systèmes de monitoring
 */
const prodFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
/**
 * Configuration des transports selon l'environnement
 */
const transports = [
    // Console transport - toujours actif
    new winston_1.default.transports.Console({
        format: env_1.config.nodeEnv === 'production' ? prodFormat : devFormat,
    }),
];
/**
 * En production, ajoute des fichiers de logs
 */
if (env_1.config.nodeEnv === 'production') {
    transports.push(
    // Fichier pour tous les logs
    new winston_1.default.transports.File({
        filename: 'logs/combined.log',
        format: prodFormat,
    }), 
    // Fichier séparé pour les erreurs
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: prodFormat,
    }));
}
/**
 * Instance du logger Winston
 */
const logger = winston_1.default.createLogger({
    level: env_1.config.logLevel,
    levels: winston_1.default.config.npm.levels,
    transports,
    // Ne pas quitter sur les erreurs non gérées
    exitOnError: false,
});
/**
 * Wrapper pour logger les requêtes HTTP
 * @param method - Méthode HTTP (GET, POST, etc.)
 * @param url - URL de la requête
 * @param statusCode - Code de statut de la réponse
 * @param duration - Durée de la requête en ms
 */
const logRequest = (method, url, statusCode, duration) => {
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;
    if (statusCode >= 500) {
        logger.error(message);
    }
    else if (statusCode >= 400) {
        logger.warn(message);
    }
    else {
        logger.info(message);
    }
};
exports.logRequest = logRequest;
/**
 * Logger pour les erreurs avec contexte
 * @param message - Message d'erreur
 * @param error - Objet Error
 * @param context - Contexte additionnel
 */
const logError = (message, error, context) => {
    logger.error(message, {
        error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
        },
        ...context,
    });
};
exports.logError = logError;
/**
 * Logger pour les opérations de base de données
 * @param operation - Type d'opération (CREATE, READ, UPDATE, DELETE)
 * @param model - Nom du modèle
 * @param details - Détails supplémentaires
 */
const logDatabase = (operation, model, details) => {
    logger.debug(`Database ${operation} on ${model}`, details);
};
exports.logDatabase = logDatabase;
/**
 * Logger pour les appels API externes
 * @param service - Nom du service externe (GitHub, Twilio, etc.)
 * @param endpoint - Endpoint appelé
 * @param success - Si l'appel a réussi
 * @param details - Détails supplémentaires
 */
const logExternalAPI = (service, endpoint, success, details) => {
    const message = `External API call to ${service}: ${endpoint}`;
    if (success) {
        logger.info(message, details);
    }
    else {
        logger.warn(`${message} - FAILED`, details);
    }
};
exports.logExternalAPI = logExternalAPI;
/**
 * Logger pour les événements d'authentification
 * @param event - Type d'événement (LOGIN, LOGOUT, REGISTER, etc.)
 * @param userId - ID de l'utilisateur
 * @param details - Détails supplémentaires
 */
const logAuth = (event, userId, details) => {
    logger.info(`Auth Event: ${event}`, {
        userId,
        ...details,
    });
};
exports.logAuth = logAuth;
/**
 * Logger pour les envois de rapports
 * @param reportId - ID du rapport
 * @param method - Méthode d'envoi (email ou whatsapp)
 * @param recipient - Destinataire
 * @param success - Si l'envoi a réussi
 */
const logReportSent = (reportId, method, recipient, success) => {
    const message = `Report ${reportId} sent via ${method} to ${recipient}`;
    if (success) {
        logger.info(`${message} - SUCCESS`);
    }
    else {
        logger.error(`${message} - FAILED`);
    }
};
exports.logReportSent = logReportSent;
// Export du logger principal pour usage direct
exports.default = logger;
//# sourceMappingURL=logger.js.map