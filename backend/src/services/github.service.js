"use strict";
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
exports.GitHubService = void 0;
const axios_1 = __importStar(require("axios"));
const env_1 = require("../config/env");
const types_1 = require("../types");
const logger_1 = __importStar(require("../utils/logger"));
/**
 * URL de base de l'API GitHub
 */
const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_OAUTH_BASE_URL = 'https://github.com/login/oauth';
/**
 * Service GitHub
 *
 * Fournit des méthodes pour interagir avec l'API GitHub de manière sécurisée et robuste.
 * Toutes les requêtes sont loggées pour faciliter le débogage.
 */
class GitHubService {
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
    static getAuthorizationUrl(state) {
        const params = new URLSearchParams({
            client_id: env_1.config.github.clientId,
            redirect_uri: env_1.config.github.callbackUrl,
            scope: 'user:email,repo,read:user',
            state,
        });
        const url = `${GITHUB_OAUTH_BASE_URL}/authorize?${params.toString()}`;
        logger_1.default.debug('Generated GitHub authorization URL', { state });
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
    static async getAccessToken(code) {
        try {
            logger_1.default.debug('Exchanging GitHub authorization code for access token');
            const response = await axios_1.default.post(`${GITHUB_OAUTH_BASE_URL}/access_token`, {
                client_id: env_1.config.github.clientId,
                client_secret: env_1.config.github.clientSecret,
                code,
            }, {
                headers: {
                    Accept: 'application/json',
                },
            });
            (0, logger_1.logExternalAPI)('GitHub', '/login/oauth/access_token', true);
            if (!response.data.access_token) {
                throw new Error('No access token received from GitHub');
            }
            logger_1.default.info('Successfully obtained GitHub access token');
            return response.data.access_token;
        }
        catch (error) {
            (0, logger_1.logExternalAPI)('GitHub', '/login/oauth/access_token', false, {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                throw new Error(`Failed to get GitHub access token: ${axiosError.response?.data?.message || axiosError.message}`);
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
    static async getUserInfo(accessToken) {
        try {
            logger_1.default.debug('Fetching GitHub user information');
            const response = await axios_1.default.get(`${GITHUB_API_BASE_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });
            (0, logger_1.logExternalAPI)('GitHub', '/user', true, {
                userId: response.data.id,
                login: response.data.login,
            });
            logger_1.default.info('Successfully fetched GitHub user information', {
                userId: response.data.id,
                login: response.data.login,
            });
            return response.data;
        }
        catch (error) {
            (0, logger_1.logExternalAPI)('GitHub', '/user', false, {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                throw new Error(`Failed to get GitHub user info: ${axiosError.response?.data?.message || axiosError.message}`);
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
    static async getUserRepositories(accessToken, options = {}) {
        try {
            const { page = 1, perPage = 30, sort = 'updated', direction = 'desc' } = options;
            logger_1.default.debug('Fetching GitHub user repositories', options);
            const params = new URLSearchParams({
                page: page.toString(),
                per_page: perPage.toString(),
                sort,
                direction,
            });
            const response = await axios_1.default.get(`${GITHUB_API_BASE_URL}/user/repos?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });
            (0, logger_1.logExternalAPI)('GitHub', '/user/repos', true, {
                count: response.data.length,
            });
            logger_1.default.info('Successfully fetched GitHub repositories', {
                count: response.data.length,
            });
            return response.data;
        }
        catch (error) {
            (0, logger_1.logExternalAPI)('GitHub', '/user/repos', false, {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                throw new Error(`Failed to get GitHub repositories: ${axiosError.response?.data?.message || axiosError.message}`);
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
    static async getRepositoryCommits(accessToken, params) {
        try {
            const { owner, repo, since, until, page = 1, perPage = 30 } = params;
            logger_1.default.debug('Fetching repository commits', { owner, repo, since, until });
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
            const response = await axios_1.default.get(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/commits?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            });
            // Transforme les données de l'API GitHub en format simplifié
            const commits = response.data.map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                author: {
                    name: commit.commit.author.name,
                    email: commit.commit.author.email,
                    date: commit.commit.author.date,
                },
                url: commit.html_url,
            }));
            (0, logger_1.logExternalAPI)('GitHub', `/repos/${owner}/${repo}/commits`, true, {
                count: commits.length,
            });
            logger_1.default.info('Successfully fetched repository commits', {
                owner,
                repo,
                count: commits.length,
            });
            return commits;
        }
        catch (error) {
            (0, logger_1.logExternalAPI)('GitHub', `/repos/${params.owner}/${params.repo}/commits`, false, {
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                // Cas spécifique : dépôt non trouvé ou accès refusé
                if (axiosError.response?.status === 404) {
                    throw new Error(`Repository ${params.owner}/${params.repo} not found or you don't have access`);
                }
                throw new Error(`Failed to get repository commits: ${axiosError.response?.data?.message || axiosError.message}`);
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
    static async getAllUserCommits(accessToken, since, until) {
        try {
            logger_1.default.debug('Fetching all user commits', { since, until });
            // Récupère d'abord tous les dépôts de l'utilisateur
            const repositories = await this.getUserRepositories(accessToken, {
                perPage: 100,
            });
            const commitsByRepo = new Map();
            // Pour chaque dépôt, récupère les commits
            await Promise.all(repositories.map(async (repo) => {
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
                }
                catch (error) {
                    // Log l'erreur mais continue avec les autres dépôts
                    logger_1.default.warn(`Failed to fetch commits for ${repo.full_name}`, {
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }));
            logger_1.default.info('Successfully fetched all user commits', {
                repositoriesWithCommits: commitsByRepo.size,
                totalCommits: Array.from(commitsByRepo.values()).reduce((sum, commits) => sum + commits.length, 0),
            });
            return commitsByRepo;
        }
        catch (error) {
            logger_1.default.error('Failed to fetch all user commits', {
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
    static async validateAccessToken(accessToken) {
        try {
            await this.getUserInfo(accessToken);
            return true;
        }
        catch (error) {
            logger_1.default.debug('GitHub access token validation failed', {
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
    static formatCommitsForReport(commits, repoName) {
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
exports.GitHubService = GitHubService;
exports.default = GitHubService;
//# sourceMappingURL=github.service.js.map