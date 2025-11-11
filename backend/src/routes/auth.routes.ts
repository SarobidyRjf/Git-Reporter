/**
 * Routes d'authentification GitHub OAuth
 *
 * Ces routes gèrent le flux complet d'authentification OAuth avec GitHub :
 * - Initiation de l'authentification
 * - Callback OAuth
 * - Récupération des informations utilisateur
 * - Déconnexion
 * - Vérification du token
 *
 * @module routes/auth
 */

import { Router } from "express";
import {
    getCurrentUser,
    githubCallback,
    githubLogin,
    logout,
    verifyToken,
} from "../controllers/auth.controller";
import authenticateToken, {
    optionalAuth,
} from "../middlewares/auth.middleware";

const router = Router();

/**
 * @route   GET /api/auth/github/login
 * @desc    Initie le flux d'authentification OAuth GitHub
 * @access  Public
 */
router.get("/github/login", githubLogin);

/**
 * @route   GET /api/auth/github/callback
 * @desc    Callback OAuth GitHub - reçoit le code d'autorisation
 * @access  Public
 */
router.get("/github/callback", githubCallback);

/**
 * @route   GET /api/auth/me
 * @desc    Récupère les informations de l'utilisateur authentifié
 * @access  Private
 */
router.get("/me", authenticateToken, getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnecte l'utilisateur (côté client supprime le token)
 * @access  Private
 */
router.post("/logout", authenticateToken, logout);

/**
 * @route   GET /api/auth/verify
 * @desc    Vérifie la validité d'un token JWT
 * @access  Public (avec optional auth)
 */
router.get("/verify", optionalAuth, verifyToken);

export default router;
