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

import nodemailer, { Transporter } from 'nodemailer';
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
 * Fournit des méthodes pour envoyer des emails de manière sécurisée et robuste.
 * Gère automatiquement la configuration SMTP et le formatage des emails.
 */
export class EmailService {
  private transporter: Transporter;

  /**
   * Constructeur du service Email
   *
   * Initialise le transporteur Nodemailer avec la configuration SMTP.
   * Vérifie la connexion au serveur SMTP au démarrage.
   */
  constructor() {
    if (config.email.mock) {
      // En mode mock, on initialise un transporteur JSON qui ne fait rien
      this.transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      logger.warn('⚠️ Email service initialized in MOCK MODE. Emails will be logged but NOT sent.');
    } else {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure, // true pour 465, false pour autres ports
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
        // Options supplémentaires pour améliorer la fiabilité
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
        rateLimit: 5,
        // Timeouts pour éviter de bloquer indéfiniment
        connectionTimeout: 30000, // 30 secondes
        greetingTimeout: 30000,
        socketTimeout: 30000, 
        // Force IPv4 pour éviter les problèmes de réseau sur certains conteneurs
        family: 4,
        tls: {
          rejectUnauthorized: false
        }
      } as any);

      // Vérifie la connexion SMTP au démarrage
      this.verifyConnection();

      logger.info('Email service initialized', {
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure, // Affiche si SSL est activé
        user: config.email.user,
      });
    }
  }

  /**
   * Vérifie la connexion au serveur SMTP
   *
   * @private
   */
  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified successfully');
    } catch (error) {
      logger.error('Failed to verify SMTP connection', {
        error: error instanceof Error ? error.message : 'Unknown error',
        host: config.email.host,
        port: config.email.port,
      });
    }
  }

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
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, text, html } = options;

      logger.debug('Sending email', { to, subject });

      // Mode Simulation (Mock)
      if (config.email.mock) {
        logger.info('📧 [MOCK EMAIL] Simulation d\'envoi d\'email', {
          to,
          subject,
          text: text?.substring(0, 100) + '...',
        });
        console.log('---------------------------------------------------');
        console.log(`TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`CONTENT: ${text}`);
        console.log('---------------------------------------------------');
        return true;
      }

      // Valide l'adresse email du destinataire
      if (!this.isValidEmail(to)) {
        throw new Error(`Invalid email address: ${to}`);
      }

      // Envoie l'email
      const info = await this.transporter.sendMail({
        from: `"Git Reporter" <${config.email.user}>`,
        to,
        subject,
        text,
        html: html || text,
      });

      logger.info('Email sent successfully', {
        to,
        subject,
        messageId: info.messageId,
        response: info.response,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: options.to,
        subject: options.subject,
      });

      throw error;
    }
  }

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
  async sendReport(options: SendReportOptions): Promise<boolean> {
    try {
      const { to, reportContent, repoName, reportId } = options;

      logger.info('Sending report email', {
        to,
        repoName,
        reportId,
      });

      // Génère le sujet de l'email
      const subject = `Compte rendu Git - ${repoName}`;

      // Génère le contenu HTML
      const html = this.generateReportHTML(reportContent, repoName);

      // Génère le contenu texte brut
      const text = this.generateReportText(reportContent, repoName);

      // Envoie l'email
      await this.sendEmail({
        to,
        subject,
        text,
        html,
      });

      // Log l'envoi du rapport
      if (reportId) {
        logReportSent(reportId, 'email', to, true);
      }

      return true;
    } catch (error) {
      logger.error('Failed to send report email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to: options.to,
        repoName: options.repoName,
        reportId: options.reportId,
      });

      // Log l'échec de l'envoi
      if (options.reportId) {
        logReportSent(options.reportId, 'email', options.to, false);
      }

      throw error;
    }
  }

  /**
   * Génère le contenu HTML pour un rapport
   *
   * @private
   * @param content - Contenu du rapport (texte brut ou Markdown)
   * @param repoName - Nom du dépôt
   * @returns HTML formaté
   */
  private generateReportHTML(content: string, repoName: string): string {
    // Convertit les retours à la ligne en <br>
    const contentHTML = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compte rendu Git - ${repoName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #24292e;
            background-color: #f6f8fa;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .commits {
            background-color: #f6f8fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .commits pre {
            white-space: pre-wrap;
            word-wrap: break-word;
            margin: 0;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 14px;
            line-height: 1.6;
        }
        code {
            background-color: #f6f8fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 13px;
        }
        .footer {
            background-color: #f6f8fa;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #586069;
            border-top: 1px solid #e1e4e8;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .timestamp {
            font-size: 12px;
            color: #6a737d;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Compte rendu Git Commit</h1>
            <p>Dépôt : <strong>${repoName}</strong></p>
        </div>
        <div class="content">
            <h2>Derniers commits :</h2>
            <div class="commits">
                <pre>${contentHTML}</pre>
            </div>
            <div class="timestamp">
                Généré le ${new Date().toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'long',
    })}
            </div>
        </div>
        <div class="footer">
            <p>Ce rapport a été généré automatiquement par <strong>Git Reporter</strong></p>
            <p style="margin-top: 10px;">
                <a href="#">Voir sur GitHub</a> |
                <a href="#">Paramètres</a> |
                <a href="#">Se désabonner</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Génère le contenu texte brut pour un rapport
   *
   * @private
   * @param content - Contenu du rapport
   * @param repoName - Nom du dépôt
   * @returns Texte formaté
   */
  private generateReportText(content: string, repoName: string): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║           COMPTE RENDU GIT COMMIT                            ║
╚══════════════════════════════════════════════════════════════╝

Dépôt : ${repoName}
Date  : ${new Date().toLocaleString('fr-FR')}

────────────────────────────────────────────────────────────────

DERNIERS COMMITS :

${content}

────────────────────────────────────────────────────────────────

Ce rapport a été généré automatiquement par Git Reporter.

    `;
  }

  /**
   * Valide le format d'une adresse email
   *
   * @private
   * @param email - Adresse email à valider
   * @returns true si l'email est valide, false sinon
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Envoie un email de test
   *
   * Utile pour vérifier la configuration SMTP.
   *
   * @param to - Adresse email du destinataire
   * @returns true si l'envoi a réussi, false sinon
   */
  async sendTestEmail(to: string): Promise<boolean> {
    try {
      return await this.sendEmail({
        to,
        subject: 'Test Email - Git Reporter',
        html: `
          <h1>Test Email</h1>
          <p>Ceci est un email de test envoyé depuis Git Reporter.</p>
          <p>Si vous recevez ce message, votre configuration email fonctionne correctement ! ✅</p>
        `,
      });
    } catch (error) {
      logger.error('Failed to send test email', {
        error: error instanceof Error ? error.message : 'Unknown error',
        to,
      });
      throw error;
    }
  }

  /**
   * Ferme le transporteur et libère les ressources
   *
   * À appeler lors de l'arrêt de l'application.
   */
  async close(): Promise<void> {
    try {
      this.transporter.close();
      logger.info('Email service closed successfully');
    } catch (error) {
      logger.error('Error closing email service', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Export d'une instance singleton
export default new EmailService();
