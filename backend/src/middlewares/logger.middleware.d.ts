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
import { NextFunction, Request, Response } from 'express';
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
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
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
export declare const slowRequestLogger: (thresholdMs?: number) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware pour logger les informations de l'utilisateur authentifié
 *
 * Ajoute l'ID utilisateur aux logs si la requête est authentifiée.
 *
 * @param req - Requête Express (potentiellement authentifiée)
 * @param res - Réponse Express
 * @param next - Fonction Next
 */
export declare const userContextLogger: (req: any, res: Response, next: NextFunction) => void;
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
export declare const skipLoggingForPaths: (paths: string[]) => (req: Request, res: Response, next: NextFunction) => void;
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
export declare const bodyParserErrorLogger: (err: any, req: Request, res: Response, next: NextFunction) => void;
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
export declare const debugHeadersLogger: (req: Request, res: Response, next: NextFunction) => void;
export default requestLogger;
//# sourceMappingURL=logger.middleware.d.ts.map