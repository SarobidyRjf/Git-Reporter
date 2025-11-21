/**
 * Types TypeScript pour le frontend Git Reporter
 *
 * Ce fichier définit tous les types et interfaces utilisés dans l'application Vue.
 *
 * @module types
 */

/**
 * Utilisateur connecté
 */
export interface User {
  id: string;
  githubId: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  reportsCount?: number;
  visibleRepos?: string[];
}

/**
 * Rapport de commits
 */
export interface Report {
  id: string;
  userId: string;
  repoName: string;
  content: string;
  sentTo: string | null;
  method: "email" | "whatsapp";
  createdAt: string;
  user?: User;
}

/**
 * Commit Git
 */
export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
  selected?: boolean;
}

/**
 * Dépôt GitHub
 */
export interface Repository {
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
 * Réponse API standard
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Réponse paginée
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Statistiques utilisateur
 */
export interface UserStats {
  totalReports: number;
  reportsByMethod: {
    email: number;
    whatsapp: number;
  };
  recentReports: Report[];
  mostUsedRepo: string | null;
  topRepositories: {
    repoName: string;
    count: number;
  }[];
}

/**
 * Méthode d'envoi
 */
export type ReportMethod = "email" | "whatsapp";

/**
 * Données de création de rapport
 */
export interface CreateReportData {
  repoName: string;
  content: string;
  method: ReportMethod;
  sentTo: string;
}

/**
 * État de chargement
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Options de notification toast
 */
export interface ToastOptions {
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}

/**
 * Filtres de rapports
 */
export interface ReportFilters {
  repoName?: string;
  method?: ReportMethod;
  page?: number;
  limit?: number;
}
