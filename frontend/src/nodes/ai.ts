import type { NodeDefinition } from './types';

export const aiNodes: NodeDefinition[] = [
  {
    type: 'action_ai',
    category: 'ai',
    name: 'AI Prompt',
    icon: '🤖',
    color: '#8b5cf6',
    description: 'Send prompt to AI (with optional memory)',
    inputs: [{ id: 'in', type: 'input' }],
    outputs: [{ id: 'out', type: 'output', label: 'Response' }],
    defaultData: { 
      provider: 'openai',
      prompt: '', 
      systemPrompt: '', 
      model: '', 
      temperature: 0.7, 
      enableMemory: false, 
      memoryKey: '', 
      maxMessages: 20, 
      memoryExpiry: 30 
    },
    fields: [
      { key: 'provider', label: 'Provider', type: 'select', options: [
        { value: 'ollama', label: 'Ollama (Local)' },
        { value: 'openai', label: 'OpenAI' },
        { value: 'groq', label: 'Groq' },
        { value: 'openrouter', label: 'OpenRouter' },
        { value: 'custom', label: 'Custom Compatible' },
      ], defaultValue: 'ollama' },
      { key: 'model', label: 'Model', type: 'model-select' },
      { key: 'systemPrompt', label: 'System Prompt', type: 'textarea', placeholder: 'You are a helpful assistant...' },
      { key: 'prompt', label: 'User Prompt', type: 'textarea', placeholder: 'Your prompt... Use {{output}} for previous data', required: true },
      { key: 'temperature', label: 'Temperature (0-1)', type: 'number', placeholder: '0.7', defaultValue: 0.7 },
      { key: 'enableMemory', label: 'Enable Memory', type: 'boolean', defaultValue: false },
      { key: 'memoryKey', label: 'Memory Key', type: 'text', placeholder: '{{chatId}} - unique ID per conversation' },
      { key: 'maxMessages', label: 'Max Messages', type: 'select', options: [
        { value: '5', label: '5 messages' },
        { value: '10', label: '10 messages' },
        { value: '20', label: '20 messages' },
        { value: '50', label: '50 messages' },
        { value: '100', label: '100 messages' },
      ], defaultValue: '20' },
      { key: 'memoryExpiry', label: 'Memory Expiry', type: 'select', options: [
        { value: '5', label: '5 minutes' },
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '60', label: '1 hour' },
        { value: '360', label: '6 hours' },
        { value: '1440', label: '24 hours' },
        { value: '0', label: 'Never expire' },
      ], defaultValue: '30' },
    ],
  },
];
