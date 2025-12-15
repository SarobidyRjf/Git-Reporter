import { Resend } from 'resend';
import { config } from '../config/env';
import { EmailOptions } from '../types';
import logger, { logReportSent } from '../utils/logger';

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
 * Utilise l'API Resend pour envoyer des emails transactionnels.
 * Plus fiable et rapide que SMTP sur les environnements cloud.
 */
export class EmailService {
  private resend: Resend | null = null;
  private isMock: boolean;

  /**
   * Constructeur du service Email
   */
  constructor() {
    this.isMock = config.email.mock;

    // Force MOCK si la clé API manque, SAUF si le user a intentionnellement activé le mode mock
    if (!config.email.resendApiKey && !this.isMock) {
        logger.warn('⚠️ RESEND_API_KEY manquante. Bascule automatique en MODE MOCK.');
        this.isMock = true;
    }

    if (this.isMock) {
      logger.warn('⚠️ Email service initialized in MOCK MODE. Emails will be logged but NOT sent.');
    } else {
        this.resend = new Resend(config.email.resendApiKey);
        logger.info('🚀 Email service initialized with Resend API');
    }
  }

  /**
   * Envoie un email via Resend
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, text, html } = options;
      logger.debug('Sending email via Resend', { to, subject });

      // Mode Simulation (Mock)
      if (this.isMock || !this.resend) {
        this.logMockEmail(to, subject, text || html || '');
        return true;
      }

      // Envoi via Resend API
      const response = await this.resend.emails.send({
        from: `${config.email.fromName} <${config.email.fromEmail}>`,
        to: [to],
        subject: subject,
        html: html || text || '',
        text: text || '',
      });

      if (response.error) {
        logger.error('Resend API Error', { error: response.error });
        throw new Error(`Resend Error: ${response.error.message}`);
      }

      logger.info('Email sent successfully via Resend', {
        to,
        subject,
        id: response.data?.id
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email via Resend', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: options.to
      });
      throw error;
    }
  }

  /**
   * Envoie un rapport de commits par email
   */
  async sendReport(options: SendReportOptions): Promise<boolean> {
    try {
      const { to, reportContent, repoName, reportId } = options;
      logger.info('Sending report email', { to, repoName, reportId });

      const subject = `Compte rendu Git - ${repoName}`;
      const html = this.generateReportHTML(reportContent, repoName);
      const text = this.generateReportText(reportContent, repoName);

      await this.sendEmail({ to, subject, text, html });

      if (reportId) logReportSent(reportId, 'email', to, true);
      return true;
    } catch (error) {
      logger.error('Failed to send report email', { to: options.to, repoName: options.repoName });
      if (options.reportId) logReportSent(options.reportId, 'email', options.to, false);
      throw error;
    }
  }

  private generateReportHTML(content: string, repoName: string): string {
    const contentHTML = content
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Compte rendu Git - ${repoName}</title>
    <style>
        body { font-family: -apple-system, system-ui, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e1e4e8; border-top: none; border-radius: 0 0 8px 8px; }
        .commits { background: #f6f8fa; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #888; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🚀 Compte rendu : ${repoName}</h2>
        </div>
        <div class="content">
            <h3>Derniers commits :</h3>
            <div class="commits">
                ${contentHTML}
            </div>
        </div>
        <div class="footer">
            Envoyé par Git Reporter
        </div>
    </div>
</body>
</html>`;
  }

  private generateReportText(content: string, repoName: string): string {
    return `RAPPORT GIT REPORTER\n\nDépôt: ${repoName}\n----------------------------------\n${content}\n----------------------------------\nFin du rapport.`;
  }

  async sendTestEmail(to: string): Promise<boolean> {
    return await this.sendEmail({
      to,
      subject: 'Test Email - Git Reporter (Resend API)',
      html: '<h1>Test Réussi ! 🚀</h1><p>Si vous lisez ceci, l\'API Resend fonctionne parfaitement sur Render.</p>'
    });
  }

  private logMockEmail(to: string, subject: string, content: string) {
    logger.info('📧 [MOCK EMAIL] Simulation d\'envoi', { to, subject });
    console.log('--- MOCK EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('------------------');
  }
}

export default new EmailService();
