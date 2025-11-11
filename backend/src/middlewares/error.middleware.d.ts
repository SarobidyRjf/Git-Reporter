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
export declare class OperationalError extends Error implements AppError {
    readonly statusCode: number;
    readonly code?: string;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string);
}
/**
 * Erreurs spécifiques pour différents cas d'usage
 */
export declare class NotFoundError extends OperationalError {
    constructor(resource?: string);
}
export declare class ValidationError extends OperationalError {
    constructor(message?: string);
}
export declare class UnauthorizedError extends OperationalError {
    constructor(message?: string);
}
export declare class ForbiddenError extends OperationalError {
    constructor(message?: string);
}
export declare class ConflictError extends OperationalError {
    constructor(message?: string);
}
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
export declare const errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware pour gérer les routes non trouvées (404)
 *
 * Ce middleware doit être ajouté après toutes les routes définies
 * mais avant le middleware errorHandler.
 */
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Gestionnaire d'erreurs non gérées (uncaught exceptions)
 * À appeler au démarrage de l'application
 */
export declare const handleUncaughtExceptions: () => void;
/**
 * Gestionnaire de rejets de promesses non gérés (unhandled promise rejections)
 * À appeler au démarrage de l'application
 */
export declare const handleUnhandledRejections: () => void;
/**
 * Gestionnaire de signal SIGTERM (pour les arrêts gracieux)
 */
export declare const handleSIGTERM: (cleanup?: () => Promise<void>) => void;
/**
 * Initialise tous les gestionnaires d'erreurs globaux
 */
export declare const initializeErrorHandlers: (cleanup?: () => Promise<void>) => void;
export default errorHandler;
//# sourceMappingURL=error.middleware.d.ts.map