import type { HandlerContext } from './types';

// Simple in-memory conversation storage
const conversationMemory: Record<string, Array<{ role: string; content: string; timestamp: number }>> = {};

export const aiHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  action_ai: async (ctx) => {
    const { 
      provider = 'openai',
      prompt, 
      systemPrompt, 
      model, 
      temperature, 
      enableMemory, 
      memoryKey, 
      maxMessages, 
      memoryExpiry 
    } = ctx.data;
    
    const { onLog, api, settings } = ctx;
    
    onLog('info', `🤖 AI Request (${provider})`);
    
    // Get provider config
    const config = settings.aiServices[provider as keyof typeof settings.aiServices];
    if (!config || (!config.enabled && provider !== 'custom')) {
      throw new Error(`AI Provider "${provider}" is not enabled. Please configure it in Settings > AI Endpoints.`);
    }

    if (!config.apiKey && provider !== 'custom') {
      throw new Error(`API Key for "${provider}" is missing. Please set it in Settings > AI Endpoints.`);
    }

    try {
      // Handle conversation memory
      let messages: Array<{ role: string; content: string }> = [];
      
      if (enableMemory && memoryKey) {
        if (!conversationMemory[memoryKey]) {
          conversationMemory[memoryKey] = [];
        }
        
        // Clean expired messages
        const expiryMs = parseInt(memoryExpiry) * 60 * 1000;
        if (expiryMs > 0) {
          const now = Date.now();
          conversationMemory[memoryKey] = conversationMemory[memoryKey].filter(
            msg => now - msg.timestamp < expiryMs
          );
        }
        
        // Build message history
        const limit = parseInt(maxMessages) || 20;
        messages = conversationMemory[memoryKey].slice(-limit).map(({ role, content }) => ({ role, content }));
        
        if (messages.length > 0) {
          onLog('info', `   📚 Loaded ${messages.length} messages from memory`);
        }
      }
      
      // Add system prompt if provided
      if (systemPrompt) {
        messages.unshift({ role: 'system', content: systemPrompt });
      }
      
      // Add current user prompt
      messages.push({ role: 'user', content: prompt });
      
      // Determine endpoint and model
      let url = '';
      let defaultModel = '';
      
      switch (provider) {
        case 'openai':
          url = 'https://api.openai.com/v1/chat/completions';
          defaultModel = 'gpt-4o-mini';
          break;
        case 'groq':
          url = 'https://api.groq.com/openai/v1/chat/completions';
          defaultModel = 'llama3-8b-8192';
          break;
        case 'openrouter':
          url = 'https://openrouter.ai/api/v1/chat/completions';
          defaultModel = 'google/gemini-flash-1.5';
          break;
        case 'custom':
          url = config.baseUrl || '';
          if (!url) throw new Error('Base URL is required for custom AI provider');
          if (!url.endsWith('/chat/completions')) {
            url = url.replace(/\/+$/, '') + '/chat/completions';
          }
          defaultModel = model || 'gpt-3.5-turbo'; // Fallback
          break;
      }

      onLog('info', `   Model: ${model || defaultModel}`);
      
      // Make the request
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }
      
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://forgeflow.app';
        headers['X-Title'] = 'ForgeFlow';
      }

      const response = await api.http.post(url, {
        model: model || defaultModel,
        messages,
        temperature: temperature ?? 0.7,
      }, headers);

      if (response.error) throw new Error(response.error);
      
      const result = typeof response.json === 'object' ? response.json : JSON.parse(response.body);
      
      if (result.error) {
        throw new Error(result.error.message || JSON.stringify(result.error));
      }

      const content = result.choices[0].message.content;
      
      // Save to memory if enabled
      if (enableMemory && memoryKey) {
        conversationMemory[memoryKey].push({
          role: 'user',
          content: prompt,
          timestamp: Date.now()
        });
        conversationMemory[memoryKey].push({
          role: 'assistant',
          content,
          timestamp: Date.now()
        });
      }
      
      const tokens = result.usage?.total_tokens || 0;
      onLog('success', `✓ AI Response received (${tokens} tokens)`);
      
      return content;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ AI request failed: ${errorMsg}`);
      throw error;
    }
  },

  // Legacy AI handlers updated to use the same logic
  ai_summarize: async (ctx) => {
    ctx.data.prompt = `Please summarize the following text:\n\n${ctx.data.prompt}`;
    return aiHandlers.action_ai(ctx);
  },

  ai_classify: async (ctx) => {
    ctx.data.prompt = `Classify the following text into one of these categories: ${ctx.data.categories}\n\nText: ${ctx.data.prompt}\n\nOnly respond with the category name.`;
    return aiHandlers.action_ai(ctx);
  },

  ai_extract: async (ctx) => {
    ctx.data.prompt = `Extract data from the following text based on this JSON schema: ${ctx.data.schema}\n\nText: ${ctx.data.prompt}\n\nOnly respond with the JSON object.`;
    const result = await aiHandlers.action_ai(ctx);
    try {
      return JSON.parse(result);
    } catch {
      return result;
    }
  },

  ai_generate: async (ctx) => {
    return aiHandlers.action_ai(ctx);
  },
};
