/**
 * Service de planification automatique des rapports
 * 
 * Ce service gère :
 * - L'initialisation des cron jobs au démarrage
 * - L'ajout/suppression/mise à jour de jobs
 * - L'exécution manuelle de jobs
 * - Le calcul des prochaines exécutions
 * 
 * @module services/scheduler
 */


import cron from 'node-cron';
const { parseExpression } = require('cron-parser');
import prisma from '../db';
import logger from '../utils/logger';
import templateService from './template.service';
import emailService from './email.service';
import whatsappService from './whatsapp.service';
import { Octokit } from '@octokit/rest';

interface ScheduledJob {
  task: any; // cron.ScheduledTask type definition issue
  scheduleId: string;
}

class SchedulerService {
  private jobs: Map<string, ScheduledJob> = new Map();
  private initialized: boolean = false;

  /**
   * Initialise le scheduler au démarrage de l'application
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('⚠️ Scheduler already initialized');
      return;
    }

    logger.info('⏰ Initializing scheduler...');

    try {
      // Récupérer tous les schedules actifs
      const activeSchedules = await prisma.scheduledReport.findMany({
        where: { isActive: true },
        include: {
          user: true,
          reportTemplate: true
        }
      });

      logger.info(`📋 Found ${activeSchedules.length} active schedules`);

      // Créer un job pour chaque schedule
      for (const schedule of activeSchedules) {
        await this.addJob(schedule);
      }

      this.initialized = true;
      logger.info('✅ Scheduler initialized successfully', { jobCount: this.jobs.size });
    } catch (error) {
      logger.error('❌ Failed to initialize scheduler', { error });
      throw error;
    }
  }

  /**
   * Ajoute un nouveau job au scheduler
   */
  async addJob(schedule: any): Promise<void> {
    try {
      logger.info('➕ Adding job to scheduler', { 
        scheduleId: schedule.id, 
        cronExpression: schedule.cronExpression 
      });

      // Valider l'expression cron
      if (!cron.validate(schedule.cronExpression)) {
        throw new Error(`Invalid cron expression: ${schedule.cronExpression}`);
      }

      // Créer le job
      const task = cron.schedule(schedule.cronExpression, async () => {
        await this.executeJob(schedule.id);
      }, {
        scheduled: true,
        timezone: 'Europe/Paris'
      } as any);

      // Stocker le job
      this.jobs.set(schedule.id, {
        task,
        scheduleId: schedule.id
      });

      // Calculer et sauvegarder la prochaine exécution
      const nextRun = this.getNextRun(schedule.cronExpression);
      await prisma.scheduledReport.update({
        where: { id: schedule.id },
        data: { nextRun }
      });

      logger.info('✅ Job added successfully', { 
        scheduleId: schedule.id,
        nextRun: nextRun.toISOString()
      });
    } catch (error) {
      logger.error('❌ Failed to add job', { scheduleId: schedule.id, error });
      throw error;
    }
  }

  /**
   * Supprime un job du scheduler
   */
  removeJob(scheduleId: string): void {
    logger.info('🗑️ Removing job from scheduler', { scheduleId });

    const job = this.jobs.get(scheduleId);
    if (job) {
      job.task.stop();
      this.jobs.delete(scheduleId);
      logger.info('✅ Job removed successfully', { scheduleId });
    } else {
      logger.warn('⚠️ Job not found', { scheduleId });
    }
  }

  /**
   * Met à jour un job existant
   */
  async updateJob(schedule: any): Promise<void> {
    logger.info('🔄 Updating job', { scheduleId: schedule.id });

    // Supprimer l'ancien job
    this.removeJob(schedule.id);

    // Ajouter le nouveau job si actif
    if (schedule.isActive) {
      await this.addJob(schedule);
    }

    logger.info('✅ Job updated successfully', { scheduleId: schedule.id });
  }

  /**
   * Exécute un job manuellement
   */
  async runJob(scheduleId: string): Promise<void> {
    logger.info('▶️ Running job manually', { scheduleId });
    await this.executeJob(scheduleId);
  }

  /**
   * Exécute un job (logique principale)
   */
  private async executeJob(scheduleId: string): Promise<void> {
    const startTime = Date.now();
    logger.info('🚀 Executing scheduled job', { scheduleId });

    try {
      // Récupérer le schedule avec toutes les relations
      const schedule = await prisma.scheduledReport.findUnique({
        where: { id: scheduleId },
        include: {
          user: true,
          reportTemplate: true
        }
      });

      if (!schedule) {
        throw new Error(`Schedule not found: ${scheduleId}`);
      }

      if (!schedule.isActive) {
        logger.warn('⚠️ Schedule is inactive, skipping execution', { scheduleId });
        return;
      }

      // Déterminer la date de début (since)
      // Si lastRun existe, on prend depuis le dernier run
      // Sinon, on prend 24h en arrière par défaut
      const since = schedule.lastRun 
        ? schedule.lastRun 
        : new Date(Date.now() - 24 * 60 * 60 * 1000);

      logger.info('📊 Fetching commits for scheduled report', {
        scheduleId,
        repoName: schedule.repoName,
        userId: schedule.userId,
        since: since.toISOString()
      });

      // Récupérer les commits du repo
      const octokit = new Octokit({
        auth: schedule.user.githubToken
      });

      const [owner, repo] = schedule.repoName.split('/');
      
      // 1. Récupérer la liste des commits
      const { data: commitsList } = await octokit.repos.listCommits({
        owner,
        repo,
        since: since.toISOString(),
        per_page: 100 // Limite raisonnable pour un rapport
      });

      logger.info(`Found ${commitsList.length} commits since ${since.toISOString()}`);

      // 2. Enrichir les commits avec les stats (files changed, additions, deletions)
      // On le fait en parallèle avec une limite pour ne pas spammer l'API
      const enrichedCommits = await Promise.all(
        commitsList.map(async (c) => {
          try {
            const { data: commitDetail } = await octokit.repos.getCommit({
              owner,
              repo,
              ref: c.sha
            });
            return {
              message: c.commit.message,
              sha: c.sha,
              author: c.commit.author?.name || 'Unknown',
              date: c.commit.author?.date,
              stats: commitDetail.stats || { total: 0, additions: 0, deletions: 0 }
            };
          } catch (e) {
            logger.warn(`Failed to fetch details for commit ${c.sha}`, { error: e });
            return {
              message: c.commit.message,
              sha: c.sha,
              author: c.commit.author?.name || 'Unknown',
              date: c.commit.author?.date,
              stats: { total: 0, additions: 0, deletions: 0 }
            };
          }
        })
      );

      // 3. Calculer les statistiques globales
      const stats = enrichedCommits.reduce((acc, curr) => ({
        linesAdded: acc.linesAdded + (curr.stats.additions || 0),
        linesRemoved: acc.linesRemoved + (curr.stats.deletions || 0),
      }), { linesAdded: 0, linesRemoved: 0 });

      // 4. Grouper les commits par type (Conventional Commits)
      const groupedCommits = {
        feat: [] as string[],
        fix: [] as string[],
        docs: [] as string[],
        other: [] as string[]
      };

      const formatCommit = (c: typeof enrichedCommits[0]) => 
        `- ${c.message.split('\n')[0]} (${c.sha.substring(0, 7)}) par ${c.author}`;

      enrichedCommits.forEach(c => {
        const msg = c.message.toLowerCase();
        const formatted = formatCommit(c);
        
        if (msg.startsWith('feat') || msg.startsWith('feature')) {
          groupedCommits.feat.push(formatted);
        } else if (msg.startsWith('fix') || msg.startsWith('bug')) {
          groupedCommits.fix.push(formatted);
        } else if (msg.startsWith('docs') || msg.startsWith('doc')) {
          groupedCommits.docs.push(formatted);
        } else {
          groupedCommits.other.push(formatted);
        }
      });

      // Préparer les données pour le template
      const templateData = {
        repoName: schedule.repoName,
        commits: enrichedCommits.map(c => ({
          message: c.message,
          sha: c.sha,
          author: c.author
        })),
        commitCount: enrichedCommits.length,
        date: new Date().toLocaleDateString('fr-FR'),
        dateRange: `${since.toLocaleDateString('fr-FR')} - ${new Date().toLocaleDateString('fr-FR')}`,
        contributorCount: new Set(enrichedCommits.map(c => c.author)).size,
        linesAdded: stats.linesAdded,
        linesRemoved: stats.linesRemoved,
        // Variables spécifiques pour les Release Notes
        version: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
        featCommits: groupedCommits.feat.length > 0 ? groupedCommits.feat.join('\n') : '*Aucune nouvelle fonctionnalité*',
        fixCommits: groupedCommits.fix.length > 0 ? groupedCommits.fix.join('\n') : '*Aucun correctif*',
        docsCommits: groupedCommits.docs.length > 0 ? groupedCommits.docs.join('\n') : '*Aucune modification de documentation*',
        otherCommits: groupedCommits.other.join('\n')
      };

      // Générer le contenu du rapport
      let content: string;
      if (schedule.reportTemplate) {
        content = templateService.renderTemplate(schedule.reportTemplate.content, templateData);
        logger.info('📝 Report generated from template', { 
          templateId: schedule.templateId,
          templateName: schedule.reportTemplate.name,
          stats: { linesAdded: stats.linesAdded, linesRemoved: stats.linesRemoved }
        });
      } else {
        // Contenu par défaut si pas de template
        content = `# Rapport automatique - ${schedule.repoName}\n\n` +
                  `Date: ${templateData.date}\n` +
                  `Période: ${templateData.dateRange}\n` +
                  `Commits: ${templateData.commitCount}\n` +
                  `Stats: +${templateData.linesAdded} / -${templateData.linesRemoved}\n\n` +
                  `## Commits\n` +
                  enrichedCommits.map((c, i) => `${i + 1}. ${c.message.split('\n')[0]} - ${c.author}`).join('\n');
        logger.info('📝 Report generated with default format');
      }

      // Envoyer le rapport
      if (schedule.method === 'email') {
        await emailService.sendEmail({
          to: schedule.recipient,
          subject: `Rapport automatique - ${schedule.repoName}`,
          text: content,
          html: content.replace(/\n/g, '<br>')
        });
        logger.info('📧 Report sent via email', { to: schedule.recipient });
      } else if (schedule.method === 'whatsapp') {
        await whatsappService.sendMessage({
          to: schedule.recipient,
          message: content
        });
        logger.info('📱 Report sent via WhatsApp', { to: schedule.recipient });
      }

      // Sauvegarder dans l'historique
      await prisma.report.create({
        data: {
          userId: schedule.userId,
          repoNames: [schedule.repoName],
          content,
          sentTo: schedule.recipient,
          method: schedule.method
        }
      });

      // Mettre à jour lastRun et nextRun
      const nextRun = this.getNextRun(schedule.cronExpression);
      await prisma.scheduledReport.update({
        where: { id: scheduleId },
        data: {
          lastRun: new Date(),
          nextRun
        }
      });

      const duration = Date.now() - startTime;
      logger.info('✅ Job executed successfully', { 
        scheduleId, 
        duration: `${duration}ms`,
        nextRun: nextRun.toISOString()
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('❌ Job execution failed', { 
        scheduleId, 
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Calcule la prochaine exécution d'une expression cron
   */
  getNextRun(cronExpression: string): Date {
    try {
      const interval = parseExpression(cronExpression, {
        tz: 'Europe/Paris'
      });
      return interval.next().toDate();
    } catch (error) {
      logger.error('❌ Failed to parse cron expression', { cronExpression, error });
      throw error;
    }
  }

  /**
   * Génère une plage de dates pour les rapports hebdomadaires
   */
  private getDateRange(): string {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return `${weekAgo.toLocaleDateString('fr-FR')} - ${now.toLocaleDateString('fr-FR')}`;
  }

  /**
   * Arrête tous les jobs
   */
  stopAll(): void {
    logger.info('🛑 Stopping all jobs', { count: this.jobs.size });
    
    this.jobs.forEach((job, scheduleId) => {
      job.task.stop();
      logger.debug('Stopped job', { scheduleId });
    });
    
    this.jobs.clear();
    this.initialized = false;
    
    logger.info('✅ All jobs stopped');
  }

  /**
   * Retourne le statut du scheduler
   */
  getStatus() {
    return {
      initialized: this.initialized,
      activeJobs: this.jobs.size,
      jobs: Array.from(this.jobs.keys())
    };
  }
}

export default new SchedulerService();
