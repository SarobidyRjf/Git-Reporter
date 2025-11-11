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

import { NextFunction, Request, Response } from "express";
import logger, { logRequest } from "../utils/logger";

/**
 * Interface pour stocker les informations de timing
 */
interface RequestTiming {
  startTime: number;
}

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
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Enregistre le temps de début de la requête
  const startTime = Date.now();

  // Capture l'URL complète
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  // Log de la requête entrante en mode debug
  logger.debug("Incoming request", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });

  // Intercepte la méthode res.json pour logger après l'envoi de la réponse
  const originalJson = res.json.bind(res);
  res.json = function (body: any): Response {
    // Calcule le temps de réponse
    const duration = Date.now() - startTime;

    // Log la requête complétée
    logRequest(req.method, req.originalUrl, res.statusCode, duration);

    // Log additionnel en mode debug avec plus de détails
    if (process.env.LOG_LEVEL === "debug") {
      logger.debug("Request completed", {
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
  res.send = function (body: any): Response {
    const duration = Date.now() - startTime;
    logRequest(req.method, req.originalUrl, res.statusCode, duration);

    if (process.env.LOG_LEVEL === "debug") {
      logger.debug("Request completed (send)", {
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
export const slowRequestLogger = (thresholdMs: number = 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    // Intercepte la fin de la réponse
    res.on("finish", () => {
      const duration = Date.now() - startTime;

      if (duration > thresholdMs) {
        logger.warn("Slow request detected", {
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

/**
 * Middleware pour logger les informations de l'utilisateur authentifié
 *
 * Ajoute l'ID utilisateur aux logs si la requête est authentifiée.
 *
 * @param req - Requête Express (potentiellement authentifiée)
 * @param res - Réponse Express
 * @param next - Fonction Next
 */
export const userContextLogger = (
  req: any,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user && req.user.userId) {
    logger.debug("Authenticated request", {
      userId: req.user.userId,
      method: req.method,
      url: req.originalUrl,
    });
  }

  next();
};

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
export const skipLoggingForPaths = (paths: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Si le path correspond à un des chemins à ignorer, skip le logging
    if (paths.some((path) => req.path === path || req.path.startsWith(path))) {
      (req as any).skipLogging = true;
    }
    next();
  };
};

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
export const bodyParserErrorLogger = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof SyntaxError && "body" in err) {
    logger.error("Body parsing error", {
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      type: (err as any).type || "unknown",
    });

    res.status(400).json({
      success: false,
      error: {
        message: "Format de données invalide",
        code: "INVALID_BODY_FORMAT",
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next(err);
};

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
export const debugHeadersLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.LOG_LEVEL === "debug"
  ) {
    logger.debug("Request headers", {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
    });
  }

  next();
};

export default requestLogger;
