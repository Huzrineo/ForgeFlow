import type { HandlerContext } from './types';

// Simple in-memory conversation storage
const conversationMemory: Record<string, Array<{ role: string; content: string; timestamp: number }>> = {};

export const aiHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  action_ai: async ({ data, onLog }) => {
    const { 
      prompt, 
      systemPrompt, 
      model, 
      temperature, 
      enableMemory, 
      memoryKey, 
      maxMessages, 
      memoryExpiry 
    } = data;
    
    onLog('info', `🤖 AI Request`);
    onLog('info', `   Model: ${model || 'default'}`);
    onLog('info', `   Temperature: ${temperature || 0.7}`);
    
    if (enableMemory && memoryKey) {
      onLog('info', `   💾 Memory: ${memoryKey} (max ${maxMessages} msgs)`);
    }
    
    try {
      // Handle conversation memory
      let messages: Array<{ role: string; content: string }> = [];
      
      if (enableMemory && memoryKey) {
        // Get or create conversation
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
        
        // Limit message count
        const limit = parseInt(maxMessages) || 20;
        if (conversationMemory[memoryKey].length > limit) {
          conversationMemory[memoryKey] = conversationMemory[memoryKey].slice(-limit);
        }
        
        // Build message history
        messages = conversationMemory[memoryKey].map(({ role, content }) => ({ role, content }));
        
        onLog('info', `   📚 Loaded ${messages.length} previous messages`);
      }
      
      // Add system prompt if provided
      if (systemPrompt) {
        messages.unshift({ role: 'system', content: systemPrompt });
      }
      
      // Add current user prompt
      messages.push({ role: 'user', content: prompt });
      
      // Simulate AI API call
      await new Promise(r => setTimeout(r, 600));
      
      const response = `AI response to: "${prompt.substring(0, 50)}..." (using ${model || 'default'} model)`;
      const tokens = Math.floor(Math.random() * 800 + 200);
      
      // Save to memory if enabled
      if (enableMemory && memoryKey) {
        conversationMemory[memoryKey].push({
          role: 'user',
          content: prompt,
          timestamp: Date.now()
        });
        conversationMemory[memoryKey].push({
          role: 'assistant',
          content: response,
          timestamp: Date.now()
        });
        
        onLog('info', `   💾 Saved to memory (${conversationMemory[memoryKey].length} total)`);
      }
      
      onLog('success', `✓ Generated ${tokens} tokens`);
      onLog('info', `   💰 Cost: $0.00${Math.floor(Math.random() * 9 + 1)}`);
      
      return response;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ AI request failed: ${errorMsg}`);
      throw error;
    }
  },

  // Legacy AI handlers (kept for backward compatibility)
  ai_summarize: async ({ data, onLog }) => {
    onLog('info', `🤖 AI Summarize`);
    onLog('info', `   Model: ${data.model || 'default'}`);
    onLog('info', `   Input: ${data.prompt?.substring(0, 50)}...`);
    
    try {
      await new Promise(r => setTimeout(r, 500));
      
      const summary = `Summary of: ${data.prompt?.substring(0, 100)}...`;
      const tokens = Math.floor(Math.random() * 500 + 100);
      
      onLog('success', `✓ Generated ${tokens} tokens`);
      onLog('info', `   💰 Cost: $0.00${Math.floor(Math.random() * 9 + 1)}`);
      
      return summary;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ AI request failed: ${errorMsg}`);
      throw error;
    }
  },

  ai_classify: async ({ data, onLog }) => {
    onLog('info', `🤖 AI Classify`);
    onLog('info', `   Categories: ${data.categories}`);
    
    try {
      await new Promise(r => setTimeout(r, 400));
      
      const categories = data.categories?.split(',').map((c: string) => c.trim()) || [];
      const category = categories[Math.floor(Math.random() * categories.length)] || 'unknown';
      
      onLog('success', `✓ Classified as: ${category}`);
      return category;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Classification failed: ${errorMsg}`);
      throw error;
    }
  },

  ai_extract: async ({ data, onLog }) => {
    onLog('info', `🤖 AI Extract Data`);
    onLog('info', `   Schema: ${data.schema?.substring(0, 50)}...`);
    
    try {
      await new Promise(r => setTimeout(r, 450));
      
      let schema = {};
      try {
        schema = JSON.parse(data.schema || '{}');
      } catch {
        onLog('warn', '⚠️  Invalid schema, using empty object');
      }
      
      onLog('success', `✓ Extracted data`);
      return schema;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Extraction failed: ${errorMsg}`);
      throw error;
    }
  },

  ai_generate: async ({ data, onLog }) => {
    onLog('info', `🤖 AI Generate Text`);
    onLog('info', `   Prompt: ${data.prompt?.substring(0, 50)}...`);
    onLog('info', `   Temperature: ${data.temperature || 0.7}`);
    
    try {
      await new Promise(r => setTimeout(r, 600));
      
      const generated = `Generated text based on: ${data.prompt?.substring(0, 50)}...`;
      const tokens = Math.floor(Math.random() * 800 + 200);
      
      onLog('success', `✓ Generated ${tokens} tokens`);
      return generated;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Generation failed: ${errorMsg}`);
      throw error;
    }
  },
};
