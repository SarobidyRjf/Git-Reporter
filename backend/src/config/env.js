"use strict";
/**
 * Configuration centralisée des variables d'environnement
 *
 * Ce fichier charge et valide toutes les variables d'environnement nécessaires
 * au bon fonctionnement de l'application.
 *
 * @module config/env
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Charge les variables d'environnement depuis le fichier .env
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
/**
 * Fonction de validation des variables d'environnement requises
 * @throws {Error} Si une variable requise est manquante
 */
const validateEnv = () => {
    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'FRONTEND_URL'
    ];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}\n` +
            'Please create a .env file based on .env.example');
    }
};
/**
 * Fonction utilitaire pour obtenir une variable d'environnement avec une valeur par défaut
 */
const getEnvVar = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
};
// Valide les variables d'environnement au démarrage
validateEnv();
/**
 * Configuration de l'application exportée
 */
exports.config = {
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    databaseUrl: getEnvVar('DATABASE_URL'),
    github: {
        clientId: process.env.GITHUB_CLIENT_ID || '',
        clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback',
    },
    jwt: {
        secret: getEnvVar('JWT_SECRET'),
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },
    frontendUrl: getEnvVar('FRONTEND_URL'),
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER || '',
        password: process.env.EMAIL_PASSWORD || '',
    },
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID || '',
        authToken: process.env.TWILIO_AUTH_TOKEN || '',
        whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || '',
    },
    logLevel: process.env.LOG_LEVEL || 'info',
};
/**
 * Vérifie si l'application est en mode développement
 */
const isDevelopment = () => exports.config.nodeEnv === 'development';
exports.isDevelopment = isDevelopment;
/**
 * Vérifie si l'application est en mode production
 */
const isProduction = () => exports.config.nodeEnv === 'production';
exports.isProduction = isProduction;
/**
 * Vérifie si l'application est en mode test
 */
const isTest = () => exports.config.nodeEnv === 'test';
exports.isTest = isTest;
exports.default = exports.config;
//# sourceMappingURL=env.js.map