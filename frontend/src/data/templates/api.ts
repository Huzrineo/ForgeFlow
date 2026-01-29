import type { WorkflowTemplate } from '@/types/template';

export const apiTemplates: WorkflowTemplate[] = [
  {
    id: 'api_fetch',
    name: 'API Fetch & Log',
    description: 'Fetch data from an API and log the response',
    icon: '🌐',
    category: 'API',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_http',
        position: { x: 300, y: 150 },
        data: {
          method: 'GET',
          url: 'https://jsonplaceholder.typicode.com/posts/1',
          headers: '{}',
          body: '',
        },
      },
      {
        type: 'action_log',
        position: { x: 550, y: 150 },
        data: { message: 'API Response: {{output}}', level: 'info' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
    ],
  },
  {
    id: 'webhook_handler',
    name: 'Webhook Handler',
    description: 'Receive and process webhook data',
    icon: '🔗',
    category: 'API',
    nodes: [
      {
        type: 'trigger_webhook',
        position: { x: 100, y: 150 },
        data: { method: 'POST', path: '/webhook' },
      },
      {
        type: 'action_log',
        position: { x: 350, y: 150 },
        data: { message: 'Webhook received: {{output}}', level: 'info' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
    ],
  },
  {
    id: 'rest_api_crud',
    name: 'REST API Client',
    description: 'Perform CRUD operations on a REST API',
    icon: '📡',
    category: 'API',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_http',
        position: { x: 300, y: 150 },
        data: {
          method: 'POST',
          url: 'https://api.example.com/data',
          headers: '{"Content-Type": "application/json"}',
          body: '{"name": "New Item"}',
        },
      },
      {
        type: 'action_notification',
        position: { x: 550, y: 150 },
        data: { title: 'Success', message: 'Data created successfully' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
    ],
  },
];
