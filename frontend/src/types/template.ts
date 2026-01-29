export interface TemplateNode {
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface TemplateConnection {
  sourceIndex: number;
  sourcePort: string;
  targetIndex: number;
  targetPort: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  nodes: TemplateNode[];
  connections: TemplateConnection[];
}
