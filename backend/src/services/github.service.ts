/**
 * Service GitHub pour l'authentification OAuth et l'interaction avec l'API GitHub
 *
 * Ce service gère :
 * - L'authentification OAuth avec GitHub
 * - La récupération des informations utilisateur
 * - La récupération des dépôts
 * - La récupération des commits
 *
 * Documentation API GitHub :
 * - OAuth: https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps
 * - REST API: https://docs.github.com/en/rest
 *
 * @module services/github
 */

import axios, { AxiosError } from 'axios';
import { config } from '../config/env';
import {
  GetCommitsParams,
  GitCommit,
  GitHubAccessToken,
  GitHubRepository,
  GitHubUser,
} from '../types';
import logger, { logExternalAPI } from '../utils/logger';

/**
 * URL de base de l'API GitHub
 */
const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_OAUTH_BASE_URL = 'https://github.com/login/oauth';

/**
 * Interface pour les erreurs de l'API GitHub
 */
interface GitHubAPIError {
  message: string;
  documentation_url?: string;
}

/**
 * Service GitHub
 *
 * Fournit des méthodes pour interagir avec l'API GitHub de manière sécurisée et robuste.
 * Toutes les requêtes sont loggées pour faciliter le débogage.
 */
export class GitHubService {
  /**
   * Génère l'URL d'authentification OAuth GitHub
   *
   * @param state - État aléatoire pour la sécurité CSRF
   * @returns URL d'authentification GitHub
   *
   * @example
   * ```typescript
   * const authUrl = GitHubService.getAuthorizationUrl('random-state-123');
   * // Redirige l'utilisateur vers authUrl
   * ```
   */
  static getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: config.github.callbackUrl,
      scope: 'user:email,repo,read:user',
      state,
    });

    const url = `${GITHUB_OAUTH_BASE_URL}/authorize?${params.toString()}`;

    logger.debug('Generated GitHub authorization URL', { state });

    return url;
  }

  /**
   * Échange le code d'autorisation contre un token d'accès
   *
   * @param code - Code d'autorisation reçu de GitHub
   * @returns Token d'accès GitHub
   * @throws {Error} Si l'échange échoue
   *
   * @example
   * ```typescript
   * const accessToken = await GitHubService.getAccessToken(authCode);
   * ```
   */
  static async getAccessToken(code: string): Promise<string> {
    try {
      logger.debug('Exchanging GitHub authorization code for access token');

      const response = await axios.post<GitHubAccessToken>(
        `${GITHUB_OAUTH_BASE_URL}/access_token`,
        {
          client_id: config.github.clientId,
          client_secret: config.github.clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      logExternalAPI('GitHub', '/login/oauth/access_token', true);

      if (!response.data.access_token) {
        throw new Error('No access token received from GitHub');
      }

      logger.info('Successfully obtained GitHub access token');

      return response.data.access_token;
    } catch (error) {
      logExternalAPI('GitHub', '/login/oauth/access_token', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<GitHubAPIError>;
        throw new Error(
          `Failed to get GitHub access token: ${axiosError.response?.data?.message || axiosError.message}`
        );
      }

      throw new Error('Failed to get GitHub access token');
    }
  }

  /**
   * Récupère les informations de l'utilisateur authentifié
   *
   * @param accessToken - Token d'accès GitHub
   * @returns Informations utilisateur GitHub
   * @throws {Error} Si la récupération échoue
   *
   * @example
   * ```typescript
   * const user = await GitHubService.getUserInfo(accessToken);
   * console.log(user.login, user.email);
   * ```
   */
  static async getUserInfo(accessToken: string): Promise<GitHubUser> {
    try {
      logger.debug('Fetching GitHub user information');

      const response = await axios.get<GitHubUser>(`${GITHUB_API_BASE_URL}/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      logExternalAPI('GitHub', '/user', true, {
        userId: response.data.id,
        login: response.data.login,
      });

      logger.info('Successfully fetched GitHub user information', {
        userId: response.data.id,
        login: response.data.login,
      });

      return response.data;
    } catch (error) {
      logExternalAPI('GitHub', '/user', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<GitHubAPIError>;
        throw new Error(
          `Failed to get GitHub user info: ${axiosError.response?.data?.message || axiosError.message}`
        );
      }

      throw new Error('Failed to get GitHub user info');
    }
  }

  /**
   * Récupère les dépôts de l'utilisateur authentifié
   *
   * @param accessToken - Token d'accès GitHub
   * @param options - Options de pagination et de tri
   * @returns Liste des dépôts
   * @throws {Error} Si la récupération échoue
   *
   * @example
   * ```typescript
   * const repos = await GitHubService.getUserRepositories(accessToken, {
   *   page: 1,
   *   perPage: 30,
   *   sort: 'updated'
   * });
   * ```
   */
  static async getUserRepositories(
    accessToken: string,
    options: {
      page?: number;
      perPage?: number;
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      direction?: 'asc' | 'desc';
    } = {}
  ): Promise<GitHubRepository[]> {
    try {
      const { page = 1, perPage = 30, sort = 'updated', direction = 'desc' } = options;

      logger.debug('Fetching GitHub user repositories', options);

      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
        sort,
        direction,
      });

      const response = await axios.get<GitHubRepository[]>(
        `${GITHUB_API_BASE_URL}/user/repos?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      logExternalAPI('GitHub', '/user/repos', true, {
        count: response.data.length,
      });

      logger.info('Successfully fetched GitHub repositories', {
        count: response.data.length,
      });

      return response.data;
    } catch (error) {
      logExternalAPI('GitHub', '/user/repos', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<GitHubAPIError>;
        throw new Error(
          `Failed to get GitHub repositories: ${axiosError.response?.data?.message || axiosError.message}`
        );
      }

      throw new Error('Failed to get GitHub repositories');
    }
  }

  /**
   * Récupère les commits d'un dépôt spécifique
   *
   * @param accessToken - Token d'accès GitHub
   * @param params - Paramètres de la requête (owner, repo, dates, pagination)
   * @returns Liste des commits
   * @throws {Error} Si la récupération échoue
   *
   * @example
   * ```typescript
   * const commits = await GitHubService.getRepositoryCommits(accessToken, {
   *   owner: 'username',
   *   repo: 'my-project',
   *   since: '2024-01-01T00:00:00Z',
   *   perPage: 10
   * });
   * ```
   */
  static async getRepositoryCommits(
    accessToken: string,
    params: GetCommitsParams
  ): Promise<GitCommit[]> {
    try {
      const { owner, repo, since, until, page = 1, perPage = 30 } = params;

      logger.debug('Fetching repository commits', { owner, repo, since, until });

      const queryParams = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (since) {
        queryParams.append('since', since);
      }

      if (until) {
        queryParams.append('until', until);
      }

      const response = await axios.get(
        `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      // Transforme les données de l'API GitHub en format simplifié
      const commits: GitCommit[] = response.data.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
        },
        url: commit.html_url,
      }));

      logExternalAPI('GitHub', `/repos/${owner}/${repo}/commits`, true, {
        count: commits.length,
      });

      logger.info('Successfully fetched repository commits', {
        owner,
        repo,
        count: commits.length,
      });

      return commits;
    } catch (error) {
      logExternalAPI('GitHub', `/repos/${params.owner}/${params.repo}/commits`, false, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<GitHubAPIError>;

        // Cas spécifique : dépôt non trouvé ou accès refusé
        if (axiosError.response?.status === 404) {
          throw new Error(
            `Repository ${params.owner}/${params.repo} not found or you don't have access`
          );
        }

        // Cas spécifique : dépôt vide (409 Conflict)
        if (axiosError.response?.status === 409) {
          logger.warn('Repository is empty', { owner: params.owner, repo: params.repo });
          return [];
        }

        throw new Error(
          `Failed to get repository commits: ${axiosError.response?.data?.message || axiosError.message}`
        );
      }

      throw new Error('Failed to get repository commits');
    }
  }

  /**
   * Récupère les commits de l'utilisateur sur tous ses dépôts
   *
   * Utile pour obtenir une vue d'ensemble de l'activité récente.
   *
   * @param accessToken - Token d'accès GitHub
   * @param since - Date de début (format ISO 8601)
   * @param until - Date de fin (format ISO 8601)
   * @returns Map des commits par dépôt
   * @throws {Error} Si la récupération échoue
   *
   * @example
   * ```typescript
   * const allCommits = await GitHubService.getAllUserCommits(
   *   accessToken,
   *   '2024-01-01T00:00:00Z'
   * );
   *
   * for (const [repoName, commits] of allCommits.entries()) {
   *   console.log(`${repoName}: ${commits.length} commits`);
   * }
   * ```
   */
  static async getAllUserCommits(
    accessToken: string,
    since?: string,
    until?: string
  ): Promise<Map<string, GitCommit[]>> {
    try {
      logger.debug('Fetching all user commits', { since, until });

      // Récupère d'abord tous les dépôts de l'utilisateur
      const repositories = await this.getUserRepositories(accessToken, {
        perPage: 100,
      });

      const commitsByRepo = new Map<string, GitCommit[]>();

      // Pour chaque dépôt, récupère les commits
      await Promise.all(
        repositories.map(async (repo) => {
          try {
            const commits = await this.getRepositoryCommits(accessToken, {
              owner: repo.owner.login,
              repo: repo.name,
              since,
              until,
              perPage: 100,
            });

            if (commits.length > 0) {
              commitsByRepo.set(repo.full_name, commits);
            }
          } catch (error) {
            // Log l'erreur mais continue avec les autres dépôts
            logger.warn(`Failed to fetch commits for ${repo.full_name}`, {
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        })
      );

      logger.info('Successfully fetched all user commits', {
        repositoriesWithCommits: commitsByRepo.size,
        totalCommits: Array.from(commitsByRepo.values()).reduce(
          (sum, commits) => sum + commits.length,
          0
        ),
      });

      return commitsByRepo;
    } catch (error) {
      logger.error('Failed to fetch all user commits', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('Failed to fetch all user commits');
    }
  }

  /**
   * Vérifie si un token d'accès est valide
   *
   * @param accessToken - Token d'accès GitHub à vérifier
   * @returns true si le token est valide, false sinon
   */
  static async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      logger.debug('GitHub access token validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Formate les commits en un texte lisible pour un rapport
   *
   * @param commits - Liste des commits
   * @param repoName - Nom du dépôt
   * @returns Texte formaté
   *
   * @example
   * ```typescript
   * const text = GitHubService.formatCommitsForReport(commits, 'my-project');
   * ```
   */
  static formatCommitsForReport(commits: GitCommit[], repoName: string): string {
    if (commits.length === 0) {
      return `Aucun commit trouvé pour le dépôt ${repoName}`;
    }

    let report = `# Rapport des commits - ${repoName}\n\n`;
    report += `**Total des commits :** ${commits.length}\n\n`;
    report += `---\n\n`;

    commits.forEach((commit, index) => {
      report += `## ${index + 1}. ${commit.message.split('\n')[0]}\n\n`;
      report += `- **Auteur :** ${commit.author.name} (${commit.author.email})\n`;
      report += `- **Date :** ${new Date(commit.author.date).toLocaleString('fr-FR')}\n`;
      report += `- **SHA :** \`${commit.sha.substring(0, 7)}\`\n`;
      report += `- **Lien :** ${commit.url}\n\n`;

      // Ajoute le message complet s'il y a plusieurs lignes
      const messageLines = commit.message.split('\n');
      if (messageLines.length > 1) {
        report += `**Description complète :**\n\n`;
        report += messageLines.slice(1).join('\n') + '\n\n';
      }

      report += `---\n\n`;
    });

    return report;
  }
}

export default GitHubService;
