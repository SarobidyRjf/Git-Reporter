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
import { GetCommitsParams, GitCommit, GitHubRepository, GitHubUser } from '../types';
/**
 * Service GitHub
 *
 * Fournit des méthodes pour interagir avec l'API GitHub de manière sécurisée et robuste.
 * Toutes les requêtes sont loggées pour faciliter le débogage.
 */
export declare class GitHubService {
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
    static getAuthorizationUrl(state: string): string;
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
    static getAccessToken(code: string): Promise<string>;
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
    static getUserInfo(accessToken: string): Promise<GitHubUser>;
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
    static getUserRepositories(accessToken: string, options?: {
        page?: number;
        perPage?: number;
        sort?: 'created' | 'updated' | 'pushed' | 'full_name';
        direction?: 'asc' | 'desc';
    }): Promise<GitHubRepository[]>;
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
    static getRepositoryCommits(accessToken: string, params: GetCommitsParams): Promise<GitCommit[]>;
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
    static getAllUserCommits(accessToken: string, since?: string, until?: string): Promise<Map<string, GitCommit[]>>;
    /**
     * Vérifie si un token d'accès est valide
     *
     * @param accessToken - Token d'accès GitHub à vérifier
     * @returns true si le token est valide, false sinon
     */
    static validateAccessToken(accessToken: string): Promise<boolean>;
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
    static formatCommitsForReport(commits: GitCommit[], repoName: string): string;
}
export default GitHubService;
//# sourceMappingURL=github.service.d.ts.map