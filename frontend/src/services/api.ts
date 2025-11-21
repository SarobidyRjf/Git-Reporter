/**
 * Service API pour communiquer avec le backend
 *
 * Ce service gère toutes les requêtes HTTP vers l'API backend.
 * Il configure Axios avec les intercepteurs pour :
 * - Ajouter automatiquement le token JWT aux requêtes
 * - Gérer les erreurs de manière centralisée
 * - Logger les requêtes en développement
 *
 * @module services/api
 */

import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import type {
  ApiResponse,
  Commit,
  CreateReportData,
  PaginatedResponse,
  Report,
  ReportFilters,
  Repository,
  User,
  UserStats,
} from "../types";

/**
 * URL de base de l'API backend
 * Peut être configurée via variable d'environnement
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Classe de service API
 */
class ApiService {
  private api: AxiosInstance;

  constructor() {
    // Créer une instance Axios avec configuration de base
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Configurer les intercepteurs
    this.setupInterceptors();
  }

  /**
   * Configure les intercepteurs Axios
   */
  private setupInterceptors(): void {
    // Intercepteur de requête
    this.api.interceptors.request.use(
      (config) => {
        // Ajouter le token JWT aux requêtes si disponible
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Logger en développement
        if (import.meta.env.DEV) {
          console.log("🚀 API Request:", {
            method: config.method?.toUpperCase(),
            url: config.url,
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Intercepteur de réponse
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Logger en développement
        if (import.meta.env.DEV) {
          console.log("✅ API Response:", {
            url: response.config.url,
            status: response.status,
            data: response.data,
          });
        }

        return response;
      },
      (error: AxiosError) => {
        // Logger les erreurs
        if (import.meta.env.DEV) {
          console.error("❌ API Error:", {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
          });
        }

        // Gestion des erreurs d'authentification
        if (error.response?.status === 401) {
          // Token expiré ou invalide
          this.removeToken();
          // Rediriger vers la page de login si on n'y est pas déjà
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      },
    );
  }

  /**
   * Récupère le token JWT depuis le localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  /**
   * Stocke le token JWT dans le localStorage
   */
  public setToken(token: string): void {
    localStorage.setItem("auth_token", token);
  }

  /**
   * Supprime le token JWT du localStorage
   */
  public removeToken(): void {
    localStorage.removeItem("auth_token");
  }

  /**
   * Vérifie si un token existe
   */
  public hasToken(): boolean {
    return !!this.getToken();
  }

  // ============================================================================
  // AUTHENTIFICATION
  // ============================================================================

  /**
   * Initie le flux d'authentification GitHub OAuth
   */
  async initiateGitHubLogin(): Promise<
    ApiResponse<{ authUrl: string; state: string }>
  > {
    const response = await this.api.get<
      ApiResponse<{ authUrl: string; state: string }>
    >("/api/auth/github/login");
    return response.data;
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get<ApiResponse<User>>("/api/auth/me");
    return response.data;
  }

  /**
   * Met à jour les paramètres utilisateur
   */
  async updateUserSettings(settings: { visibleRepos?: string[], settings?: any }): Promise<ApiResponse<User>> {
    const response = await this.api.put<ApiResponse<User>>("/api/user/settings", settings);
    return response.data;
  }

  /**
   * Déconnexion
   */
  async logout(): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>("/api/auth/logout");
    this.removeToken();
    return response.data;
  }

  /**
   * Vérifie la validité du token
   */
  async verifyToken(): Promise<
    ApiResponse<{ valid: boolean; userId?: string }>
  > {
    const response =
      await this.api.get<ApiResponse<{ valid: boolean; userId?: string }>>(
        "/api/auth/verify",
      );
    return response.data;
  }

  // ============================================================================
  // GITHUB
  // ============================================================================

  /**
   * Récupère les dépôts de l'utilisateur
   */
  async getUserRepositories(params?: {
    page?: number;
    perPage?: number;
    sort?: string;
    direction?: string;
  }): Promise<ApiResponse<{ repositories: Repository[] }>> {
    const response = await this.api.get<
      ApiResponse<{ repositories: Repository[] }>
    >("/api/github/repos", { params });
    return response.data;
  }

  /**
   * Récupère les commits d'un dépôt
   */
  async getRepositoryCommits(
    owner: string,
    repo: string,
    params?: {
      since?: string;
      until?: string;
      page?: number;
      perPage?: number;
    },
  ): Promise<ApiResponse<{ commits: Commit[]; repository: any }>> {
    const response = await this.api.get<
      ApiResponse<{ commits: Commit[]; repository: any }>
    >(`/api/github/commits/${owner}/${repo}`, { params });
    return response.data;
  }

  /**
   * Formate les commits pour un rapport
   */
  async formatCommits(
    commits: Commit[],
    repoName: string,
  ): Promise<ApiResponse<{ formatted: string; commitsCount: number }>> {
    const response = await this.api.post<
      ApiResponse<{ formatted: string; commitsCount: number }>
    >("/api/github/format-commits", {
      commits,
      repoName,
    });
    return response.data;
  }

  // ============================================================================
  // RAPPORTS
  // ============================================================================

  /**
   * Récupère la liste des rapports
   */
  async getReports(
    filters?: ReportFilters,
  ): Promise<ApiResponse<PaginatedResponse<Report>>> {
    const response = await this.api.get<ApiResponse<PaginatedResponse<Report>>>(
      "/api/reports",
      { params: filters },
    );
    return response.data;
  }

  /**
   * Récupère un rapport spécifique
   */
  async getReport(id: string): Promise<ApiResponse<Report>> {
    const response = await this.api.get<ApiResponse<Report>>(
      `/api/reports/${id}`,
    );
    return response.data;
  }

  /**
   * Crée et envoie un nouveau rapport
   */
  async createReport(data: CreateReportData): Promise<ApiResponse<Report>> {
    const response = await this.api.post<ApiResponse<Report>>(
      "/api/reports",
      data,
    );
    return response.data;
  }

  /**
   * Supprime un rapport
   */
  async deleteReport(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/api/reports/${id}`);
    return response.data;
  }

  /**
   * Récupère les statistiques utilisateur
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    const response =
      await this.api.get<ApiResponse<UserStats>>("/api/reports/stats");
    return response.data;
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Vérifie l'état de santé de l'API
   */
  async healthCheck(): Promise<
    ApiResponse<{ status: string; timestamp: string }>
  > {
    const response =
      await this.api.get<ApiResponse<{ status: string; timestamp: string }>>(
        "/health",
      );
    return response.data;
  }
}

// Export d'une instance singleton
const apiService = new ApiService();
export default apiService;
