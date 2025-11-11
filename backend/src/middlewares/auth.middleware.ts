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

import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { AuthenticatedRequest, JWTPayload } from "../types";
import logger, { logAuth } from "../utils/logger";

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
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Extraction du token depuis le header Authorization
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    // Vérification de la présence du token
    if (!token) {
      logger.warn("Authentication failed: No token provided", {
        ip: req.ip,
        path: req.path,
      });

      res.status(401).json({
        success: false,
        error: {
          message: "Token d'authentification manquant",
          code: "NO_TOKEN",
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Vérification et décodage du token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Validation des données du payload
    if (!decoded.userId || !decoded.githubId) {
      logger.warn("Authentication failed: Invalid token payload", {
        ip: req.ip,
        path: req.path,
      });

      res.status(401).json({
        success: false,
        error: {
          message: "Token invalide",
          code: "INVALID_TOKEN_PAYLOAD",
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
    logger.debug("User authenticated successfully", {
      userId: decoded.userId,
      path: req.path,
    });

    next();
  } catch (error) {
    // Gestion des erreurs JWT spécifiques
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("Authentication failed: Invalid token", {
        error: error.message,
        ip: req.ip,
        path: req.path,
      });

      res.status(401).json({
        success: false,
        error: {
          message: "Token invalide",
          code: "INVALID_TOKEN",
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn("Authentication failed: Token expired", {
        ip: req.ip,
        path: req.path,
      });

      res.status(401).json({
        success: false,
        error: {
          message: "Token expiré",
          code: "TOKEN_EXPIRED",
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Erreur inattendue
    logger.error("Authentication error", {
      error: error instanceof Error ? error.message : "Unknown error",
      ip: req.ip,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: {
        message: "Erreur lors de l'authentification",
        code: "AUTH_ERROR",
      },
      timestamp: new Date().toISOString(),
    });
  }
};

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
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

      if (decoded.userId && decoded.githubId) {
        req.user = {
          userId: decoded.userId,
          githubId: decoded.githubId,
        };
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans bloquer la requête
    logger.debug("Optional auth failed, continuing without user", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    next();
  }
};

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
export const generateToken = (userId: string, githubId: string): string => {
  const payload: JWTPayload = {
    userId,
    githubId,
  };

  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);

  logAuth("TOKEN_GENERATED", userId);

  return token;
};

/**
 * Vérifie si un token est valide sans le décoder complètement
 *
 * @param token - Token JWT à vérifier
 * @returns true si le token est valide, false sinon
 */
export const verifyToken = (token: string): boolean => {
  try {
    jwt.verify(token, config.jwt.secret);
    return true;
  } catch {
    return false;
  }
};

/**
 * Décode un token JWT sans le vérifier
 * Utile pour extraire des informations d'un token avant vérification
 *
 * @param token - Token JWT à décoder
 * @returns Payload décodé ou null si le décodage échoue
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};

export default authenticateToken;
