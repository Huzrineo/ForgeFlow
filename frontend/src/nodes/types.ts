// Node type definitions
export type NodeCategory = 'trigger' | 'action' | 'condition' | 'ai' | 'loop' | 'utility' | 'apps';

export type NodeFieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'password'
  | 'select' 
  | 'boolean' 
  | 'json' 
  | 'code'
  // Custom UI fields
  | 'file'
  | 'file-save'
  | 'folder'
  | 'url'
  | 'cron'
  | 'hotkey'
  | 'model-select';

export interface NodeField {
  key: string;
  label: string;
  type: NodeFieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: any;
  fileTypes?: string[];
}

export interface NodePort {
  id: string;
  type: 'input' | 'output';
  label?: string;
}

export interface NodeDefinition {
  type: string;
  category: NodeCategory;
  name: string;
  icon: string;
  color: string;
  description: string;
  inputs: NodePort[];
  outputs: NodePort[];
  defaultData: Record<string, any>;
  fields: NodeField[];
}
