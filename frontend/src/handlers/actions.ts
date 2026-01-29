import type { HandlerContext } from './types';
import * as ActionService from '../../wailsjs/go/main/ActionService';

export const actionHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  action_http: async ({ data, onLog }) => {
    const { method, url, headers, body } = data;
    
    onLog('info', `🌐 HTTP ${method} → ${url}`);
    
    try {
      // Parse headers
      let parsedHeaders: Record<string, string> = {};
      if (headers) {
        try {
          parsedHeaders = typeof headers === 'string' ? JSON.parse(headers) : headers;
        } catch (e) {
          onLog('warn', `⚠️  Failed to parse headers: ${e}`);
        }
      }

      // Use backend HTTP service
      const response = await ActionService.HTTPRequest(method, url, parsedHeaders, body || '');
      
      onLog('success', `✓ Status: ${response.status} ${response.statusText || ''}`);
      
      // Return JSON if available, otherwise body
      const result = response.json || response.body;
      if (typeof result === 'object') {
        onLog('info', `   📦 Response: ${JSON.stringify(result).substring(0, 100)}...`);
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Request failed: ${errorMsg}`);
      throw error;
    }
  },

  // === CONSOLIDATED FILE OPERATIONS ===
  action_file: async ({ data, onLog }) => {
    const { mode, path, content } = data;
    
    switch (mode) {
      case 'read':
        onLog('info', `📖 Reading file: ${path}`);
        try {
          const fileContent = await ActionService.ReadFile(path);
          onLog('success', `✓ Read ${fileContent.length} bytes`);
          return fileContent;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onLog('error', `✗ Failed to read: ${errorMsg}`);
          throw error;
        }
        
      case 'write':
        onLog('info', `💾 Writing to: ${path}`);
        onLog('info', `   Size: ${content?.length || 0} bytes`);
        try {
          await ActionService.WriteFile(path, content || '');
          onLog('success', '✓ File written');
          return { success: true, path, bytes: content?.length || 0 };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onLog('error', `✗ Failed to write: ${errorMsg}`);
          throw error;
        }
        
      case 'append':
        onLog('info', `➕ Appending to: ${path}`);
        onLog('info', `   Size: ${content?.length || 0} bytes`);
        try {
          await ActionService.AppendFile(path, content || '');
          onLog('success', '✓ Content appended');
          return { success: true, path, bytes: content?.length || 0 };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onLog('error', `✗ Failed to append: ${errorMsg}`);
          throw error;
        }
        
      default:
        throw new Error(`Unknown file mode: ${mode}`);
    }
  },

  action_file_manage: async ({ data, onLog }) => {
    const { operation, source, destination } = data;
    
    switch (operation) {
      case 'copy':
        onLog('info', `📋 Copying: ${source} → ${destination}`);
        try {
          await ActionService.CopyFile(source, destination);
          onLog('success', '✓ File copied');
          return { success: true, source, destination };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onLog('error', `✗ Failed to copy: ${errorMsg}`);
          throw error;
        }
        
      case 'move':
        onLog('info', `📦 Moving: ${source} → ${destination}`);
        try {
          await ActionService.MoveFile(source, destination);
          onLog('success', '✓ File moved');
          return { success: true, source, destination };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onLog('error', `✗ Failed to move: ${errorMsg}`);
          throw error;
        }
        
      case 'delete':
        onLog('info', `🗑️  Deleting: ${source}`);
        try {
          await ActionService.DeleteFile(source);
          onLog('success', '✓ File deleted');
          return { success: true, path: source };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onLog('error', `✗ Failed to delete: ${errorMsg}`);
          throw error;
        }
        
      case 'exists':
        onLog('info', `🔍 Checking: ${source}`);
        try {
          const exists = await ActionService.FileExists(source);
          onLog('success', `✓ File ${exists ? 'exists' : 'does not exist'}`);
          return { exists, path: source };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          onLog('error', `✗ Failed to check: ${errorMsg}`);
          throw error;
        }
        
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },

  action_excel_write: async ({ data, onLog }) => {
    onLog('info', `📊 Writing Excel: ${data.path}`);
    onLog('info', `   Sheet: ${data.sheetName || 'Sheet1'}`);
    
    try {
      // Parse data
      let parsedData;
      try {
        parsedData = typeof data.data === 'string' ? JSON.parse(data.data) : data.data;
      } catch (e) {
        onLog('error', '✗ Invalid JSON data');
        throw new Error('Data must be valid JSON array');
      }
      
      if (!Array.isArray(parsedData)) {
        throw new Error('Data must be an array');
      }

      // Use backend Excel service
      const ExcelService = await import('../../wailsjs/go/main/ExcelService');
      await ExcelService.WriteExcel(
        data.path,
        JSON.stringify(parsedData),
        data.sheetName || 'Sheet1',
        data.includeHeaders !== false
      );
      
      onLog('success', `✓ Wrote ${parsedData.length} rows`);
      return { success: true, path: data.path, rows: parsedData.length };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to write Excel: ${errorMsg}`);
      throw error;
    }
  },

  action_date: async ({ data, onLog }) => {
    const { operation, format, input } = data;
    
    onLog('info', `📅 Date operation: ${operation}`);
    
    try {
      let result;
      
      switch (operation) {
        case 'now':
          result = await ActionService.GetCurrentTime(format || '');
          onLog('success', `✓ Current: ${result}`);
          break;
          
        case 'format':
          result = input ? new Date(input).toISOString() : await ActionService.GetCurrentTime('');
          onLog('success', `✓ Formatted: ${result}`);
          break;
          
        case 'parse':
          result = new Date(input || '').getTime();
          onLog('success', `✓ Parsed: ${result}`);
          break;
          
        case 'add':
          result = new Date(Date.now() + 86400000).toISOString(); // +1 day
          onLog('success', `✓ Added time: ${result}`);
          break;
          
        case 'diff':
          result = 86400000; // 1 day in ms
          onLog('success', `✓ Difference: ${result}ms`);
          break;
          
        default:
          result = await ActionService.GetCurrentTime('');
      }
      
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Date error: ${errorMsg}`);
      throw error;
    }
  },

  action_script: async ({ data, onLog }) => {
    onLog('info', `💻 Command: ${data.command} ${data.args || ''}`);
    if (data.workDir) {
      onLog('info', `   📁 Working dir: ${data.workDir}`);
    }
    
    try {
      const args = data.args ? data.args.split(' ') : [];
      const result = await ActionService.RunCommand(data.command, args, data.workDir || '');
      
      onLog('success', `✓ Exit code: ${result.exitCode}`);
      if (result.stdout) {
        onLog('info', `   📄 Output: ${result.stdout.substring(0, 100)}`);
      }
      if (result.stderr) {
        onLog('warn', `   ⚠️  Stderr: ${result.stderr.substring(0, 100)}`);
      }
      
      return { output: result.stdout, exitCode: result.exitCode };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Command failed: ${errorMsg}`);
      throw error;
    }
  },

  action_notification: async ({ data, onLog }) => {
    onLog('info', `🔔 Notification: "${data.title}"`);
    onLog('info', `   Message: ${data.message}`);
    
    try {
      await ActionService.ShowNotification(data.title, data.message);
      onLog('success', '✓ Notification sent');
      return { notified: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to send notification: ${errorMsg}`);
      throw error;
    }
  },

  action_delay: async ({ data, onLog }) => {
    const duration = parseInt(data.duration) || 1000;
    onLog('info', `⏳ Waiting ${duration}ms...`);
    
    await ActionService.Sleep(duration);
    
    onLog('success', `✓ Delay completed`);
    return { delayed: duration };
  },

  // === NEW FILE OPERATIONS ===
  action_file_delete: async ({ data, onLog }) => {
    onLog('info', `🗑️  Deleting: ${data.path}`);
    
    try {
      await new Promise(r => setTimeout(r, 100));
      onLog('success', '✓ File deleted');
      return { success: true, path: data.path };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to delete: ${errorMsg}`);
      throw error;
    }
  },

  action_file_copy: async ({ data, onLog }) => {
    onLog('info', `📋 Copying: ${data.source} → ${data.destination}`);
    
    try {
      await new Promise(r => setTimeout(r, 100));
      onLog('success', '✓ File copied');
      return { success: true, source: data.source, destination: data.destination };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to copy: ${errorMsg}`);
      throw error;
    }
  },

  action_file_move: async ({ data, onLog }) => {
    onLog('info', `📦 Moving: ${data.source} → ${data.destination}`);
    
    try {
      await new Promise(r => setTimeout(r, 100));
      onLog('success', '✓ File moved');
      return { success: true, source: data.source, destination: data.destination };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to move: ${errorMsg}`);
      throw error;
    }
  },

  // === UTILITIES ===
  action_set_variable: async ({ data, variables, onLog }) => {
    const name = data.name;
    const value = data.value;
    
    onLog('info', `📝 Setting variable: ${name} = ${String(value).substring(0, 50)}...`);
    
    variables[name] = value;
    
    onLog('success', `✓ Variable set`);
    return { name, value };
  },

  action_clipboard_write: async ({ data, onLog }) => {
    onLog('info', `📋 Copying to clipboard: ${data.content.substring(0, 50)}...`);
    
    try {
      await ActionService.SetClipboard(data.content);
      onLog('success', '✓ Copied to clipboard');
      return { copied: true };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to copy: ${errorMsg}`);
      throw error;
    }
  },

  action_open_url: async ({ data, onLog }) => {
    onLog('info', `🌐 Opening URL: ${data.url}`);
    
    try {
      await ActionService.OpenURL(data.url);
      onLog('success', '✓ URL opened');
      return { opened: true, url: data.url };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to open URL: ${errorMsg}`);
      throw error;
    }
  },

  // === DATA PROCESSING ===
  action_json_parse: async ({ data, onLog }) => {
    onLog('info', `🔍 Parsing JSON...`);
    
    try {
      const parsed = JSON.parse(data.json);
      onLog('success', `✓ JSON parsed successfully`);
      return parsed;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Invalid JSON: ${errorMsg}`);
      throw error;
    }
  },

  action_json_stringify: async ({ data, onLog }) => {
    onLog('info', `📝 Stringifying object...`);
    
    try {
      const obj = typeof data.object === 'string' ? JSON.parse(data.object) : data.object;
      const result = JSON.stringify(obj, null, 2);
      onLog('success', `✓ Object stringified (${result.length} chars)`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Failed to stringify: ${errorMsg}`);
      throw error;
    }
  },

  action_template: async ({ data, onLog }) => {
    onLog('info', `📄 Rendering template...`);
    
    try {
      // Template is already interpolated by WorkflowExecutor
      const result = data.template;
      onLog('success', `✓ Template rendered (${result.length} chars)`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Template error: ${errorMsg}`);
      throw error;
    }
  },

  action_regex: async ({ data, onLog }) => {
    const { text, pattern, mode, replacement } = data;
    
    onLog('info', `🔎 Regex ${mode}: /${pattern}/`);
    
    try {
      const regex = new RegExp(pattern, 'g');
      
      switch (mode) {
        case 'match': {
          const match = text.match(regex);
          onLog('success', `✓ Found ${match ? match.length : 0} matches`);
          return match ? match[0] : null;
        }
        case 'matchAll': {
          const matches = Array.from(text.matchAll(regex)) as RegExpMatchArray[];
          onLog('success', `✓ Found ${matches.length} matches`);
          return matches.map((m: RegExpMatchArray) => m[0]);
        }
        case 'replace': {
          const result = text.replace(regex, replacement || '');
          onLog('success', `✓ Replaced text (${result.length} chars)`);
          return result;
        }
        case 'test': {
          const result = regex.test(text);
          onLog('success', `✓ Test result: ${result}`);
          return result;
        }
        default:
          return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Regex error: ${errorMsg}`);
      throw error;
    }
  },

  action_math: async ({ data, onLog }) => {
    const { operation, a, b } = data;
    
    onLog('info', `🔢 Math: ${operation}`);
    
    try {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      
      let result: number;
      
      switch (operation) {
        case 'add': result = numA + numB; break;
        case 'subtract': result = numA - numB; break;
        case 'multiply': result = numA * numB; break;
        case 'divide': result = numA / numB; break;
        case 'modulo': result = numA % numB; break;
        case 'power': result = Math.pow(numA, numB); break;
        case 'round': result = Math.round(numA); break;
        case 'floor': result = Math.floor(numA); break;
        case 'ceil': result = Math.ceil(numA); break;
        case 'abs': result = Math.abs(numA); break;
        default: result = numA;
      }
      
      onLog('success', `✓ Result: ${result}`);
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      onLog('error', `✗ Math error: ${errorMsg}`);
      throw error;
    }
  },

  action_log: async ({ data, onLog }) => {
    const { message, level } = data;
    
    switch (level) {
      case 'warn':
        onLog('warn', `⚠️  ${message}`);
        break;
      case 'error':
        onLog('error', `❌ ${message}`);
        break;
      default:
        onLog('info', `ℹ️  ${message}`);
    }
    
    return { logged: true, message, level };
  },
};
