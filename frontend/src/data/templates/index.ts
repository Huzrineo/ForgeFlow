import type { WorkflowTemplate } from '@/types/template';
import { basicTemplates } from './basic';
import { apiTemplates } from './api';
import { aiTemplates } from './ai';
import { fileTemplates } from './files';
import { automationTemplates } from './automation';

export const workflowTemplates: WorkflowTemplate[] = [
  ...basicTemplates,
  ...apiTemplates,
  ...aiTemplates,
  ...fileTemplates,
  ...automationTemplates,
];

export function getTemplatesByCategory(): Record<string, WorkflowTemplate[]> {
  const categories: Record<string, WorkflowTemplate[]> = {};
  for (const template of workflowTemplates) {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push(template);
  }
  return categories;
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find(t => t.id === id);
}
