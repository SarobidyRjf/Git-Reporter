/**
 * Types TypeScript centralisés pour l'application
 *
 * Ce fichier définit tous les types, interfaces et enums utilisés dans l'application
 * pour assurer une cohérence et une sécurité de typage dans tout le codebase.
 *
 * @module types
 */
import { Request } from 'express';
/**
 * Énumération des méthodes d'envoi de rapport
 */
export declare enum ReportMethod {
    EMAIL = "email",
    WHATSAPP = "whatsapp"
}
/**
 * Énumération des statuts de rapport
 */
export declare enum ReportStatus {
    DRAFT = "draft",
    SENT = "sent",
    FAILED = "failed"
}
/**
 * Interface représentant un utilisateur dans le système
 */
export interface User {
    id: string;
    githubId: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    accessToken?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
/**
 * Interface pour les données de création d'un utilisateur
 */
export interface CreateUserData {
    githubId: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
    accessToken?: string;
}
/**
 * Interface représentant un rapport dans le système
 */
export interface Report {
    id: string;
    userId: string;
    repoName: string;
    content: string;
    sentTo: string | null;
    method: string;
    createdAt: Date;
    user?: User;
}
/**
 * Interface pour les données de création d'un rapport
 */
export interface CreateReportData {
    userId: string;
    repoName: string;
    content: string;
    sentTo?: string;
    method: ReportMethod;
}
/**
 * Interface pour les données de mise à jour d'un rapport
 */
export interface UpdateReportData {
    content?: string;
    sentTo?: string;
    method?: ReportMethod;
}
/**
 * Interface représentant un commit Git
 */
export interface GitCommit {
    sha: string;
    message: string;
    author: {
        name: string;
        email: string;
        date: string;
    };
    url: string;
}
/**
 * Interface pour les informations de dépôt GitHub
 */
export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
        login: string;
        avatar_url: string;
    };
    description: string | null;
    url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
}
/**
 * Interface pour la réponse de l'API GitHub lors de l'authentification
 */
export interface GitHubUser {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
}
/**
 * Interface pour le token d'accès GitHub
 */
export interface GitHubAccessToken {
    access_token: string;
    token_type: string;
    scope: string;
}
/**
 * Interface pour le payload JWT
 */
export interface JWTPayload {
    userId: string;
    githubId: string;
    iat?: number;
    exp?: number;
}
/**
 * Interface pour la requête Express avec utilisateur authentifié
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        githubId: string;
    };
}
/**
 * Interface pour les options d'envoi d'email
 */
export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
/**
 * Interface pour les options d'envoi WhatsApp
 */
export interface WhatsAppOptions {
    to: string;
    message: string;
}
/**
 * Interface pour la réponse d'erreur standardisée
 */
export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        details?: any;
    };
    timestamp: string;
}
/**
 * Interface pour la réponse de succès standardisée
 */
export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
    timestamp: string;
}
/**
 * Type union pour toutes les réponses API
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;
/**
 * Interface pour les paramètres de pagination
 */
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
/**
 * Interface pour les résultats paginés
 */
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
/**
 * Interface pour les filtres de rapport
 */
export interface ReportFilters {
    userId?: string;
    repoName?: string;
    method?: ReportMethod;
    startDate?: Date;
    endDate?: Date;
}
/**
 * Interface pour les statistiques utilisateur
 */
export interface UserStats {
    totalReports: number;
    reportsByMethod: {
        email: number;
        whatsapp: number;
    };
    recentReports: Report[];
    mostUsedRepo: string | null;
}
/**
 * Type pour les niveaux de log
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
/**
 * Interface pour les options de service GitHub
 */
export interface GitHubServiceOptions {
    accessToken: string;
    owner: string;
    repo: string;
}
/**
 * Interface pour les paramètres de récupération de commits
 */
export interface GetCommitsParams {
    owner: string;
    repo: string;
    since?: string;
    until?: string;
    page?: number;
    perPage?: number;
}
/**
 * Type guard pour vérifier si une valeur est un ReportMethod valide
 */
export declare function isValidReportMethod(value: any): value is ReportMethod;
/**
 * Type guard pour vérifier si une requête est authentifiée
 */
export declare function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest;
//# sourceMappingURL=index.d.ts.map