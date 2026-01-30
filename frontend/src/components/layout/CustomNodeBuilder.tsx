import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Code, Terminal, Globe, Wand2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomNodeStore, type CustomNodeDefinition, type CustomNodeActionType } from '@/stores/customNodeStore';
import type { NodeField, NodeCategory, NodeFieldType } from '@/nodes/types';
import { toast } from '@/stores/dialogStore';

const CATEGORIES: { value: NodeCategory; label: string }[] = [
  { value: 'action', label: 'Action' },
  { value: 'utility', label: 'Utility' },
];

const ACTION_TYPES: { value: CustomNodeActionType; label: string; icon: typeof Terminal; description: string }[] = [
  { value: 'shell', label: 'Shell Command', icon: Terminal, description: 'Run a command in the terminal' },
  { value: 'http', label: 'HTTP Request', icon: Globe, description: 'Make an HTTP API call' },
  { value: 'script', label: 'JavaScript', icon: Code, description: 'Run custom JavaScript code' },
];

const FIELD_TYPES: { value: NodeFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'password', label: 'Password' },
  { value: 'boolean', label: 'Toggle' },
  { value: 'select', label: 'Dropdown' },
  { value: 'file', label: 'File Picker' },
  { value: 'folder', label: 'Folder Picker' },
];

const ICONS = ['⚡', '🔧', '📦', '🎯', '🔗', '📊', '🔄', '💾', '📤', '📥', '🔍', '✨', '🚀', '⭐', '💡', '🎨'];

interface FieldEditorProps {
  field: NodeField;
  onChange: (field: NodeField) => void;
  onDelete: () => void;
}

function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
  return (
    <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
      <GripVertical className="w-4 h-4 text-muted-foreground mt-2 cursor-grab" />
      
      <div className="flex-1 grid grid-cols-3 gap-2">
        <input
          type="text"
          value={field.key}
          onChange={(e) => onChange({ ...field, key: e.target.value.replace(/\s/g, '_') })}
          placeholder="variable_name"
          className="px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <input
          type="text"
          value={field.label}
          onChange={(e) => onChange({ ...field, label: e.target.value })}
          placeholder="Display Label"
          className="px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={field.type}
          onChange={(e) => onChange({ ...field, type: e.target.value as NodeFieldType })}
          className="px-2 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {FIELD_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      
      <button onClick={onDelete} className="p-1.5 hover:bg-destructive/20 rounded-md transition-colors">
        <Trash2 className="w-4 h-4 text-destructive" />
      </button>
    </div>
  );
}

export default function CustomNodeBuilder() {
  const { builderOpen, setBuilderOpen, editingNode, addCustomNode, updateCustomNode } = useCustomNodeStore();
  
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [category, setCategory] = useState<NodeCategory>('action');
  const [description, setDescription] = useState('');
  const [actionType, setActionType] = useState<CustomNodeActionType>('shell');
  const [fields, setFields] = useState<NodeField[]>([]);
  
  // Action config
  const [command, setCommand] = useState('');
  const [args, setArgs] = useState('');
  const [workDir, setWorkDir] = useState('');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [script, setScript] = useState('// Access inputs via: input.fieldName\n// Return value becomes the output\nreturn input;');

  // Load editing node data
  useEffect(() => {
    if (editingNode) {
      setName(editingNode.name);
      setIcon(editingNode.icon);
      setCategory(editingNode.category);
      setDescription(editingNode.description);
      setActionType(editingNode.actionType);
      setFields(editingNode.fields);
      setCommand(editingNode.actionConfig.command || '');
      setArgs(editingNode.actionConfig.args || '');
      setWorkDir(editingNode.actionConfig.workDir || '');
      setMethod(editingNode.actionConfig.method || 'GET');
      setUrl(editingNode.actionConfig.url || '');
      setHeaders(editingNode.actionConfig.headers || '');
      setBody(editingNode.actionConfig.body || '');
      setScript(editingNode.actionConfig.script || '');
    } else {
      // Reset form
      setName('');
      setIcon('⚡');
      setCategory('action');
      setDescription('');
      setActionType('shell');
      setFields([]);
      setCommand('');
      setArgs('');
      setWorkDir('');
      setMethod('GET');
      setUrl('');
      setHeaders('');
      setBody('');
      setScript('// Access inputs via: input.fieldName\n// Return value becomes the output\nreturn input;');
    }
  }, [editingNode]);

  if (!builderOpen) return null;

  const handleClose = () => {
    setBuilderOpen(false);
  };

  const handleAddField = () => {
    const newField: NodeField = {
      key: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: 'text',
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, field: NodeField) => {
    const newFields = [...fields];
    newFields[index] = field;
    setFields(newFields);
  };

  const handleDeleteField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Name required', 'Please enter a node name');
      return;
    }

    const nodeType = editingNode?.type || `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    
    const nodeData: Omit<CustomNodeDefinition, 'createdAt' | 'updatedAt' | 'isCustom'> = {
      type: nodeType,
      name: name.trim(),
      icon,
      category,
      color: '#6366f1',
      description: description.trim() || `Custom ${actionType} node`,
      inputs: [{ id: 'in', type: 'input' }],
      outputs: [{ id: 'out', type: 'output', label: 'Result' }],
      defaultData: fields.reduce((acc, f) => ({ ...acc, [f.key]: f.defaultValue || '' }), {}),
      fields,
      actionType,
      actionConfig: {
        command: actionType === 'shell' ? command : undefined,
        args: actionType === 'shell' ? args : undefined,
        workDir: actionType === 'shell' ? workDir : undefined,
        method: actionType === 'http' ? method : undefined,
        url: actionType === 'http' ? url : undefined,
        headers: actionType === 'http' ? headers : undefined,
        body: actionType === 'http' ? body : undefined,
        script: actionType === 'script' ? script : undefined,
      },
    };

    if (editingNode) {
      updateCustomNode(editingNode.type, nodeData);
      toast.success('Node updated', `"${name}" has been updated`);
    } else {
      addCustomNode(nodeData);
      toast.success('Node created', `"${name}" is now available in the sidebar`);
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Wand2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {editingNode ? 'Edit Custom Node' : 'Create Custom Node'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-[auto_1fr_1fr] gap-4">
              {/* Icon Picker */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Icon</label>
                <div className="relative">
                  <button className="w-12 h-12 text-2xl bg-muted border border-border rounded-lg hover:border-primary transition-colors">
                    {icon}
                  </button>
                  <div className="absolute top-full left-0 mt-1 p-2 bg-popover border border-border rounded-lg shadow-xl grid grid-cols-8 gap-1 opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto z-10">
                    {ICONS.map((i) => (
                      <button
                        key={i}
                        onClick={() => setIcon(i)}
                        className={cn(
                          'w-8 h-8 text-lg rounded-md hover:bg-muted transition-colors',
                          icon === i && 'bg-primary/20'
                        )}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Custom Node"
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NodeCategory)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this node do?"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Action Type */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Action Type</h3>
            <div className="grid grid-cols-3 gap-3">
              {ACTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setActionType(type.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    actionType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <type.icon className={cn('w-6 h-6', actionType === type.value ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-xs text-muted-foreground text-center">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Input Fields</h3>
              <button
                onClick={handleAddField}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Field
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Define input fields that users can configure. Use <code className="px-1 py-0.5 bg-muted rounded">{'{{field_name}}'}</code> in your action to reference values.
            </p>

            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No fields defined. Click "Add Field" to create inputs.
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <FieldEditor
                    key={index}
                    field={field}
                    onChange={(f) => handleUpdateField(index, f)}
                    onDelete={() => handleDeleteField(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              {actionType === 'shell' && 'Shell Command Configuration'}
              {actionType === 'http' && 'HTTP Request Configuration'}
              {actionType === 'script' && 'JavaScript Configuration'}
            </h3>

            {actionType === 'shell' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Command *</label>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="e.g., python, node, powershell"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Arguments</label>
                  <input
                    type="text"
                    value={args}
                    onChange={(e) => setArgs(e.target.value)}
                    placeholder="e.g., {{script_path}} --input {{input_file}}"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Working Directory</label>
                  <input
                    type="text"
                    value={workDir}
                    onChange={(e) => setWorkDir(e.target.value)}
                    placeholder="Optional: e.g., C:\Scripts or {{folder}}"
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}

            {actionType === 'http' && (
              <div className="space-y-3">
                <div className="grid grid-cols-[120px_1fr] gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">Method</label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1.5">URL *</label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://api.example.com/{{endpoint}}"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Headers (JSON)</label>
                  <textarea
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    placeholder='{"Authorization": "Bearer {{api_key}}"}'
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1.5">Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"data": "{{input_data}}"}'
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            )}

            {actionType === 'script' && (
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">JavaScript Code</label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="// Access inputs via: input.fieldName&#10;// Access previous node output via: input._previousOutput&#10;// Return value becomes the output&#10;return input;"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  ⚠️ Scripts run in a sandboxed environment. Available: <code>input</code>, <code>JSON</code>, <code>Math</code>, <code>Date</code>, <code>String</code>, <code>Array</code>, <code>Object</code>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">
            Custom nodes are saved locally and persist across sessions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
            >
              {editingNode ? 'Update Node' : 'Create Node'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
