import { X, Settings, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CronField, HotkeyField, FilePickerField, FolderPickerField } from "@/components/ui/fields";
import { useFlowStore } from "@/stores/flowStore";
import { cn } from "@/lib/utils";
import type { NodeCategory } from "@/types/flow";
import { getNodeDefinition } from "@/nodes";

const categoryLabels: Record<NodeCategory, string> = {
  trigger: "Trigger",
  condition: "Condition",
  action: "Action",
  ai: "AI Action",
  output: "Output",
  loop: "Loop",
  utility: "Utility",
  apps: "App Action",
};

const categoryColors: Record<NodeCategory, string> = {
  trigger: "text-emerald-400 border-emerald-500/30",
  condition: "text-amber-400 border-amber-500/30",
  action: "text-blue-400 border-blue-500/30",
  ai: "text-purple-400 border-purple-500/30",
  output: "text-rose-400 border-rose-500/30",
  loop: "text-violet-400 border-violet-500/30",
  utility: "text-slate-400 border-slate-500/30",
  apps: "text-teal-400 border-teal-500/30",
};

interface NodeSettingsProps {
  selectedNodeId: string | null;
  onClose: () => void;
}

export default function NodeSettings({ selectedNodeId, onClose }: NodeSettingsProps) {
  const { nodes, updateNodeData } = useFlowStore();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  
  if (!selectedNode) return null;

  const { data } = selectedNode;
  const config = (data.config || {}) as Record<string, any>;
  const definition = getNodeDefinition(data.nodeType || "");
  const hasFields = definition && definition.fields && definition.fields.length > 0;

  const handleConfigChange = (key: string, value: any) => {
    updateNodeData(selectedNode.id, {
      config: { ...config, [key]: value },
    });
  };

  return (
    <aside className="w-64 h-full bg-card border-l border-border flex flex-col text-xs">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          <h2 className="text-xs font-semibold">Settings</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Node Info */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Type
            </label>
            <span className="text-[10px] text-muted-foreground/50 font-mono">
              {data.nodeType}
            </span>
          </div>
          <div className={cn("px-2 py-1.5 rounded-md border bg-background/50 text-xs flex items-center gap-2", categoryColors[data.category])}>
            <span className="text-sm">{data.icon}</span>
            <span className="font-semibold">{categoryLabels[data.category]}</span>
          </div>
        </div>

        {/* Node Label */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Label
          </label>
          <input
            type="text"
            value={data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Description
          </label>
          <textarea
            value={data.description || ""}
            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
            rows={2}
            className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none transition-all"
            placeholder="Node purpose..."
          />
        </div>

        {/* Dynamic Configuration */}
        <div className="pt-3 border-t border-border space-y-3">
          <div className="flex items-center gap-1.5 mb-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Configuration
            </h3>
            {definition?.description && (
              <div title={definition.description} className="cursor-help text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <Info className="w-3 h-3" />
              </div>
            )}
          </div>

          {hasFields ? (
            <div className="space-y-3.5">
              {definition.fields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-medium text-muted-foreground">
                      {field.label}
                      {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                    </label>
                  </div>

                  {field.type === "text" && (
                    <input
                      type="text"
                      value={String(config[field.key] ?? "")}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      value={String(config[field.key] ?? "")}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 resize-vertical transition-all font-mono"
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      value={Number(config[field.key] ?? 0)}
                      onChange={(e) => handleConfigChange(field.key, parseFloat(e.target.value))}
                      placeholder={field.placeholder}
                      className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  )}

                  {field.type === "password" && (
                    <input
                      type="password"
                      value={String(config[field.key] ?? "")}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      value={String(config[field.key] ?? "")}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      className="w-full px-2 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    >
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === "boolean" && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative inline-flex h-4 w-7 items-center rounded-full bg-border group-hover:bg-border/80 transition-colors">
                        <input
                          type="checkbox"
                          className="sr-only p-0"
                          checked={!!config[field.key]}
                          onChange={(e) => handleConfigChange(field.key, e.target.checked)}
                        />
                        <span
                          className={cn(
                            "inline-block h-3 w-3 translate-x-0.5 rounded-full bg-white transition-transform",
                            config[field.key] ? "translate-x-3.5 bg-primary" : "translate-x-0.5"
                          )}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        Enabled
                      </span>
                    </label>
                  )}

                  {field.type === "cron" && (
                    <CronField
                      value={String(config[field.key] ?? "")}
                      onChange={(value) => handleConfigChange(field.key, value)}
                      placeholder={field.placeholder}
                    />
                  )}

                  {field.type === "hotkey" && (
                    <HotkeyField
                      value={String(config[field.key] ?? "")}
                      onChange={(value) => handleConfigChange(field.key, value)}
                      placeholder={field.placeholder}
                    />
                  )}

                  {field.type === "file" && (
                    <FilePickerField
                      value={String(config[field.key] ?? "")}
                      onChange={(value) => handleConfigChange(field.key, value)}
                      placeholder={field.placeholder}
                      mode="open"
                    />
                  )}
                  
                  {field.type === "file-save" && (
                    <FilePickerField
                      value={String(config[field.key] ?? "")}
                      onChange={(value) => handleConfigChange(field.key, value)}
                      placeholder={field.placeholder}
                      mode="save"
                    />
                  )}

                  {field.type === "folder" && (
                    <FolderPickerField
                      value={String(config[field.key] ?? "")}
                      onChange={(value) => handleConfigChange(field.key, value)}
                      placeholder={field.placeholder}
                    />
                  )}

                  {field.type === "model-select" && (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={String(config[field.key] ?? "")}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                        placeholder={config.provider === 'groq' ? 'llama3-8b-8192' : config.provider === 'openrouter' ? 'google/gemini-flash-1.5' : 'gpt-4o-mini'}
                        className="w-full px-2.5 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                      <div className="flex flex-wrap gap-1">
                        {(config.provider === 'groq' 
                          ? ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768', 'gemma-7b-it'] 
                          : config.provider === 'openrouter'
                          ? ['google/gemini-flash-1.5', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3-70b-instruct']
                          : ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']
                        ).map(m => (
                          <button 
                            key={m}
                            type="button"
                            onClick={() => handleConfigChange(field.key, m)}
                            className="px-1.5 py-0.5 rounded bg-muted/50 hover:bg-muted text-[9px] text-muted-foreground border border-border transition-colors"
                          >
                            {m.split('/').pop()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-1 bg-muted/20 rounded-lg border border-dashed border-border">
              <span className="text-[10px] text-muted-foreground/60 italic font-medium">
                No configuration required
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
