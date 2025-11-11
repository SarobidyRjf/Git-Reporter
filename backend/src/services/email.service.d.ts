/**
 * Service Email pour l'envoi de rapports par email avec Nodemailer
 *
 * Ce service gère l'envoi d'emails en utilisant Nodemailer.
 * Il supporte différents fournisseurs SMTP (Gmail, SendGrid, etc.)
 *
 * Documentation Nodemailer :
 * - https://nodemailer.com/about/
 * - https://nodemailer.com/smtp/
 *
 * Pour Gmail, il est nécessaire d'utiliser un mot de passe d'application :
 * https://support.google.com/accounts/answer/185833
 *
 * @module services/email
 */
import { EmailOptions } from '../types';
/**
 * Interface pour les options d'envoi de rapport par email
 */
interface SendReportOptions {
    to: string;
    reportContent: string;
    repoName: string;
    reportId?: string;
}
/**
 * Service Email
 *
 * Fournit des méthodes pour envoyer des emails de manière sécurisée et robuste.
 * Gère automatiquement la configuration SMTP et le formatage des emails.
 */
export declare class EmailService {
    private transporter;
    /**
     * Constructeur du service Email
     *
     * Initialise le transporteur Nodemailer avec la configuration SMTP.
     * Vérifie la connexion au serveur SMTP au démarrage.
     */
    constructor();
    /**
     * Vérifie la connexion au serveur SMTP
     *
     * @private
     */
    private verifyConnection;
    /**
     * Envoie un email générique
     *
     * @param options - Options d'envoi (destinataire, sujet, contenu)
     * @returns true si l'envoi a réussi, false sinon
     * @throws {Error} Si l'envoi échoue
     *
     * @example
     * ```typescript
     * const sent = await emailService.sendEmail({
     *   to: 'user@example.com',
     *   subject: 'Test Email',
     *   html: '<h1>Hello World</h1>',
     * });
     * ```
     */
    sendEmail(options: EmailOptions): Promise<boolean>;
    /**
     * Envoie un rapport de commits par email
     *
     * Formate automatiquement le rapport en HTML et texte brut.
     *
     * @param options - Options d'envoi du rapport
     * @returns true si l'envoi a réussi, false sinon
     * @throws {Error} Si l'envoi échoue
     *
     * @example
     * ```typescript
     * await emailService.sendReport({
     *   to: 'manager@company.com',
     *   reportContent: 'First commit\nAdded login form\nFixed auth bug',
     *   repoName: 'my-project',
     *   reportId: 'report-123'
     * });
     * ```
     */
    sendReport(options: SendReportOptions): Promise<boolean>;
    /**
     * Génère le contenu HTML pour un rapport
     *
     * @private
     * @param content - Contenu du rapport (texte brut ou Markdown)
     * @param repoName - Nom du dépôt
     * @returns HTML formaté
     */
    private generateReportHTML;
    /**
     * Génère le contenu texte brut pour un rapport
     *
     * @private
     * @param content - Contenu du rapport
     * @param repoName - Nom du dépôt
     * @returns Texte formaté
     */
    private generateReportText;
    /**
     * Valide le format d'une adresse email
     *
     * @private
     * @param email - Adresse email à valider
     * @returns true si l'email est valide, false sinon
     */
    private isValidEmail;
    /**
     * Envoie un email de test
     *
     * Utile pour vérifier la configuration SMTP.
     *
     * @param to - Adresse email du destinataire
     * @returns true si l'envoi a réussi, false sinon
     */
    sendTestEmail(to: string): Promise<boolean>;
    /**
     * Ferme le transporteur et libère les ressources
     *
     * À appeler lors de l'arrêt de l'application.
     */
    close(): Promise<void>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=email.service.d.ts.map