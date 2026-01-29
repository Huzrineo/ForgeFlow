import type { WorkflowTemplate } from '@/types/template';

export const aiTemplates: WorkflowTemplate[] = [
  {
    id: 'ai_text_processor',
    name: 'AI Text Processor',
    description: 'Process text using AI',
    icon: '🤖',
    category: 'AI',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_ai',
        position: { x: 350, y: 150 },
        data: {
          prompt: 'Summarize this text: {{input}}',
          systemPrompt: 'You are a helpful assistant.',
          temperature: 0.7,
        },
      },
      {
        type: 'action_log',
        position: { x: 600, y: 150 },
        data: { message: 'AI Response: {{output}}', level: 'info' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
    ],
  },
  {
    id: 'ai_translator',
    name: 'AI Translator',
    description: 'Translate text using AI',
    icon: '🌍',
    category: 'AI',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 100, y: 150 },
        data: {},
      },
      {
        type: 'action_ai',
        position: { x: 350, y: 150 },
        data: {
          prompt: 'Translate the following text to French: {{input}}',
          systemPrompt: 'You are a translator. Only respond with the translation.',
          temperature: 0.3,
        },
      },
      {
        type: 'action_notification',
        position: { x: 600, y: 150 },
        data: { title: 'Translation', message: '{{output}}' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
    ],
  },
  {
    id: 'ai_blog_writer',
    name: 'AI Blog Writer',
    description: 'Generate blog posts with AI',
    icon: '📝',
    category: 'AI',
    nodes: [
      {
        type: 'trigger_manual',
        position: { x: 50, y: 150 },
        data: {},
      },
      {
        type: 'action_ai',
        position: { x: 300, y: 150 },
        data: {
          prompt: 'Write a blog post about: {{topic}}',
          systemPrompt: 'You are an expert blog writer. Create engaging, SEO-friendly content.',
          temperature: 0.7,
        },
      },
      {
        type: 'action_file',
        position: { x: 550, y: 150 },
        data: { mode: 'write', path: 'blog_post.md', content: '{{output}}' },
      },
      {
        type: 'action_notification',
        position: { x: 800, y: 150 },
        data: { title: 'Done!', message: 'Blog post saved' },
      },
    ],
    connections: [
      { sourceIndex: 0, sourcePort: 'output', targetIndex: 1, targetPort: 'input' },
      { sourceIndex: 1, sourcePort: 'output', targetIndex: 2, targetPort: 'input' },
      { sourceIndex: 2, sourcePort: 'output', targetIndex: 3, targetPort: 'input' },
    ],
  },
];
