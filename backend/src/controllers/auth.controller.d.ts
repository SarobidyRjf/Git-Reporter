/**
 * Controller d'authentification GitHub OAuth
 *
 * Ce controller gère le flux d'authentification OAuth avec GitHub :
 * 1. Redirection vers GitHub pour autorisation
 * 2. Callback avec le code d'autorisation
 * 3. Échange du code contre un token d'accès
 * 4. Récupération des informations utilisateur
 * 5. Création/mise à jour de l'utilisateur en base
 * 6. Génération d'un JWT pour l'authentification
 *
 * @module controllers/auth
 */
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
/**
 * Initie le flux d'authentification OAuth GitHub
 *
 * Génère un état CSRF, le stocke, et redirige l'utilisateur vers GitHub
 * pour autorisation.
 *
 * @route GET /auth/github/login
 * @access Public
 */
export declare const githubLogin: (req: Request, res: Response) => Promise<void>;
/**
 * Callback OAuth GitHub
 *
 * Reçoit le code d'autorisation de GitHub, l'échange contre un token,
 * récupère les informations utilisateur, et crée/met à jour l'utilisateur
 * en base de données.
 *
 * @route GET /auth/github/callback
 * @access Public
 */
export declare const githubCallback: (req: Request, res: Response) => Promise<void>;
/**
 * Récupère les informations de l'utilisateur authentifié
 *
 * @route GET /auth/me
 * @access Private (requires JWT)
 */
export declare const getCurrentUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * Déconnexion de l'utilisateur
 *
 * Côté serveur, il n'y a rien à faire car on utilise des JWT stateless.
 * Le frontend doit simplement supprimer le token.
 *
 * @route POST /auth/logout
 * @access Private (requires JWT)
 */
export declare const logout: (req: AuthenticatedRequest, res: Response) => Promise<void>;
/**
 * Vérifie la validité d'un token JWT
 *
 * @route GET /auth/verify
 * @access Public
 */
export declare const verifyToken: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map