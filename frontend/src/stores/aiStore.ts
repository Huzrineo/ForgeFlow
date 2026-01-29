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
    openai: AIModel[];
    groq: AIModel[];
    openrouter: AIModel[];
  };
  isLoading: {
    openai: boolean;
    groq: boolean;
    openrouter: boolean;
  };
  errors: {
    openai: string | null;
    groq: string | null;
    openrouter: string | null;
  };

  fetchModels: (provider: 'openai' | 'groq' | 'openrouter') => Promise<void>;
  fetchAllModels: () => Promise<void>;
}

export const useAIStore = create<AIState>()((set, get) => ({
  models: {
    openai: [],
    groq: [],
    openrouter: [],
  },
  isLoading: {
    openai: false,
    groq: false,
    openrouter: false,
  },
  errors: {
    openai: null,
    groq: null,
    openrouter: null,
  },

  fetchModels: async (provider) => {
    const settings = useSettingsStore.getState().settings;
    const config = settings.aiServices[provider];

    if (!config?.apiKey) {
      set((state) => ({
        errors: { ...state.errors, [provider]: 'API Key missing' }
      }));
      return;
    }

    set((state) => ({
      isLoading: { ...state.isLoading, [provider]: true },
      errors: { ...state.errors, [provider]: null }
    }));

    try {
      let url = '';
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${config.apiKey}`,
      };

      if (provider === 'openai') {
        url = 'https://api.openai.com/v1/models';
      } else if (provider === 'groq') {
        url = 'https://api.groq.com/openai/v1/models';
      } else if (provider === 'openrouter') {
        url = 'https://openrouter.ai/api/v1/models';
      }

      const response = await HTTPRequest('GET', url, headers, '');
      
      if (response.error) {
        throw new Error(response.error);
      }

      const data = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
      
      let fetchedModels: AIModel[] = [];

      if (provider === 'openrouter') {
        // OpenRouter format is different
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
    const providers: Array<'openai' | 'groq' | 'openrouter'> = ['openai', 'groq', 'openrouter'];
    await Promise.all(providers.map(p => get().fetchModels(p)));
  }
}));
