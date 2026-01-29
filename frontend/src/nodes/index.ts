// Node definitions - modular structure inspired by workflow-automator
import { triggerNodes } from './triggers';
import { actionNodes } from './actions';
import { conditionNodes } from './conditions';
import { aiNodes } from './ai';
import { loopNodes } from './loops';
import { utilityNodes } from './utilities';
import { appNodes } from './apps';
import type { NodeDefinition } from './types';

// Combine all node definitions
export const nodeDefinitions: NodeDefinition[] = [
  ...triggerNodes,
  ...actionNodes,
  ...conditionNodes,
  ...aiNodes,
  ...loopNodes,
  ...utilityNodes,
  ...appNodes,
];

// Helper functions
export function getNodeDefinition(type: string): NodeDefinition | undefined {
  return nodeDefinitions.find(n => n.type === type);
}

export function getNodesByCategory(category: string): NodeDefinition[] {
  return nodeDefinitions.filter(n => n.category === category);
}

// Re-export for convenience
export * from './triggers';
export * from './actions';
export * from './conditions';
export * from './ai';
export * from './loops';
export * from './utilities';
export * from './apps';
export * from './types';
