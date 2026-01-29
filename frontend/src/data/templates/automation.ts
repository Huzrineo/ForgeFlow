import type { WorkflowTemplate } from '@/types/template';

export const automationTemplates: WorkflowTemplate[] = [
  {
    id: 'scheduled_task',
    name: 'Scheduled Task',
    description: 'Run a task on a schedule',
    icon: '⏱️',
    category: 'Automation',
    nodes: [
      {
        type: 'trigger_schedule',
        position: { x: 100, y: 150 },
        data: { cron: '0 9 * * *', description: 'Every day at 9 AM' },
      },
      {
        type: 'action_shell',
        position: { x: 350, y: 150 },
        data: { command: 'echo', args: 'Scheduled task running!' },
      },
      {
        type: 'action_log',
        position: { x: 600, y: 150 },
        data: { message: 'Task completed at {{date}}', level: 'info' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
    ],
  },
  {
    id: 'clipboard_monitor',
    name: 'Clipboard Monitor',
    description: 'React to clipboard changes',
    icon: '📋',
    category: 'Automation',
    nodes: [
      {
        type: 'trigger_clipboard',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_log',
        position: { x: 350, y: 150 },
        data: { message: 'Clipboard: {{output}}', level: 'info' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
    ],
  },
  {
    id: 'hotkey_action',
    name: 'Hotkey Action',
    description: 'Trigger an action with a keyboard shortcut',
    icon: '⌨️',
    category: 'Automation',
    nodes: [
      {
        type: 'trigger_hotkey',
        position: { x: 100, y: 150 },
        data: { hotkey: 'Ctrl+Shift+A' },
      },
      {
        type: 'action_notification',
        position: { x: 350, y: 150 },
        data: { title: 'Hotkey Pressed!', message: 'Ctrl+Shift+A was pressed' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
    ],
  },
  {
    id: 'conditional_workflow',
    name: 'Conditional Workflow',
    description: 'Execute different paths based on conditions',
    icon: '🔀',
    category: 'Automation',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 200 },
        data: {},
      },
      {
        type: 'condition_if',
        position: { x: 300, y: 200 },
        data: { condition: '{{value}} > 10', operator: 'greater_than' },
      },
      {
        type: 'action_notification',
        position: { x: 550, y: 100 },
        data: { title: 'True', message: 'Value is greater than 10' },
      },
      {
        type: 'action_notification',
        position: { x: 550, y: 300 },
        data: { title: 'False', message: 'Value is 10 or less' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'true', targetIndex: 2, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'false', targetIndex: 3, targetPort: 'input' },
    ],
  },
  {
    id: 'loop_workflow',
    name: 'Loop Workflow',
    description: 'Process items in a loop',
    icon: '🔄',
    category: 'Automation',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'loop_foreach',
        position: { x: 300, y: 150 },
        data: { array: '[1, 2, 3, 4, 5]' },
      },
      {
        type: 'action_log',
        position: { x: 550, y: 150 },
        data: { message: 'Processing item: {{item}}', level: 'info' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'each', targetIndex: 2, targetPort: 'input' },
    ],
  },
];
