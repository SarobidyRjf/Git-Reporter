/**
 * Point d'entrée principal de l'application Backend Git Reporter
 *
 * Cette application fournit une API REST pour :
 * - Authentification OAuth GitHub
 * - Récupération des commits Git
 * - Génération et envoi de rapports (Email & WhatsApp)
 * - Gestion de l'historique des rapports
 *
 * Architecture :
 * - Express.js avec TypeScript
 * - Prisma ORM pour PostgreSQL
 * - JWT pour l'authentification
 * - Winston pour les logs structurés
 *
 * @author Git Reporter Team
 * @version 1.0.0
 */
import { Application } from "express";
/**
 * Initialise et configure l'application Express
 */
declare const initializeApp: () => Application;
export default initializeApp;
//# sourceMappingURL=index.d.ts.map