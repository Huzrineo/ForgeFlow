import { create } from 'zustand';

interface WorkflowPanelState {
  workflowPanelOpen: boolean;
  templateModalOpen: boolean;
  shortcutsModalOpen: boolean;
  executionHistoryOpen: boolean;
  importExportOpen: boolean;
  
  setWorkflowPanelOpen: (open: boolean) => void;
  setTemplateModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setExecutionHistoryOpen: (open: boolean) => void;
  setImportExportOpen: (open: boolean) => void;
  toggleWorkflowPanel: () => void;
}

export const useWorkflowStore = create<WorkflowPanelState>()((set, get) => ({
  workflowPanelOpen: false,
  templateModalOpen: false,
  shortcutsModalOpen: false,
  executionHistoryOpen: false,
  importExportOpen: false,

  setWorkflowPanelOpen: (open) => set({ workflowPanelOpen: open }),
  setTemplateModalOpen: (open) => set({ templateModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),
  setExecutionHistoryOpen: (open) => set({ executionHistoryOpen: open }),
  setImportExportOpen: (open) => set({ importExportOpen: open }),
  toggleWorkflowPanel: () => set({ workflowPanelOpen: !get().workflowPanelOpen }),
}));
