import type { HandlerContext } from './types';
import * as ActionService from '../../wailsjs/go/main/ActionService';
import type { CustomNodeDefinition } from '@/stores/customNodeStore';

// Replace {{variable}} placeholders with actual values
function interpolate(template: string, variables: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = variables[key];
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  });
}

// Safe script execution with limited globals
function executeScript(script: string, input: Record<string, any>): any {
  const safeGlobals = {
    JSON,
    Math,
    Date,
    String,
    Array,
    Object,
    Number,
    Boolean,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    encodeURIComponent,
    decodeURIComponent,
    encodeURI,
    decodeURI,
  };

  const fn = new Function(
    ...Object.keys(safeGlobals),
    'input',
    `"use strict"; ${script}`
  );

  return fn(...Object.values(safeGlobals), input);
}

export async function executeCustomNode(
  nodeDef: CustomNodeDefinition,
  ctx: HandlerContext
): Promise<any> {
  const { data, onLog, variables } = ctx;
  
  // Merge config data with previous output
  const input: Record<string, any> = {
    ...data,
    _previousOutput: variables['output'],
  };

  onLog('info', `🔧 Custom Node: ${nodeDef.name}`);

  try {
    switch (nodeDef.actionType) {
      case 'shell': {
        const command = interpolate(nodeDef.actionConfig.command || '', input);
        const args = interpolate(nodeDef.actionConfig.args || '', input);
        const workDir = interpolate(nodeDef.actionConfig.workDir || '', input);

        if (!command) {
          throw new Error('No command specified');
        }

        onLog('info', `   💻 Running: ${command} ${args}`);
        if (workDir) onLog('info', `   📁 Dir: ${workDir}`);

        const argList = args ? args.split(' ').filter(Boolean) : [];
        const result = await ActionService.RunCommand(command, argList, workDir);

        if (result.exitCode !== 0) {
          onLog('warn', `   ⚠️ Exit code: ${result.exitCode}`);
          if (result.stderr) onLog('warn', `   ${result.stderr.substring(0, 200)}`);
        } else {
          onLog('success', `✓ Command completed`);
        }

        return {
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          success: result.exitCode === 0,
        };
      }

      case 'http': {
        const method = nodeDef.actionConfig.method || 'GET';
        const url = interpolate(nodeDef.actionConfig.url || '', input);
        const headersStr = interpolate(nodeDef.actionConfig.headers || '{}', input);
        const body = interpolate(nodeDef.actionConfig.body || '', input);

        if (!url) {
          throw new Error('No URL specified');
        }

        let headers: Record<string, string> = {};
        try {
          headers = JSON.parse(headersStr);
        } catch {
          onLog('warn', `   ⚠️ Invalid headers JSON, using empty headers`);
        }

        onLog('info', `   🌐 ${method} ${url}`);

        const response = await ActionService.HTTPRequest(method, url, headers, body);

        onLog('success', `✓ Status: ${response.status}`);

        return response.json || response.body;
      }

      case 'script': {
        const script = nodeDef.actionConfig.script || 'return input;';

        onLog('info', `   📜 Executing script...`);

        const result = executeScript(script, input);

        onLog('success', `✓ Script completed`);

        return result;
      }

      default:
        throw new Error(`Unknown action type: ${nodeDef.actionType}`);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    onLog('error', `✗ Custom node failed: ${errorMsg}`);
    throw error;
  }
}
