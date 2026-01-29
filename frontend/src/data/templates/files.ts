import type { WorkflowTemplate } from '@/types/template';

export const fileTemplates: WorkflowTemplate[] = [
  {
    id: 'file_watcher',
    name: 'File Watcher',
    description: 'Watch a folder and react to file changes',
    icon: '👁️',
    category: 'Files',
    nodes: [
      {
        type: 'trigger_file',
        position: { x: 100, y: 150 },
        data: { path: 'C:/watched_folder', events: ['create', 'modify'] },
      },
      {
        type: 'action_log',
        position: { x: 350, y: 150 },
        data: { message: 'File changed: {{output.path}}', level: 'info' },
      },
      {
        type: 'action_notification',
        position: { x: 600, y: 150 },
        data: { title: 'File Changed', message: '{{output.path}}' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
    ],
  },
  {
    id: 'file_backup',
    name: 'File Backup',
    description: 'Read a file and create a backup copy',
    icon: '💾',
    category: 'Files',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_file',
        position: { x: 300, y: 150 },
        data: { mode: 'read', path: 'important_file.txt' },
      },
      {
        type: 'action_file',
        position: { x: 550, y: 150 },
        data: { mode: 'write', path: 'important_file_backup.txt', content: '{{output}}' },
      },
      {
        type: 'action_notification',
        position: { x: 800, y: 150 },
        data: { title: 'Backup Complete', message: 'File backed up successfully' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
      { sourceIndex: 2, sourcePort: 'output', targetIndex: 3, targetPort: 'input' },
    ],
  },
  {
    id: 'batch_rename',
    name: 'Batch File Processor',
    description: 'Process multiple files in a folder',
    icon: '📁',
    category: 'Files',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_shell',
        position: { x: 300, y: 150 },
        data: { command: 'dir', args: '/B "C:/folder"' },
      },
      {
        type: 'action_log',
        position: { x: 550, y: 150 },
        data: { message: 'Files found: {{output}}', level: 'info' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
    ],
  },
];
