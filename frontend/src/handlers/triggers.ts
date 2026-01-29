import type { HandlerContext } from './types';

export const triggerHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  trigger_manual: async ({ onLog }) => {
    onLog('info', '▶️  Manual trigger activated');
    return { triggered: true, timestamp: Date.now() };
  },

  trigger_hotkey: async ({ data, onLog }) => {
    onLog('info', `⌨️  Hotkey: ${data.hotkey}`);
    onLog('success', '✓ Hotkey pressed');
    return { 
      triggered: true, 
      hotkey: data.hotkey,
      timestamp: Date.now() 
    };
  },

  trigger_schedule: async ({ data, onLog }) => {
    onLog('info', `⏰ Schedule: ${data.cron}`);
    onLog('success', '✓ Trigger condition met');
    return { 
      triggered: true, 
      cron: data.cron,
      timestamp: Date.now() 
    };
  },

  trigger_clipboard: async ({ data, onLog }) => {
    onLog('info', `📋 Clipboard monitor active`);
    onLog('info', `   Text only: ${data.textOnly}`);
    onLog('success', '✓ Clipboard changed');
    return { 
      triggered: true, 
      content: 'Clipboard content here',
      timestamp: Date.now() 
    };
  },

  trigger_file_watch: async ({ data, onLog }) => {
    onLog('info', `👁️  Watching: ${data.path}`);
    onLog('info', `   Events: ${data.events}`);
    onLog('success', '✓ File change detected');
    return { 
      triggered: true, 
      path: data.path, 
      event: data.events,
      timestamp: Date.now() 
    };
  },

  trigger_webhook: async ({ data, onLog }) => {
    onLog('info', `🔗 Webhook: ${data.method} ${data.path}`);
    onLog('info', '   📨 Request received');
    return { 
      triggered: true, 
      method: data.method,
      path: data.path,
      timestamp: Date.now() 
    };
  },

  trigger_startup: async ({ data, onLog }) => {
    const delay = parseInt(data.delay) || 0;
    onLog('info', `🚀 App startup trigger`);
    if (delay > 0) {
      onLog('info', `   Delay: ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
    onLog('success', '✓ Startup complete');
    return { 
      triggered: true, 
      delay,
      timestamp: Date.now() 
    };
  },
};
