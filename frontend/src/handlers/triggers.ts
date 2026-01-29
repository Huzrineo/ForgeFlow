import type { HandlerContext } from './types';

// Store last update ID per bot token to avoid duplicate messages
const lastUpdateIds: Map<string, number> = new Map();

export const triggerHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  trigger_manual: async ({ onLog }) => {
    onLog('info', '▶️  Manual trigger activated');
    return { triggered: true, timestamp: Date.now() };
  },

  trigger_schedule: async ({ data, onLog }) => {
    const cron = data.cron || "";
    if (!cron) throw new Error("Cron expression is required");

    onLog('info', `⏰ Schedule: ${cron}`, undefined);
    
    // Basic validation of cron format (expecting 5 or 6 parts)
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5 || parts.length > 6) {
      onLog('warn', `⚠️  Cron might be invalid: "${cron}" (expected 5 or 6 parts)`, undefined);
    } else {
      onLog('success', '✓ Schedule configured', undefined);
    }

    return { 
      triggered: true, 
      cron,
      enabled: data.enabled !== false,
      timestamp: Date.now() 
    };
  },

  trigger_webhook: async ({ data, onLog }) => {
    const method = data.method || "POST";
    const path = data.path || "/webhook";
    
    // Normalize path
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = `http://localhost:8080${cleanPath}`;

    onLog('info', `🔗 Webhook listener: ${method} ${cleanPath}`, undefined);
    onLog('info', `📝 To trigger, send ${method} to ${url}`, undefined);

    return { 
      triggered: true, 
      method,
      path: cleanPath,
      url,
      timestamp: Date.now() 
    };
  },

  trigger_file_watch: async ({ data, onLog }) => {
    const path = data.path || "";
    if (!path) throw new Error("File/Folder path to watch is required");

    onLog('info', `👁️  Watching path: ${path}`, undefined);
    onLog('info', `   Events: ${data.events || 'all'}`, undefined);

    return { 
      triggered: true, 
      path: path, 
      events: data.events || 'all',
      timestamp: Date.now() 
    };
  },

  trigger_clipboard: async ({ data, onLog }) => {
    const textOnly = data.textOnly !== false;
    onLog('info', `📋 Clipboard monitoring active (textOnly: ${textOnly})`, undefined);

    return { 
      triggered: true, 
      timestamp: Date.now(),
      textOnly
    };
  },

  trigger_hotkey: async ({ data, onLog }) => {
    const hotkey = data.hotkey || "";
    if (!hotkey) throw new Error("Hotkey is required (e.g., Ctrl+Shift+A)");

    onLog('info', `⌨️  Hotkey registered: ${hotkey}`, undefined);

    return { 
      triggered: true, 
      hotkey,
      enabled: data.enabled !== false,
      timestamp: Date.now() 
    };
  },

  trigger_startup: async ({ data, onLog }) => {
    const delay = parseInt(data.delay) || 0;
    
    onLog('info', '🚀 Startup trigger initialization', undefined);
    if (delay > 0) {
      onLog('info', `⏳ Waiting ${delay}ms before continuing...`, undefined);
      await new Promise(r => setTimeout(r, delay));
    }
    
    onLog('success', '✓ Startup trigger executed', undefined);

    return { 
      triggered: true, 
      delay,
      timestamp: Date.now() 
    };
  },

  trigger_telegram: async ({ api, data, onLog }) => {
    if (!data.botToken) throw new Error("Telegram Bot Token is required");

    const lastUpdateId = lastUpdateIds.get(data.botToken) || 0;
    let url = `https://api.telegram.org/bot${data.botToken}/getUpdates?limit=10&timeout=0`;
    if (lastUpdateId > 0) {
      url += `&offset=${lastUpdateId + 1}`;
    }

    onLog('info', `✈️  Telegram: polling for updates (after ${lastUpdateId})...`, undefined);

    const response = await api.http.get(url);
    if (response.error) throw new Error(response.error);

    const result = JSON.parse(response.body);
    if (!result.ok) throw new Error(result.description || "Telegram API error");

    const updates = result.result || [];
    
    if (updates.length > 0) {
      const maxUpdateId = Math.max(...updates.map((u: any) => u.update_id));
      lastUpdateIds.set(data.botToken, maxUpdateId);
      
      onLog('success', `✓ Received ${updates.length} Telegram updates`, undefined);
      
      const lastMsg = updates[updates.length - 1].message || {};
      return {
        triggered: true,
        hasMessages: true,
        count: updates.length,
        text: lastMsg.text || "",
        chatId: lastMsg.chat?.id,
        from: lastMsg.from?.username || lastMsg.from?.first_name,
        timestamp: Date.now()
      };
    }

    return {
      triggered: true,
      hasMessages: false,
      count: 0,
      timestamp: Date.now()
    };
  },
};

