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

import twilio, { Twilio } from 'twilio';
import { config } from '../config/env';
import { WhatsAppOptions } from '../types';
import logger, { logReportSent } from '../utils/logger';

/**
 * Interface pour les options d'envoi de rapport WhatsApp
 */
interface SendReportOptions {
  to: string;
  reportContent: string;
  repoName: string;
  reportId?: string;
}

/**
 * Interface pour la réponse de Twilio
 */
interface TwilioMessageResponse {
  sid: string;
  status: string;
  to: string;
  from: string;
  body: string;
}

/**
 * Service WhatsApp
 *
 * Fournit des méthodes pour envoyer des messages WhatsApp via Twilio.
 * Gère automatiquement le formatage et la validation des numéros.
 */
export class WhatsAppService {
  private client: Twilio | null = null;
  private isConfigured: boolean = false;

  /**
   * Constructeur du service WhatsApp
   *
   * Initialise le client Twilio si les credentials sont configurés.
   * Si la configuration est manquante, le service sera désactivé.
   */
  constructor() {
    try {
      // Vérifie si les credentials Twilio sont configurés
      if (
        config.twilio.accountSid &&
        config.twilio.authToken &&
        config.twilio.whatsappNumber
      ) {
        this.client = twilio(
          config.twilio.accountSid,
          config.twilio.authToken
        );
        this.isConfigured = true;

        logger.info('WhatsApp service initialized successfully', {
          whatsappNumber: config.twilio.whatsappNumber,
        });
      } else {
        logger.warn(
          'WhatsApp service not configured - missing Twilio credentials',
          {
            hasAccountSid: !!config.twilio.accountSid,
            hasAuthToken: !!config.twilio.authToken,
            hasWhatsappNumber: !!config.twilio.whatsappNumber,
          }
        );
      }
    } catch (error) {
      logger.error('Failed to initialize WhatsApp service', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Vérifie si le service WhatsApp est configuré et disponible
   *
   * @returns true si le service est disponible, false sinon
   */
  isAvailable(): boolean {
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
  async sendMessage(options: WhatsAppOptions): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error(
        'WhatsApp service is not configured. Please check your Twilio credentials.'
      );
    }

    try {
      const { to, message } = options;

      logger.debug('Sending WhatsApp message', { to });

      // Valide et formate le numéro de téléphone
      const formattedTo = this.formatPhoneNumber(to);

      // Valide le message
      if (!message || message.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      // Limite la longueur du message (WhatsApp a une limite de 1600 caractères)
      const truncatedMessage =
        message.length > 1600 ? message.substring(0, 1597) + '...' : message;

      // Envoie le message via Twilio
      const response = await this.client!.messages.create({
        from: config.twilio.whatsappNumber,
        to: formattedTo,
        body: truncatedMessage,
      });

      logger.info('WhatsApp message sent successfully', {
        to: formattedTo,
        messageSid: response.sid,
        status: response.status,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send WhatsApp message', {
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
  async sendReport(options: SendReportOptions): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error(
        'WhatsApp service is not configured. Please check your Twilio credentials.'
      );
    }

    try {
      const { to, reportContent, repoName, reportId } = options;

      logger.info('Sending WhatsApp report', {
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
        logReportSent(reportId, 'whatsapp', to, true);
      }

      return true;
    } catch (error) {
      logger.error('Failed to send WhatsApp report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: options.to,
        repoName: options.repoName,
        reportId: options.reportId,
      });

      // Log l'échec de l'envoi
      if (options.reportId) {
        logReportSent(options.reportId, 'whatsapp', options.to, false);
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
  private generateReportMessage(content: string, repoName: string): string {
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
  private formatPhoneNumber(phoneNumber: string): string {
    // Nettoie le numéro
    let cleaned = phoneNumber.trim();

    // Ajoute le préfixe "whatsapp:" si nécessaire
    if (!cleaned.startsWith('whatsapp:')) {
      // Vérifie que le numéro commence par +
      if (!cleaned.startsWith('+')) {
        throw new Error(
          'Phone number must start with + followed by country code (e.g., +33612345678)'
        );
      }

      cleaned = `whatsapp:${cleaned}`;
    }

    // Valide le format du numéro
    const phoneRegex = /^whatsapp:\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(cleaned)) {
      throw new Error(
        'Invalid phone number format. Expected: +[country code][number] (e.g., +33612345678)'
      );
    }

    return cleaned;
  }

  /**
   * Valide un numéro de téléphone pour WhatsApp
   *
   * @param phoneNumber - Numéro à valider
   * @returns true si le numéro est valide, false sinon
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    try {
      this.formatPhoneNumber(phoneNumber);
      return true;
    } catch {
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
  async sendTestMessage(to: string): Promise<boolean> {
    if (!this.isAvailable()) {
      throw new Error('WhatsApp service is not configured');
    }

    try {
      return await this.sendMessage({
        to,
        message:
          '📱 *Test WhatsApp - Git Reporter*\n\n' +
          'Ceci est un message de test.\n' +
          'Si vous recevez ce message, votre configuration WhatsApp fonctionne correctement ! ✅\n\n' +
          `Date : ${new Date().toLocaleString('fr-FR')}`,
      });
    } catch (error) {
      logger.error('Failed to send test WhatsApp message', {
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
  async getMessageStatus(
    messageSid: string
  ): Promise<{
    status: string;
    to: string;
    from: string;
    dateSent: Date | null;
  } | null> {
    if (!this.isAvailable()) {
      throw new Error('WhatsApp service is not configured');
    }

    try {
      const message = await this.client!.messages(messageSid).fetch();

      return {
        status: message.status,
        to: message.to,
        from: message.from,
        dateSent: message.dateSent,
      };
    } catch (error) {
      logger.error('Failed to fetch message status', {
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
  async testConnection(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Récupère les informations du compte pour vérifier la connexion
      const account = await this.client!.api.accounts(
        config.twilio.accountSid
      ).fetch();

      logger.info('Twilio connection test successful', {
        accountSid: account.sid,
        status: account.status,
      });

      return account.status === 'active';
    } catch (error) {
      logger.error('Twilio connection test failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}

// Export d'une instance singleton
export default new WhatsAppService();
