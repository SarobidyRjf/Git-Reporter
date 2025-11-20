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

import { NextFunction, Request, Response } from 'express';
import { config } from '../config/env';
import { Prisma } from '@prisma/client';
import { ErrorResponse } from '../types';
import logger, { logError } from '../utils/logger';

/**
 * Interface pour les erreurs personnalisées avec statut HTTP
 */
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Classe d'erreur personnalisée pour les erreurs opérationnelles
 */
export class OperationalError extends Error implements AppError {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean = true;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'OperationalError';

    // Maintient la stack trace correcte
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreurs spécifiques pour différents cas d'usage
 */
export class NotFoundError extends OperationalError {
  constructor(resource: string = 'Ressource') {
    super(`${resource} non trouvée`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends OperationalError {
  constructor(message: string = 'Données invalides') {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends OperationalError {
  constructor(message: string = 'Non autorisé') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends OperationalError {
  constructor(message: string = 'Accès interdit') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends OperationalError {
  constructor(message: string = 'Conflit détecté') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Détermine si une erreur est une erreur opérationnelle attendue
 */
const isOperationalError = (error: Error): boolean => {
  if (error instanceof OperationalError) {
    return error.isOperational;
  }
  return false;
};

/**
 * Gère les erreurs Prisma spécifiques et les convertit en erreurs opérationnelles
 */
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002':
      // Violation de contrainte unique
      const target = (error.meta?.target as string[]) || [];
      return new ConflictError(
        `Un enregistrement avec ce ${target.join(', ')} existe déjà`
      );

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
      logger.error('Unhandled Prisma error', { code: error.code, meta: error.meta });
      return {
        name: 'DatabaseError',
        message: 'Erreur de base de données',
        statusCode: 500,
        code: 'DATABASE_ERROR',
      } as AppError;
  }
};

/**
 * Formate une réponse d'erreur standardisée
 */
const formatErrorResponse = (
  error: AppError,
  includeStack: boolean = false
): ErrorResponse => {
  const response: ErrorResponse = {
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
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Si les headers ont déjà été envoyés, délègue à Express
  if (res.headersSent) {
    return next(err);
  }

  let error: AppError = err as AppError;

  // Gestion des erreurs Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    error = new ValidationError('Erreur de validation des données');
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    error = {
      name: 'DatabaseConnectionError',
      message: 'Impossible de se connecter à la base de données',
      statusCode: 503,
      code: 'DATABASE_CONNECTION_ERROR',
    } as AppError;
  }

  // Définit le statut code par défaut si non défini
  const statusCode = error.statusCode || 500;

  // Log l'erreur selon sa sévérité
  if (statusCode >= 500) {
    // Erreurs serveur - log complet avec stack trace
    logError('Server error', err, {
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: (req as any).user?.userId,
    });
  } else if (statusCode >= 400) {
    // Erreurs client - log warning
    logger.warn('Client error', {
      message: error.message,
      code: error.code,
      path: req.path,
      method: req.method,
      statusCode,
    });
  }

  // Détermine si on doit inclure les détails (mode développement uniquement)
  const includeDetails = config.nodeEnv === 'development';

  // Formate et envoie la réponse d'erreur
  const errorResponse = formatErrorResponse(error, includeDetails);
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware pour gérer les routes non trouvées (404)
 *
 * Ce middleware doit être ajouté après toutes les routes définies
 * mais avant le middleware errorHandler.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
};

/**
 * Gestionnaire d'erreurs non gérées (uncaught exceptions)
 * À appeler au démarrage de l'application
 */
export const handleUncaughtExceptions = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', {
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

/**
 * Gestionnaire de rejets de promesses non gérés (unhandled promise rejections)
 * À appeler au démarrage de l'application
 */
export const handleUnhandledRejections = (): void => {
  process.on('unhandledRejection', (reason: Error | any) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', {
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

/**
 * Gestionnaire de signal SIGTERM (pour les arrêts gracieux)
 */
export const handleSIGTERM = (cleanup?: () => Promise<void>): void => {
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');

    if (cleanup) {
      try {
        await cleanup();
        logger.info('Cleanup completed successfully');
      } catch (error) {
        logger.error('Error during cleanup', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    process.exit(0);
  });
};

/**
 * Initialise tous les gestionnaires d'erreurs globaux
 */
export const initializeErrorHandlers = (cleanup?: () => Promise<void>): void => {
  handleUncaughtExceptions();
  handleUnhandledRejections();
  handleSIGTERM(cleanup);
};

export default errorHandler;
