import { create } from 'zustand';
import type { WorkflowTemplate } from '@/types/template';
import { HTTPRequest } from '../../wailsjs/go/main/ActionService';

interface CommunityTemplate extends WorkflowTemplate {
  author?: string;
  downloads?: number;
  source?: string;
}

interface WorkflowPanelState {
  workflowPanelOpen: boolean;
  templateModalOpen: boolean;
  shortcutsModalOpen: boolean;
  executionHistoryOpen: boolean;
  importExportOpen: boolean;
  
  // Community templates
  communityTemplates: CommunityTemplate[];
  communityLoading: boolean;
  communityError: string | null;
  
  setWorkflowPanelOpen: (open: boolean) => void;
  setTemplateModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setExecutionHistoryOpen: (open: boolean) => void;
  setImportExportOpen: (open: boolean) => void;
  toggleWorkflowPanel: () => void;
  fetchCommunityTemplates: () => Promise<void>;
}

const COMMUNITY_TEMPLATES_URL = 'https://raw.githubusercontent.com/OffLine911/ForgeFlow-Community/main/templates.json';

export const useWorkflowStore = create<WorkflowPanelState>()((set, get) => ({
  workflowPanelOpen: false,
  templateModalOpen: false,
  shortcutsModalOpen: false,
  executionHistoryOpen: false,
  importExportOpen: false,
  communityTemplates: [],
  communityLoading: false,
  communityError: null,

  setWorkflowPanelOpen: (open) => set({ workflowPanelOpen: open }),
  setTemplateModalOpen: (open) => set({ templateModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
  setExecutionHistoryOpen: (open) => set({ executionHistoryOpen: open }),
  setImportExportOpen: (open) => set({ importExportOpen: open }),
  toggleWorkflowPanel: () => set({ workflowPanelOpen: !get().workflowPanelOpen }),
  
  fetchCommunityTemplates: async () => {
    if (get().communityLoading) return;
    
    set({ communityLoading: true, communityError: null });
    
    try {
      const response = await HTTPRequest('GET', COMMUNITY_TEMPLATES_URL, {}, '');
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const templates = response.json || JSON.parse(response.body);
      
      if (!Array.isArray(templates)) {
        throw new Error('Invalid template format');
      }
      
      set({ communityTemplates: templates, communityLoading: false });
    } catch (error) {
      console.error('Failed to fetch community templates:', error);
      set({ 
        communityError: error instanceof Error ? error.message : 'Failed to load',
        communityLoading: false 
      });
    }
  },
}));
