import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tab {
  id: string;
  flowId: string | null;
  name: string;
  isUnsaved: boolean;
}

interface TabState {
  openTabs: Tab[];
  activeTabId: string | null;
  openTab: (flowId?: string, name?: string) => string;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabName: (tabId: string, name: string) => void;
  markTabUnsaved: (tabId: string, unsaved: boolean) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  duplicateTab: (tabId: string) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      openTabs: [],
      activeTabId: null,

      openTab: (flowId?: string, name?: string) => {
        const { openTabs } = get();
        
        if (flowId) {
          const existingTab = openTabs.find((t) => t.flowId === flowId);
          if (existingTab) {
            set({ activeTabId: existingTab.id });
            return existingTab.id;
          }
        }

        const newTab: Tab = {
          id: crypto.randomUUID(),
          flowId: flowId || null,
          name: name || "Untitled",
          isUnsaved: !flowId,
        };

        set({
          openTabs: [...openTabs, newTab],
          activeTabId: newTab.id,
        });

        return newTab.id;
      },

      closeTab: (tabId: string) => {
        const { openTabs, activeTabId } = get();
        const tabIndex = openTabs.findIndex((t) => t.id === tabId);
        const newTabs = openTabs.filter((t) => t.id !== tabId);

        let newActiveId = activeTabId;
        if (activeTabId === tabId) {
          if (newTabs.length > 0) {
            const newIndex = Math.min(tabIndex, newTabs.length - 1);
            newActiveId = newTabs[newIndex].id;
          } else {
            newActiveId = null;
          }
        }

        set({ openTabs: newTabs, activeTabId: newActiveId });
      },

      setActiveTab: (tabId: string) => {
        set({ activeTabId: tabId });
      },

      updateTabName: (tabId: string, name: string) => {
        set({
          openTabs: get().openTabs.map((t) =>
            t.id === tabId ? { ...t, name } : t
          ),
        });
      },

      markTabUnsaved: (tabId: string, unsaved: boolean) => {
        set({
          openTabs: get().openTabs.map((t) =>
            t.id === tabId ? { ...t, isUnsaved: unsaved } : t
          ),
        });
      },

      closeOtherTabs: (tabId: string) => {
        set({
          openTabs: get().openTabs.filter((t) => t.id === tabId),
          activeTabId: tabId,
        });
      },

      closeAllTabs: () => {
        set({ openTabs: [], activeTabId: null });
      },

      duplicateTab: (tabId: string) => {
        const { openTabs } = get();
        const tab = openTabs.find((t) => t.id === tabId);
        if (!tab) return;

        const newTab: Tab = {
          id: crypto.randomUUID(),
          flowId: null,
          name: `${tab.name} (Copy)`,
          isUnsaved: true,
        };

        set({
          openTabs: [...openTabs, newTab],
          activeTabId: newTab.id,
        });
      },
    }),
    {
      name: "forgeflow-tabs",
      partialize: (state) => ({
        openTabs: state.openTabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);
