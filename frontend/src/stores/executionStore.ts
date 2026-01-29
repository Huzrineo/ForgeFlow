import { create } from "zustand";
import type { FlowExecution } from "@/types/flow";
import { ListExecutions, DeleteExecution } from "../../wailsjs/go/main/Storage";

interface ExecutionState {
  executions: FlowExecution[];
  selectedExecution: FlowExecution | null;
  isLoading: boolean;
  
  loadExecutions: () => Promise<void>;
  deleteExecution: (execId: string) => Promise<void>;
  clearExecutions: () => Promise<void>;
  setSelectedExecution: (execution: FlowExecution | null) => void;
}

export const useExecutionStore = create<ExecutionState>()((set, get) => ({
  executions: [],
  selectedExecution: null,
  isLoading: false,

  loadExecutions: async () => {
    set({ isLoading: true });
    try {
      const executions = await ListExecutions(100);
      
      // Calculate stats for each execution
      const processedExecutions = executions.map((exec: any) => {
        const successCount = exec.results?.filter((r: any) => r.status === "success").length || 0;
        const errorCount = exec.results?.filter((r: any) => r.status === "error").length || 0;
        const nodeCount = exec.results?.length || 0;
        
        return {
          ...exec,
          nodeCount,
          successCount,
          errorCount,
        } as FlowExecution;
      });
      
      set({ executions: processedExecutions, isLoading: false });
    } catch (error) {
      console.error("Failed to load executions:", error);
      set({ isLoading: false });
    }
  },

  deleteExecution: async (execId: string) => {
    try {
      await DeleteExecution(execId);
      set({ executions: get().executions.filter(e => e.id !== execId) });
    } catch (error) {
      console.error("Failed to delete execution:", error);
    }
  },

  clearExecutions: async () => {
    const { executions } = get();
    try {
      await Promise.all(executions.map(e => DeleteExecution(e.id)));
      set({ executions: [] });
    } catch (error) {
      console.error("Failed to clear executions:", error);
    }
  },

  setSelectedExecution: (execution) => set({ selectedExecution: execution }),
}));
