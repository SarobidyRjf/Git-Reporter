/**
 * Configuration centralisée des variables d'environnement
 *
 * Ce fichier charge et valide toutes les variables d'environnement nécessaires
 * au bon fonctionnement de l'application.
 *
 * @module config/env
 */
/**
 * Interface définissant la structure de la configuration de l'application
 */
interface EnvConfig {
    port: number;
    nodeEnv: string;
    databaseUrl: string;
    github: {
        clientId: string;
        clientSecret: string;
        callbackUrl: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    frontendUrl: string;
    email: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
    };
    twilio: {
        accountSid: string;
        authToken: string;
        whatsappNumber: string;
    };
    logLevel: string;
}
/**
 * Configuration de l'application exportée
 */
export declare const config: EnvConfig;
/**
 * Vérifie si l'application est en mode développement
 */
export declare const isDevelopment: () => boolean;
/**
 * Vérifie si l'application est en mode production
 */
export declare const isProduction: () => boolean;
/**
 * Vérifie si l'application est en mode test
 */
export declare const isTest: () => boolean;
export default config;
//# sourceMappingURL=env.d.ts.map