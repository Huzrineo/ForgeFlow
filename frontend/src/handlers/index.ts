// Handler registry - combines all handlers
import type { HandlerContext } from './types';
import { triggerHandlers } from './triggers';
import { actionHandlers } from './actions';
import { conditionHandlers } from './conditions';
import { aiHandlers } from './ai';
import { loopHandlers } from './loops';
import { utilityHandlers } from './utilities';
import { appHandlers } from './apps';

export type { HandlerContext, LogLevel, LogCallback } from './types';

// Combine all handlers into a single registry
export const nodeHandlers: Record<string, (ctx: HandlerContext) => Promise<any>> = {
  ...triggerHandlers,
  ...actionHandlers,
  ...conditionHandlers,
  ...aiHandlers,
  ...loopHandlers,
  ...utilityHandlers,
  ...appHandlers,
};

export function getHandler(nodeType: string): ((ctx: HandlerContext) => Promise<any>) | undefined {
  return nodeHandlers[nodeType];
}
