"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importStar(require("express"));
const env_1 = require("./config/env");
const db_1 = __importDefault(require("./db"));
const auth_middleware_1 = __importDefault(require("./middlewares/auth.middleware"));
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
/**
 * Initialise et configure l'application Express
 */
const initializeApp = () => {
    const app = (0, express_1.default)();
    // ============================================================================
    // Middlewares globaux
    // ============================================================================
    // CORS - Permet les requêtes depuis le frontend
    app.use((0, cors_1.default)({
        origin: env_1.config.frontendUrl,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }));
    // Parsing du body JSON
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    // Logging des requêtes
    app.use(logger_middleware_1.requestLogger);
    app.use((0, logger_middleware_1.slowRequestLogger)(1000)); // Alerte si requête > 1s
    // Gestion des erreurs de parsing du body
    app.use(logger_middleware_1.bodyParserErrorLogger);
    // ============================================================================
    // Routes de santé et monitoring
    // ============================================================================
    /**
     * Route de health check
     * Vérifie que l'API est accessible et que la base de données est connectée
     *
     * @route GET /health
     * @access Public
     */
    app.get("/health", async (req, res) => {
        try {
            // Vérifie la connexion à la base de données
            await db_1.default.$queryRaw `SELECT 1`;
            res.json({
                success: true,
                data: {
                    status: "healthy",
                    timestamp: new Date().toISOString(),
                    uptime: process.uptime(),
                    environment: env_1.config.nodeEnv,
                },
            });
        }
        catch (error) {
            logger_1.default.error("Health check failed", {
                error: error instanceof Error ? error.message : "Unknown error",
            });
            res.status(503).json({
                success: false,
                error: {
                    message: "Service unhealthy",
                    code: "UNHEALTHY",
                },
                timestamp: new Date().toISOString(),
            });
        }
    });
    /**
     * Route d'information sur l'API
     *
     * @route GET /
     * @access Public
     */
    app.get("/", (req, res) => {
        res.json({
            success: true,
            data: {
                name: "Git Reporter API",
                version: "1.0.0",
                description: "API pour générer et envoyer des rapports de commits Git",
                documentation: "/api/docs",
                endpoints: {
                    health: "/health",
                    auth: {
                        login: "/api/auth/github/login",
                        callback: "/api/auth/github/callback",
                        me: "/api/auth/me",
                        logout: "/api/auth/logout",
                    },
                    github: {
                        repos: "/api/github/repos",
                        commits: "/api/github/commits/:owner/:repo",
                    },
                    reports: {
                        list: "/api/reports",
                        create: "/api/reports",
                        get: "/api/reports/:id",
                        delete: "/api/reports/:id",
                    },
                },
            },
            timestamp: new Date().toISOString(),
        });
    });
    // ============================================================================
    // Routes API
    // ============================================================================
    /**
     * Routes d'authentification GitHub OAuth
     */
    app.get("/api/auth/github/login", async (req, res) => {
        // TODO: Implémenter githubLogin controller
        res.json({ message: "GitHub login endpoint" });
    });
    app.get("/api/auth/github/callback", async (req, res) => {
        // TODO: Implémenter githubCallback controller
        res.json({ message: "GitHub callback endpoint" });
    });
    app.get("/api/auth/me", auth_middleware_1.default, async (req, res) => {
        // TODO: Implémenter getCurrentUser controller
        res.json({ message: "Get current user endpoint" });
    });
    app.post("/api/auth/logout", auth_middleware_1.default, async (req, res) => {
        // TODO: Implémenter logout controller
        res.json({ message: "Logout endpoint" });
    });
    /**
     * Routes GitHub API
     */
    app.get("/api/github/repos", auth_middleware_1.default, async (req, res) => {
        // TODO: Implémenter getUserRepositories controller
        res.json({ message: "Get user repositories endpoint" });
    });
    app.get("/api/github/commits/:owner/:repo", auth_middleware_1.default, async (req, res) => {
        // TODO: Implémenter getRepositoryCommits controller
        res.json({ message: "Get repository commits endpoint" });
    });
    /**
     * Routes de gestion des rapports
     */
    app.get("/api/reports", auth_middleware_1.default, async (req, res) => {
        // TODO: Implémenter getReports controller
        res.json({ message: "Get reports endpoint" });
    });
    app.post("/api/reports", auth_middleware_1.default, async (req, res) => {
        // TODO: Implémenter createReport controller
        res.json({ message: "Create report endpoint" });
    });
    app.get("/api/reports/:id", auth_middleware_1.default, async (req, res) => {
        // TODO: Implémenter getReport controller
        res.json({ message: "Get report endpoint" });
    });
    app.delete("/api/reports/:id", auth_middleware_1.default, async (req, res) => {
        // TODO: Implémenter deleteReport controller
        res.json({ message: "Delete report endpoint" });
    });
    /**
     * Route de test pour l'envoi d'emails
     * À utiliser uniquement en développement
     */
    if (env_1.config.nodeEnv === "development") {
        app.post("/api/test/email", auth_middleware_1.default, async (req, res) => {
            try {
                const { to } = req.body;
                if (!to) {
                    return res.status(400).json({
                        success: false,
                        error: { message: "Email address required" },
                    });
                }
                // TODO: Implémenter l'envoi de test
                res.json({
                    success: true,
                    message: "Test email endpoint",
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: { message: "Failed to send test email" },
                });
            }
        });
        app.post("/api/test/whatsapp", auth_middleware_1.default, async (req, res) => {
            try {
                const { to } = req.body;
                if (!to) {
                    return res.status(400).json({
                        success: false,
                        error: { message: "Phone number required" },
                    });
                }
                // TODO: Implémenter l'envoi de test
                res.json({
                    success: true,
                    message: "Test WhatsApp endpoint",
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: { message: "Failed to send test WhatsApp" },
                });
            }
        });
    }
    // ============================================================================
    // Gestion des erreurs
    // ============================================================================
    // Route 404 - doit être après toutes les routes définies
    app.use(error_middleware_1.notFoundHandler);
    // Middleware de gestion d'erreurs - doit être le dernier
    app.use(error_middleware_1.errorHandler);
    return app;
};
/**
 * Démarre le serveur et initialise les connexions
 */
const startServer = async () => {
    try {
        // Initialise les gestionnaires d'erreurs globaux
        (0, error_middleware_1.initializeErrorHandlers)(async () => {
            // Cleanup lors de l'arrêt gracieux
            logger_1.default.info("Closing database connection...");
            await db_1.default.$disconnect();
            logger_1.default.info("Database connection closed");
        });
        // Teste la connexion à la base de données
        logger_1.default.info("Testing database connection...");
        await db_1.default.$connect();
        logger_1.default.info("Database connected successfully");
        // Initialise l'application Express
        const app = initializeApp();
        // Démarre le serveur
        const server = app.listen(env_1.config.port, () => {
            logger_1.default.info("🚀 Git Reporter API started successfully", {
                port: env_1.config.port,
                environment: env_1.config.nodeEnv,
                nodeVersion: process.version,
                platform: process.platform,
            });
            logger_1.default.info(`📡 Server running at http://localhost:${env_1.config.port}`);
            logger_1.default.info(`🏥 Health check: http://localhost:${env_1.config.port}/health`);
            logger_1.default.info(`📚 API documentation: http://localhost:${env_1.config.port}/`);
            // Affiche les URLs importantes
            if (env_1.config.nodeEnv === "development") {
                logger_1.default.info("🔧 Development mode - Additional endpoints available");
                logger_1.default.info(`   Test Email: http://localhost:${env_1.config.port}/api/test/email`);
                logger_1.default.info(`   Test WhatsApp: http://localhost:${env_1.config.port}/api/test/whatsapp`);
            }
            // Affiche des warnings si certaines configurations sont manquantes
            if (!env_1.config.github.clientId || !env_1.config.github.clientSecret) {
                logger_1.default.warn("⚠️  GitHub OAuth not configured - authentication will not work");
            }
            if (!env_1.config.email.user || !env_1.config.email.password) {
                logger_1.default.warn("⚠️  Email service not configured - email sending will not work");
            }
            if (!env_1.config.twilio.accountSid || !env_1.config.twilio.authToken) {
                logger_1.default.warn("⚠️  Twilio not configured - WhatsApp sending will not work");
            }
        });
        // Gestion de l'arrêt gracieux
        const gracefulShutdown = async (signal) => {
            logger_1.default.info(`${signal} received, starting graceful shutdown...`);
            server.close(async () => {
                logger_1.default.info("HTTP server closed");
                try {
                    await db_1.default.$disconnect();
                    logger_1.default.info("Database connection closed");
                    process.exit(0);
                }
                catch (error) {
                    logger_1.default.error("Error during shutdown", {
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                    process.exit(1);
                }
            });
            // Force l'arrêt après 10 secondes
            setTimeout(() => {
                logger_1.default.error("Forced shutdown after timeout");
                process.exit(1);
            }, 10000);
        };
        // Écoute les signaux d'arrêt
        process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
        process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    }
    catch (error) {
        logger_1.default.error("Failed to start server", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });
        // Ferme la connexion à la base de données en cas d'erreur
        await db_1.default.$disconnect();
        process.exit(1);
    }
};
// Démarre le serveur
startServer();
// Export de l'application pour les tests
exports.default = initializeApp;
//# sourceMappingURL=index.js.map