/**
 * Types pour les templates et la planification
 */

export interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

export interface CreateTemplateDto {
  name: string;
  description?: string;
  content: string;
  variables?: TemplateVariable[];
}

export interface UpdateTemplateDto {
  name?: string;
  description?: string;
  content?: string;
  variables?: TemplateVariable[];
}

export interface ScheduleDto {
  templateId?: string;
  repoName: string;
  cronExpression: string;
  method: 'email' | 'whatsapp';
  recipient: string;
}

export interface UpdateScheduleDto {
  templateId?: string;
  repoName?: string;
  cronExpression?: string;
  method?: 'email' | 'whatsapp';
  recipient?: string;
  isActive?: boolean;
}

export interface TemplateRenderData {
  repoName: string;
  commits: any[];
  commitCount: number;
  date: string;
  dateRange?: string;
  author?: string;
  contributorCount?: number;
  linesAdded?: number;
  linesRemoved?: number;
  featCommits?: string;
  fixCommits?: string;
  docsCommits?: string;
  version?: string;
}
