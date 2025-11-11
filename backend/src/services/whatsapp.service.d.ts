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
import { WhatsAppOptions } from '../types';
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
 * Service WhatsApp
 *
 * Fournit des méthodes pour envoyer des messages WhatsApp via Twilio.
 * Gère automatiquement le formatage et la validation des numéros.
 */
export declare class WhatsAppService {
    private client;
    private isConfigured;
    /**
     * Constructeur du service WhatsApp
     *
     * Initialise le client Twilio si les credentials sont configurés.
     * Si la configuration est manquante, le service sera désactivé.
     */
    constructor();
    /**
     * Vérifie si le service WhatsApp est configuré et disponible
     *
     * @returns true si le service est disponible, false sinon
     */
    isAvailable(): boolean;
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
    sendMessage(options: WhatsAppOptions): Promise<boolean>;
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
    sendReport(options: SendReportOptions): Promise<boolean>;
    /**
     * Génère le message formaté pour WhatsApp
     *
     * @private
     * @param content - Contenu du rapport
     * @param repoName - Nom du dépôt
     * @returns Message formaté avec emojis
     */
    private generateReportMessage;
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
    private formatPhoneNumber;
    /**
     * Valide un numéro de téléphone pour WhatsApp
     *
     * @param phoneNumber - Numéro à valider
     * @returns true si le numéro est valide, false sinon
     */
    isValidPhoneNumber(phoneNumber: string): boolean;
    /**
     * Envoie un message de test
     *
     * Utile pour vérifier la configuration Twilio et WhatsApp.
     *
     * @param to - Numéro de téléphone du destinataire
     * @returns true si l'envoi a réussi, false sinon
     */
    sendTestMessage(to: string): Promise<boolean>;
    /**
     * Récupère le statut d'un message envoyé
     *
     * @param messageSid - SID du message Twilio
     * @returns Statut du message
     */
    getMessageStatus(messageSid: string): Promise<{
        status: string;
        to: string;
        from: string;
        dateSent: Date | null;
    } | null>;
    /**
     * Vérifie la connexion Twilio
     *
     * @returns true si la connexion fonctionne, false sinon
     */
    testConnection(): Promise<boolean>;
}
declare const _default: WhatsAppService;
export default _default;
//# sourceMappingURL=whatsapp.service.d.ts.map