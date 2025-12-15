/**
 * Configuration centralisée des variables d'environnement
 *
 * Ce fichier charge et valide toutes les variables d'environnement nécessaires
 * au bon fonctionnement de l'application.
 *
 * @module config/env
 */

import dotenv from 'dotenv';
import path from 'path';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Interface définissant la structure de la configuration de l'application
 */
interface EnvConfig {
  // Configuration du serveur
  port: number;
  nodeEnv: string;

  // Configuration de la base de données
  databaseUrl: string;

  // Configuration GitHub OAuth
  github: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };

  // Configuration JWT
  jwt: {
    secret: string;
    expiresIn: string;
  };

  // Configuration Frontend
  frontendUrl: string;

  // Configuration Email
  email: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    resendApiKey: string;
    fromName: string;
    fromEmail: string;
    mock: boolean;
  };

  // Configuration Twilio (WhatsApp)
  twilio: {
    accountSid: string;
    authToken: string;
    whatsappNumber: string;
  };

  // Configuration des logs
  logLevel: string;
}

/**
 * Fonction de validation des variables d'environnement requises
 * @throws {Error} Si une variable requise est manquante
 */
const validateEnv = (): void => {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'FRONTEND_URL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please create a .env file based on .env.example'
    );
  }
};

/**
 * Fonction utilitaire pour obtenir une variable d'environnement avec une valeur par défaut
 */
const getEnvVar = (key: string, defaultValue?: string): string => {
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
export const config: EnvConfig = {
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
    // Resend configuration
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Git Reporter',
    fromEmail: process.env.EMAIL_FROM_EMAIL || 'onboarding@resend.dev', // Email par défaut de Resend
    mock: process.env.EMAIL_MOCK === 'true',
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
export const isDevelopment = (): boolean => config.nodeEnv === 'development';

/**
 * Vérifie si l'application est en mode production
 */
export const isProduction = (): boolean => config.nodeEnv === 'production';

/**
 * Vérifie si l'application est en mode test
 */
export const isTest = (): boolean => config.nodeEnv === 'test';

export default config;
