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
/**
 * Instance du logger Winston
 */
declare const logger: winston.Logger;
/**
 * Wrapper pour logger les requêtes HTTP
 * @param method - Méthode HTTP (GET, POST, etc.)
 * @param url - URL de la requête
 * @param statusCode - Code de statut de la réponse
 * @param duration - Durée de la requête en ms
 */
export declare const logRequest: (method: string, url: string, statusCode: number, duration: number) => void;
/**
 * Logger pour les erreurs avec contexte
 * @param message - Message d'erreur
 * @param error - Objet Error
 * @param context - Contexte additionnel
 */
export declare const logError: (message: string, error: Error, context?: Record<string, any>) => void;
/**
 * Logger pour les opérations de base de données
 * @param operation - Type d'opération (CREATE, READ, UPDATE, DELETE)
 * @param model - Nom du modèle
 * @param details - Détails supplémentaires
 */
export declare const logDatabase: (operation: string, model: string, details?: Record<string, any>) => void;
/**
 * Logger pour les appels API externes
 * @param service - Nom du service externe (GitHub, Twilio, etc.)
 * @param endpoint - Endpoint appelé
 * @param success - Si l'appel a réussi
 * @param details - Détails supplémentaires
 */
export declare const logExternalAPI: (service: string, endpoint: string, success: boolean, details?: Record<string, any>) => void;
/**
 * Logger pour les événements d'authentification
 * @param event - Type d'événement (LOGIN, LOGOUT, REGISTER, etc.)
 * @param userId - ID de l'utilisateur
 * @param details - Détails supplémentaires
 */
export declare const logAuth: (event: string, userId?: string, details?: Record<string, any>) => void;
/**
 * Logger pour les envois de rapports
 * @param reportId - ID du rapport
 * @param method - Méthode d'envoi (email ou whatsapp)
 * @param recipient - Destinataire
 * @param success - Si l'envoi a réussi
 */
export declare const logReportSent: (reportId: string, method: string, recipient: string, success: boolean) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map