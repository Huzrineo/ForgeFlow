import { create } from 'zustand';
import { HTTPRequest } from '../../wailsjs/go/main/ActionService';
import { useSettingsStore } from './settingsStore';

interface AIModel {
  id: string;
  name: string;
  description?: string;
}

interface AIState {
  models: {
    ollama: AIModel[];
    openai: AIModel[];
    groq: AIModel[];
    openrouter: AIModel[];
  };
  isLoading: {
    ollama: boolean;
    openai: boolean;
    groq: boolean;
    openrouter: boolean;
  };
  errors: {
    ollama: string | null;
    openai: string | null;
    groq: string | null;
    openrouter: string | null;
  };

  fetchModels: (provider: 'ollama' | 'openai' | 'groq' | 'openrouter') => Promise<void>;
  fetchAllModels: () => Promise<void>;
}

export const useAIStore = create<AIState>()((set, get) => ({
  models: {
    ollama: [],
    openai: [],
    groq: [],
    openrouter: [],
  },
  isLoading: {
    ollama: false,
    openai: false,
    groq: false,
    openrouter: false,
  },
  errors: {
    ollama: null,
    openai: null,
    groq: null,
    openrouter: null,
  },

  fetchModels: async (provider) => {
    set((state) => ({
      isLoading: { ...state.isLoading, [provider]: true },
      errors: { ...state.errors, [provider]: null }
    }));

    try {
      let url = '';
      const headers: Record<string, string> = {};

      if (provider === 'ollama') {
        // Ollama runs locally, no API key needed
        url = 'http://localhost:11434/api/tags';
      } else {
        const settings = useSettingsStore.getState().settings;
        const config = settings.aiServices[provider];

        if (!config?.apiKey) {
          set((state) => ({
            errors: { ...state.errors, [provider]: 'API Key missing' },
            isLoading: { ...state.isLoading, [provider]: false }
          }));
          return;
        }

        headers['Authorization'] = `Bearer ${config.apiKey}`;

        if (provider === 'openai') {
          url = 'https://api.openai.com/v1/models';
        } else if (provider === 'groq') {
          url = 'https://api.groq.com/openai/v1/models';
        } else if (provider === 'openrouter') {
          url = 'https://openrouter.ai/api/v1/models';
        }
      }

      const response = await HTTPRequest('GET', url, headers, '');
      
      if (response.error) {
        throw new Error(response.error);
      }

      const data = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
      
      let fetchedModels: AIModel[] = [];

      if (provider === 'ollama') {
        // Ollama returns { models: [...] }
        fetchedModels = (data.models || []).map((m: any) => ({
          id: m.name,
          name: m.name,
          description: `${(m.size / 1e9).toFixed(1)}GB`
        }));
      } else if (provider === 'openrouter') {
        fetchedModels = data.data.map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          description: m.description
        }));
      } else {
        // OpenAI and Groq share standard format
        fetchedModels = data.data
          .filter((m: any) => provider === 'openai' ? m.id.includes('gpt') : true)
          .map((m: any) => ({
            id: m.id,
            name: m.id,
          }));
      }

      // Sort models alphabetically
      fetchedModels.sort((a, b) => a.id.localeCompare(b.id));

      set((state) => ({
        models: { ...state.models, [provider]: fetchedModels },
        isLoading: { ...state.isLoading, [provider]: false }
      }));
    } catch (error: any) {
      console.error(`Failed to fetch ${provider} models:`, error);
      set((state) => ({
        errors: { ...state.errors, [provider]: error.message || 'Fetch failed' },
        isLoading: { ...state.isLoading, [provider]: false }
      }));
    }
  },

  fetchAllModels: async () => {
    const providers: Array<'ollama' | 'openai' | 'groq' | 'openrouter'> = ['ollama', 'openai', 'groq', 'openrouter'];
    await Promise.all(providers.map(p => get().fetchModels(p)));
  }
}));
