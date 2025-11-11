/**
 * Routes de gestion des rapports
 *
 * Ces routes gèrent toutes les opérations CRUD sur les rapports :
 * - Création et envoi de rapports
 * - Récupération de la liste des rapports
 * - Récupération d'un rapport spécifique
 * - Suppression de rapports
 * - Statistiques utilisateur
 *
 * @module routes/reports
 */

import { Router } from "express";
import {
    createReport,
    deleteReport,
    getReport,
    getReports,
    getUserStats,
} from "../controllers/reports.controller";
import authenticateToken from "../middlewares/auth.middleware";

const router = Router();

/**
 * Toutes les routes de rapports nécessitent une authentification
 */
router.use(authenticateToken);

/**
 * @route   GET /api/reports/stats
 * @desc    Récupère les statistiques des rapports de l'utilisateur
 * @access  Private
 */
router.get("/stats", getUserStats);

/**
 * @route   GET /api/reports
 * @desc    Récupère la liste des rapports avec pagination et filtres
 * @access  Private
 * @query   page - Numéro de page (défaut: 1)
 * @query   limit - Nombre d'éléments par page (défaut: 10)
 * @query   repoName - Filtrer par nom de dépôt
 * @query   method - Filtrer par méthode (email/whatsapp)
 */
router.get("/", getReports);

/**
 * @route   POST /api/reports
 * @desc    Crée et envoie un nouveau rapport
 * @access  Private
 * @body    repoName - Nom du dépôt
 * @body    content - Contenu du rapport
 * @body    method - Méthode d'envoi (email ou whatsapp)
 * @body    sentTo - Destinataire (email ou numéro)
 */
router.post("/", createReport);

/**
 * @route   GET /api/reports/:id
 * @desc    Récupère les détails d'un rapport spécifique
 * @access  Private
 * @param   id - ID du rapport
 */
router.get("/:id", getReport);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Supprime un rapport
 * @access  Private
 * @param   id - ID du rapport
 */
router.delete("/:id", deleteReport);

export default router;
