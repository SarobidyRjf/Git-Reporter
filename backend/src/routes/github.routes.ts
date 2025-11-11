/**
 * Routes GitHub pour la gestion des dépôts et commits
 *
 * Ces routes permettent d'interagir avec l'API GitHub :
 * - Récupération des dépôts de l'utilisateur
 * - Récupération des commits d'un dépôt
 * - Formatage des commits pour les rapports
 *
 * @module routes/github
 */

import { Router } from "express";
import {
    formatCommitsForReport,
    getRepositoryCommits,
    getUserRepositories,
} from "../controllers/github.controller";
import authenticateToken from "../middlewares/auth.middleware";

const router = Router();

/**
 * Toutes les routes GitHub nécessitent une authentification
 */
router.use(authenticateToken);

/**
 * @route   GET /api/github/repos
 * @desc    Récupère la liste des dépôts de l'utilisateur
 * @access  Private
 * @query   page - Numéro de page (défaut: 1)
 * @query   perPage - Nombre de dépôts par page (défaut: 30)
 * @query   sort - Tri (created, updated, pushed, full_name)
 * @query   direction - Direction (asc, desc)
 */
router.get("/repos", getUserRepositories);

/**
 * @route   GET /api/github/commits/:owner/:repo
 * @desc    Récupère les commits d'un dépôt spécifique
 * @access  Private
 * @param   owner - Propriétaire du dépôt
 * @param   repo - Nom du dépôt
 * @query   since - Date de début (ISO 8601)
 * @query   until - Date de fin (ISO 8601)
 * @query   page - Numéro de page
 * @query   perPage - Commits par page
 */
router.get("/commits/:owner/:repo", getRepositoryCommits);

/**
 * @route   POST /api/github/format-commits
 * @desc    Formate une liste de commits en texte pour un rapport
 * @access  Private
 * @body    commits - Liste des commits à formater
 * @body    repoName - Nom du dépôt
 */
router.post("/format-commits", formatCommitsForReport);

export default router;
