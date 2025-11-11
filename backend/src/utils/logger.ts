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

import winston from 'winston';
import { config } from '../config/env';

/**
 * Format personnalisé pour les logs en développement
 * Affiche les logs de manière lisible avec couleurs
 */
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaString = '';
    if (Object.keys(meta).length > 0) {
      metaString = `\n${JSON.stringify(meta, null, 2)}`;
    }
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  })
);

/**
 * Format pour les logs en production
 * Format JSON pour une meilleure intégration avec les systèmes de monitoring
 */
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Configuration des transports selon l'environnement
 */
const transports: winston.transport[] = [
  // Console transport - toujours actif
  new winston.transports.Console({
    format: config.nodeEnv === 'production' ? prodFormat : devFormat,
  }),
];

/**
 * En production, ajoute des fichiers de logs
 */
if (config.nodeEnv === 'production') {
  transports.push(
    // Fichier pour tous les logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: prodFormat,
    }),
    // Fichier séparé pour les erreurs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: prodFormat,
    })
  );
}

/**
 * Instance du logger Winston
 */
const logger = winston.createLogger({
  level: config.logLevel,
  levels: winston.config.npm.levels,
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
export const logRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number
): void => {
  const message = `${method} ${url} ${statusCode} - ${duration}ms`;

  if (statusCode >= 500) {
    logger.error(message);
  } else if (statusCode >= 400) {
    logger.warn(message);
  } else {
    logger.info(message);
  }
};

/**
 * Logger pour les erreurs avec contexte
 * @param message - Message d'erreur
 * @param error - Objet Error
 * @param context - Contexte additionnel
 */
export const logError = (
  message: string,
  error: Error,
  context?: Record<string, any>
): void => {
  logger.error(message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
};

/**
 * Logger pour les opérations de base de données
 * @param operation - Type d'opération (CREATE, READ, UPDATE, DELETE)
 * @param model - Nom du modèle
 * @param details - Détails supplémentaires
 */
export const logDatabase = (
  operation: string,
  model: string,
  details?: Record<string, any>
): void => {
  logger.debug(`Database ${operation} on ${model}`, details);
};

/**
 * Logger pour les appels API externes
 * @param service - Nom du service externe (GitHub, Twilio, etc.)
 * @param endpoint - Endpoint appelé
 * @param success - Si l'appel a réussi
 * @param details - Détails supplémentaires
 */
export const logExternalAPI = (
  service: string,
  endpoint: string,
  success: boolean,
  details?: Record<string, any>
): void => {
  const message = `External API call to ${service}: ${endpoint}`;

  if (success) {
    logger.info(message, details);
  } else {
    logger.warn(`${message} - FAILED`, details);
  }
};

/**
 * Logger pour les événements d'authentification
 * @param event - Type d'événement (LOGIN, LOGOUT, REGISTER, etc.)
 * @param userId - ID de l'utilisateur
 * @param details - Détails supplémentaires
 */
export const logAuth = (
  event: string,
  userId?: string,
  details?: Record<string, any>
): void => {
  logger.info(`Auth Event: ${event}`, {
    userId,
    ...details,
  });
};

/**
 * Logger pour les envois de rapports
 * @param reportId - ID du rapport
 * @param method - Méthode d'envoi (email ou whatsapp)
 * @param recipient - Destinataire
 * @param success - Si l'envoi a réussi
 */
export const logReportSent = (
  reportId: string,
  method: string,
  recipient: string,
  success: boolean
): void => {
  const message = `Report ${reportId} sent via ${method} to ${recipient}`;

  if (success) {
    logger.info(`${message} - SUCCESS`);
  } else {
    logger.error(`${message} - FAILED`);
  }
};

// Export du logger principal pour usage direct
export default logger;
