import type { WorkflowTemplate } from '@/types/template';

export const basicTemplates: WorkflowTemplate[] = [
  {
    id: 'simple_notification',
    name: 'Simple Notification',
    description: 'Manual trigger that shows a notification',
    icon: '🔔',
    category: 'Basic',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_notification',
        position: { x: 350, y: 150 },
        data: { title: 'Hello!', message: 'Workflow executed successfully' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
    ],
  },
  {
    id: 'hello_world',
    name: 'Hello World',
    description: 'A simple workflow to get started',
    icon: '👋',
    category: 'Basic',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_log',
        position: { x: 350, y: 150 },
        data: { message: 'Hello, ForgeFlow!', level: 'info' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
    ],
  },
  {
    id: 'delayed_action',
    name: 'Delayed Action',
    description: 'Trigger with a delay before action',
    icon: '⏰',
    category: 'Basic',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_delay',
        position: { x: 300, y: 150 },
        data: { delay: 2000 },
      },
      {
        type: 'action_notification',
        position: { x: 500, y: 150 },
        data: { title: 'Done!', message: 'Action completed after delay' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
    ],
  },
];
