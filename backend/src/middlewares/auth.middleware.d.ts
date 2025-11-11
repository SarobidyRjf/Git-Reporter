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
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest, JWTPayload } from '../types';
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
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
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
export declare const optionalAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
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
export declare const generateToken: (userId: string, githubId: string) => string;
/**
 * Vérifie si un token est valide sans le décoder complètement
 *
 * @param token - Token JWT à vérifier
 * @returns true si le token est valide, false sinon
 */
export declare const verifyToken: (token: string) => boolean;
/**
 * Décode un token JWT sans le vérifier
 * Utile pour extraire des informations d'un token avant vérification
 *
 * @param token - Token JWT à décoder
 * @returns Payload décodé ou null si le décodage échoue
 */
export declare const decodeToken: (token: string) => JWTPayload | null;
export default authenticateToken;
//# sourceMappingURL=auth.middleware.d.ts.map