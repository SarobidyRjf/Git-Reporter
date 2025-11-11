"use strict";
/**
 * Service WhatsApp pour l'envoi de rapports via Twilio
 *
 * Ce service gère l'envoi de messages WhatsApp en utilisant l'API Twilio.
 * Il permet d'envoyer des rapports de commits directement sur WhatsApp.
 *
 * Documentation Twilio WhatsApp :
 * - https://www.twilio.com/docs/whatsapp/api
 * - https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates
 *
 * Prérequis :
 * - Compte Twilio avec WhatsApp activé
 * - Sandbox WhatsApp configuré (pour le développement)
 * - Numéro WhatsApp vérifié
 *
 * @module services/whatsapp
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsAppService = void 0;
const twilio_1 = __importStar(require("twilio"));
const env_1 = require("../config/env");
const types_1 = require("../types");
const logger_1 = __importStar(require("../utils/logger"));
/**
 * Service WhatsApp
 *
 * Fournit des méthodes pour envoyer des messages WhatsApp via Twilio.
 * Gère automatiquement le formatage et la validation des numéros.
 */
class WhatsAppService {
    client = null;
    isConfigured = false;
    /**
     * Constructeur du service WhatsApp
     *
     * Initialise le client Twilio si les credentials sont configurés.
     * Si la configuration est manquante, le service sera désactivé.
     */
    constructor() {
        try {
            // Vérifie si les credentials Twilio sont configurés
            if (env_1.config.twilio.accountSid &&
                env_1.config.twilio.authToken &&
                env_1.config.twilio.whatsappNumber) {
                this.client = (0, twilio_1.default)(env_1.config.twilio.accountSid, env_1.config.twilio.authToken);
                this.isConfigured = true;
                logger_1.default.info('WhatsApp service initialized successfully', {
                    whatsappNumber: env_1.config.twilio.whatsappNumber,
                });
            }
            else {
                logger_1.default.warn('WhatsApp service not configured - missing Twilio credentials', {
                    hasAccountSid: !!env_1.config.twilio.accountSid,
                    hasAuthToken: !!env_1.config.twilio.authToken,
                    hasWhatsappNumber: !!env_1.config.twilio.whatsappNumber,
                });
            }
        }
        catch (error) {
            logger_1.default.error('Failed to initialize WhatsApp service', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Vérifie si le service WhatsApp est configuré et disponible
     *
     * @returns true si le service est disponible, false sinon
     */
    isAvailable() {
        return this.isConfigured && this.client !== null;
    }
    /**
     * Envoie un message WhatsApp générique
     *
     * @param options - Options d'envoi (destinataire, message)
     * @returns true si l'envoi a réussi, false sinon
     * @throws {Error} Si le service n'est pas configuré ou si l'envoi échoue
     *
     * @example
     * ```typescript
     * const sent = await whatsappService.sendMessage({
     *   to: '+33612345678',
     *   message: 'Hello from Git Reporter!',
     * });
     * ```
     */
    async sendMessage(options) {
        if (!this.isAvailable()) {
            throw new Error('WhatsApp service is not configured. Please check your Twilio credentials.');
        }
        try {
            const { to, message } = options;
            logger_1.default.debug('Sending WhatsApp message', { to });
            // Valide et formate le numéro de téléphone
            const formattedTo = this.formatPhoneNumber(to);
            // Valide le message
            if (!message || message.trim().length === 0) {
                throw new Error('Message cannot be empty');
            }
            // Limite la longueur du message (WhatsApp a une limite de 1600 caractères)
            const truncatedMessage = message.length > 1600 ? message.substring(0, 1597) + '...' : message;
            // Envoie le message via Twilio
            const response = await this.client.messages.create({
                from: env_1.config.twilio.whatsappNumber,
                to: formattedTo,
                body: truncatedMessage,
            });
            logger_1.default.info('WhatsApp message sent successfully', {
                to: formattedTo,
                messageSid: response.sid,
                status: response.status,
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to send WhatsApp message', {
                error: error instanceof Error ? error.message : 'Unknown error',
                to: options.to,
            });
            throw error;
        }
    }
    /**
     * Envoie un rapport de commits par WhatsApp
     *
     * Formate automatiquement le rapport pour WhatsApp (texte brut, emojis).
     *
     * @param options - Options d'envoi du rapport
     * @returns true si l'envoi a réussi, false sinon
     * @throws {Error} Si l'envoi échoue
     *
     * @example
     * ```typescript
     * await whatsappService.sendReport({
     *   to: '+33612345678',
     *   reportContent: 'First commit\nAdded login form\nFixed auth bug',
     *   repoName: 'my-project',
     *   reportId: 'report-123'
     * });
     * ```
     */
    async sendReport(options) {
        if (!this.isAvailable()) {
            throw new Error('WhatsApp service is not configured. Please check your Twilio credentials.');
        }
        try {
            const { to, reportContent, repoName, reportId } = options;
            logger_1.default.info('Sending WhatsApp report', {
                to,
                repoName,
                reportId,
            });
            // Génère le message formaté pour WhatsApp
            const message = this.generateReportMessage(reportContent, repoName);
            // Envoie le message
            await this.sendMessage({ to, message });
            // Log l'envoi du rapport
            if (reportId) {
                (0, logger_1.logReportSent)(reportId, 'whatsapp', to, true);
            }
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to send WhatsApp report', {
                error: error instanceof Error ? error.message : 'Unknown error',
                to: options.to,
                repoName: options.repoName,
                reportId: options.reportId,
            });
            // Log l'échec de l'envoi
            if (options.reportId) {
                (0, logger_1.logReportSent)(options.reportId, 'whatsapp', options.to, false);
            }
            throw error;
        }
    }
    /**
     * Génère le message formaté pour WhatsApp
     *
     * @private
     * @param content - Contenu du rapport
     * @param repoName - Nom du dépôt
     * @returns Message formaté avec emojis
     */
    generateReportMessage(content, repoName) {
        const date = new Date().toLocaleString('fr-FR', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
        return `
📊 *COMPTE RENDU GIT COMMIT*

🗂️ Dépôt : *${repoName}*
📅 Date : ${date}

━━━━━━━━━━━━━━━━━━━━━━

💻 *Derniers commits :*

${content}

━━━━━━━━━━━━━━━━━━━━━━

✅ Rapport généré automatiquement par Git Reporter
    `.trim();
    }
    /**
     * Formate un numéro de téléphone pour WhatsApp
     *
     * Ajoute le préfixe "whatsapp:" si nécessaire et valide le format.
     *
     * @private
     * @param phoneNumber - Numéro de téléphone (format: +33612345678)
     * @returns Numéro formaté pour WhatsApp
     * @throws {Error} Si le numéro est invalide
     */
    formatPhoneNumber(phoneNumber) {
        // Nettoie le numéro
        let cleaned = phoneNumber.trim();
        // Ajoute le préfixe "whatsapp:" si nécessaire
        if (!cleaned.startsWith('whatsapp:')) {
            // Vérifie que le numéro commence par +
            if (!cleaned.startsWith('+')) {
                throw new Error('Phone number must start with + followed by country code (e.g., +33612345678)');
            }
            cleaned = `whatsapp:${cleaned}`;
        }
        // Valide le format du numéro
        const phoneRegex = /^whatsapp:\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(cleaned)) {
            throw new Error('Invalid phone number format. Expected: +[country code][number] (e.g., +33612345678)');
        }
        return cleaned;
    }
    /**
     * Valide un numéro de téléphone pour WhatsApp
     *
     * @param phoneNumber - Numéro à valider
     * @returns true si le numéro est valide, false sinon
     */
    isValidPhoneNumber(phoneNumber) {
        try {
            this.formatPhoneNumber(phoneNumber);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Envoie un message de test
     *
     * Utile pour vérifier la configuration Twilio et WhatsApp.
     *
     * @param to - Numéro de téléphone du destinataire
     * @returns true si l'envoi a réussi, false sinon
     */
    async sendTestMessage(to) {
        if (!this.isAvailable()) {
            throw new Error('WhatsApp service is not configured');
        }
        try {
            return await this.sendMessage({
                to,
                message: '📱 *Test WhatsApp - Git Reporter*\n\n' +
                    'Ceci est un message de test.\n' +
                    'Si vous recevez ce message, votre configuration WhatsApp fonctionne correctement ! ✅\n\n' +
                    `Date : ${new Date().toLocaleString('fr-FR')}`,
            });
        }
        catch (error) {
            logger_1.default.error('Failed to send test WhatsApp message', {
                error: error instanceof Error ? error.message : 'Unknown error',
                to,
            });
            throw error;
        }
    }
    /**
     * Récupère le statut d'un message envoyé
     *
     * @param messageSid - SID du message Twilio
     * @returns Statut du message
     */
    async getMessageStatus(messageSid) {
        if (!this.isAvailable()) {
            throw new Error('WhatsApp service is not configured');
        }
        try {
            const message = await this.client.messages(messageSid).fetch();
            return {
                status: message.status,
                to: message.to,
                from: message.from,
                dateSent: message.dateSent,
            };
        }
        catch (error) {
            logger_1.default.error('Failed to fetch message status', {
                error: error instanceof Error ? error.message : 'Unknown error',
                messageSid,
            });
            return null;
        }
    }
    /**
     * Vérifie la connexion Twilio
     *
     * @returns true si la connexion fonctionne, false sinon
     */
    async testConnection() {
        if (!this.isAvailable()) {
            return false;
        }
        try {
            // Récupère les informations du compte pour vérifier la connexion
            const account = await this.client.api.accounts(env_1.config.twilio.accountSid).fetch();
            logger_1.default.info('Twilio connection test successful', {
                accountSid: account.sid,
                status: account.status,
            });
            return account.status === 'active';
        }
        catch (error) {
            logger_1.default.error('Twilio connection test failed', {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return false;
        }
    }
}
exports.WhatsAppService = WhatsAppService;
// Export d'une instance singleton
exports.default = new WhatsAppService();
//# sourceMappingURL=whatsapp.service.js.map