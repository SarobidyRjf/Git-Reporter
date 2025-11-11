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

import cors from "cors";
import express, { Application } from "express";
import { config } from "./config/env";
import prisma from "./db";
import {
  errorHandler,
  initializeErrorHandlers,
  notFoundHandler,
} from "./middlewares/error.middleware";
import {
  bodyParserErrorLogger,
  requestLogger,
  slowRequestLogger,
} from "./middlewares/logger.middleware";
import authRoutes from "./routes/auth.routes";
import githubRoutes from "./routes/github.routes";
import reportsRoutes from "./routes/reports.routes";
import logger from "./utils/logger";

/**
 * Initialise et configure l'application Express
 */
const initializeApp = (): Application => {
  const app = express();

  // ============================================================================
  // Middlewares globaux
  // ============================================================================

  // CORS - Permet les requêtes depuis le frontend
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // Parsing du body JSON
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Logging des requêtes
  app.use(requestLogger);
  app.use(slowRequestLogger(1000)); // Alerte si requête > 1s

  // Gestion des erreurs de parsing du body
  app.use(bodyParserErrorLogger);

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
      await prisma.$queryRaw`SELECT 1`;

      res.json({
        success: true,
        data: {
          status: "healthy",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: config.nodeEnv,
        },
      });
    } catch (error) {
      logger.error("Health check failed", {
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
  app.use("/api/auth", authRoutes);

  /**
   * Routes GitHub API
   */
  app.use("/api/github", githubRoutes);

  /**
   * Routes de gestion des rapports
   */
  app.use("/api/reports", reportsRoutes);

  /**
   * Routes de test pour l'envoi d'emails et WhatsApp
   * À utiliser uniquement en développement
   */
  if (config.nodeEnv === "development") {
    app.post("/api/test/email", async (req, res) => {
      try {
        const { to } = req.body;

        if (!to) {
          return res.status(400).json({
            success: false,
            error: { message: "Email address required" },
          });
        }

        // TODO: Implémenter l'envoi de test
        return res.json({
          success: true,
          message: "Test email endpoint",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: { message: "Failed to send test email" },
        });
      }
    });

    app.post("/api/test/whatsapp", async (req, res) => {
      try {
        const { to } = req.body;

        if (!to) {
          return res.status(400).json({
            success: false,
            error: { message: "Phone number required" },
          });
        }

        // TODO: Implémenter l'envoi de test
        return res.json({
          success: true,
          message: "Test WhatsApp endpoint",
        });
      } catch (error) {
        return res.status(500).json({
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
  app.use(notFoundHandler);

  // Middleware de gestion d'erreurs - doit être le dernier
  app.use(errorHandler);

  return app;
};

/**
 * Démarre le serveur et initialise les connexions
 */
const startServer = async (): Promise<void> => {
  try {
    // Initialise les gestionnaires d'erreurs globaux
    initializeErrorHandlers(async () => {
      // Cleanup lors de l'arrêt gracieux
      logger.info("Closing database connection...");
      await prisma.$disconnect();
      logger.info("Database connection closed");
    });

    // Teste la connexion à la base de données
    logger.info("Testing database connection...");
    await prisma.$connect();
    logger.info("Database connected successfully");

    // Initialise l'application Express
    const app = initializeApp();

    // Démarre le serveur
    const server = app.listen(config.port, () => {
      logger.info("🚀 Git Reporter API started successfully", {
        port: config.port,
        environment: config.nodeEnv,
        nodeVersion: process.version,
        platform: process.platform,
      });

      logger.info(`📡 Server running at http://localhost:${config.port}`);
      logger.info(`🏥 Health check: http://localhost:${config.port}/health`);
      logger.info(`📚 API documentation: http://localhost:${config.port}/`);

      // Affiche les URLs importantes
      if (config.nodeEnv === "development") {
        logger.info("🔧 Development mode - Additional endpoints available");
        logger.info(
          `   Test Email: http://localhost:${config.port}/api/test/email`,
        );
        logger.info(
          `   Test WhatsApp: http://localhost:${config.port}/api/test/whatsapp`,
        );
      }

      // Affiche des warnings si certaines configurations sont manquantes
      if (!config.github.clientId || !config.github.clientSecret) {
        logger.warn(
          "⚠️  GitHub OAuth not configured - authentication will not work",
        );
      }

      if (!config.email.user || !config.email.password) {
        logger.warn(
          "⚠️  Email service not configured - email sending will not work",
        );
      }

      if (!config.twilio.accountSid || !config.twilio.authToken) {
        logger.warn(
          "⚠️  Twilio not configured - WhatsApp sending will not work",
        );
      }
    });

    // Gestion de l'arrêt gracieux
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await prisma.$disconnect();
          logger.info("Database connection closed");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          process.exit(1);
        }
      });

      // Force l'arrêt après 10 secondes
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Écoute les signaux d'arrêt
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Ferme la connexion à la base de données en cas d'erreur
    await prisma.$disconnect();

    process.exit(1);
  }
};

// Démarre le serveur
startServer();

// Export de l'application pour les tests
export default initializeApp;
