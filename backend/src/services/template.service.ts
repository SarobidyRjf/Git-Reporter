/**
 * Service de gestion des templates de rapports
 * 
 * Ce service gère :
 * - Le rendu des templates avec remplacement de variables
 * - La validation des templates
 * - Les templates par défaut
 * 
 * @module services/template
 */

import { TemplateVariable, TemplateRenderData, CreateTemplateDto } from '../types/template.types';
import logger from '../utils/logger';

class TemplateService {
  /**
   * Remplace les variables dans un template
   * 
   * @param template - Template avec variables {{variable}}
   * @param data - Données pour remplacer les variables
   * @returns Template rendu avec les données
   */
  renderTemplate(template: string, data: TemplateRenderData): string {
    logger.info('📝 Rendering template', { variableCount: Object.keys(data).length });
    
    let rendered = template;
    
    // Remplacer chaque variable
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const replacement = this.formatValue(value);
      rendered = rendered.replace(regex, replacement);
      
      logger.debug(`🔄 Replaced variable: {{${key}}}`, { value: replacement });
    });
    
    // Vérifier s'il reste des variables non remplacées
    const unreplacedVars = rendered.match(/{{[^}]+}}/g);
    if (unreplacedVars) {
      logger.warn('⚠️ Unresolved variables in template', { variables: unreplacedVars });
    }
    
    logger.info('✅ Template rendered successfully');
    return rendered;
  }

  /**
   * Formate une valeur pour l'affichage
   */
  private formatValue(value: any): string {
    if (Array.isArray(value)) {
      return value.map((item, index) => {
        if (typeof item === 'object' && item.message) {
          return `${index + 1}. ${item.message} (${item.sha?.substring(0, 7)})`;
        }
        return `${index + 1}. ${item}`;
      }).join('\n');
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    return String(value);
  }

  /**
   * Valide un template
   * 
   * @param template - Template à valider
   * @param variables - Variables déclarées
   * @returns true si valide, false sinon
   */
  validateTemplate(template: string, variables: TemplateVariable[]): boolean {
    logger.info('🔍 Validating template', { variableCount: variables.length });
    
    // Vérifier que le template n'est pas vide
    if (!template || template.trim().length === 0) {
      logger.error('❌ Template is empty');
      return false;
    }
    
    // Extraire toutes les variables du template
    const templateVars = this.extractVariables(template);
    const declaredVarNames = variables.map(v => v.name);
    
    // Vérifier que toutes les variables du template sont déclarées
    const undeclaredVars = templateVars.filter(v => !declaredVarNames.includes(v));
    if (undeclaredVars.length > 0) {
      logger.warn('⚠️ Undeclared variables found', { variables: undeclaredVars });
    }
    
    logger.info('✅ Template validation passed');
    return true;
  }

  /**
   * Extrait les noms de variables d'un template
   */
  private extractVariables(template: string): string[] {
    const matches = template.match(/{{([^}]+)}}/g);
    if (!matches) return [];
    
    return matches.map(match => match.replace(/{{|}}/g, '').trim());
  }

  /**
   * Retourne les templates par défaut
   */
  getDefaultTemplates(): CreateTemplateDto[] {
    logger.info('📋 Getting default templates');
    
    return [
      {
        name: 'Daily Standup',
        description: 'Rapport quotidien des commits',
        content: `# Daily Standup - {{date}}

## 📦 Dépôt: {{repoName}}

### Commits du jour ({{commitCount}})

{{commits}}

---
Généré automatiquement par Git Reporter`,
        variables: [
          { name: 'date', description: 'Date du jour', example: '01/12/2025' },
          { name: 'repoName', description: 'Nom du dépôt', example: 'my-project' },
          { name: 'commitCount', description: 'Nombre de commits', example: '5' },
          { name: 'commits', description: 'Liste des commits', example: '1. feat: add feature\n2. fix: bug fix' }
        ]
      },
      {
        name: 'Weekly Review',
        description: 'Résumé hebdomadaire des activités',
        content: `# Weekly Review - {{dateRange}}

## 📊 Résumé de la semaine

**Dépôt**: {{repoName}}
**Commits**: {{commitCount}}
**Contributeurs**: {{contributorCount}}

### Commits de la semaine

{{commits}}

### Statistiques
- Lignes ajoutées: {{linesAdded}}
- Lignes supprimées: {{linesRemoved}}

---
Généré automatiquement par Git Reporter`,
        variables: [
          { name: 'dateRange', description: 'Plage de dates', example: '25/11 - 01/12' },
          { name: 'repoName', description: 'Nom du dépôt', example: 'my-project' },
          { name: 'commitCount', description: 'Nombre de commits', example: '25' },
          { name: 'contributorCount', description: 'Nombre de contributeurs', example: '3' },
          { name: 'commits', description: 'Liste des commits', example: '1. feat: add feature' },
          { name: 'linesAdded', description: 'Lignes ajoutées', example: '150' },
          { name: 'linesRemoved', description: 'Lignes supprimées', example: '50' }
        ]
      },
      {
        name: 'Release Notes',
        description: 'Notes de version pour une release',
        content: `# Release Notes - {{version}}

## 🚀 Nouvelles fonctionnalités

{{featCommits}}

## 🐛 Corrections de bugs

{{fixCommits}}

## 📝 Documentation

{{docsCommits}}

---
Date de release: {{date}}
Dépôt: {{repoName}}`,
        variables: [
          { name: 'version', description: 'Numéro de version', example: 'v1.2.0' },
          { name: 'featCommits', description: 'Commits de features', example: '- Add login\n- Add dashboard' },
          { name: 'fixCommits', description: 'Commits de fixes', example: '- Fix bug #123' },
          { name: 'docsCommits', description: 'Commits de documentation', example: '- Update README' },
          { name: 'date', description: 'Date de release', example: '01/12/2025' },
          { name: 'repoName', description: 'Nom du dépôt', example: 'my-project' }
        ]
      }
    ];
  }
}

export default new TemplateService();
