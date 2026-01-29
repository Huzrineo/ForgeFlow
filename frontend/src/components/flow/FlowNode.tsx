import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NodeStatus, NodeCategory } from "@/types/flow";

interface FlowNodeProps {
  data: {
    label: string;
    category: NodeCategory;
    icon?: string;
    description?: string;
    status?: NodeStatus;
  };
  selected?: boolean;
}

// Simple square node size for triggers and outputs
const SIMPLE_NODE_SIZE = 40;

const categoryColors: Record<NodeCategory, string> = {
  trigger: "#10b981", // emerald-500
  condition: "#f59e0b", // amber-500
  action: "#3b82f6", // blue-500
  loop: "#8b5cf6", // violet-500
  utility: "#6366f1", // indigo-500
  ai: "#a855f7", // purple-500
  apps: "#0d9488", // teal-600
};

function FlowNode({ data, selected }: FlowNodeProps) {
  const isRunning = data.status === "running";
  const isSuccess = data.status === "success";
  const isError = data.status === "error";
  const categoryColor = categoryColors[data.category] || categoryColors.action;

  // Simple square UI for triggers only
  if (data.category === "trigger") {
    return (
      <div className="flex flex-col items-center gap-1">
        {/* Label above */}
        <span className="text-[9px] font-semibold text-muted-foreground/70">
          {data.label}
        </span>

        {/* Square icon node */}
        <div
          className={cn(
            "relative flex items-center justify-center rounded-lg transition-all duration-200 cursor-move select-none",
            selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            isRunning && "animate-pulse"
          )}
          style={{
            width: SIMPLE_NODE_SIZE,
            height: SIMPLE_NODE_SIZE,
            backgroundColor: isSuccess
              ? "#10b981"
              : isError
              ? "#ef4444"
              : categoryColor,
            boxShadow: selected
              ? `0 0 0 2px ${categoryColor}20`
              : "0 2px 6px rgba(0,0,0,0.25)",
          }}
        >
          {isRunning ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <span className="text-lg">{data.icon || "●"}</span>
          )}

          {/* Output port for triggers */}
          <Handle
            type="source"
            position={Position.Right}
            className="!w-2 !h-2 !-right-1 !border-2"
            style={{
              backgroundColor: "#166534",
              borderColor: categoryColor,
            }}
          />
        </div>
      </div>
    );
  }

  // Card-style UI for all other nodes (actions, conditions, loops, utilities, AI, apps)
  const cardBg =
    data.category === "condition"
      ? "bg-amber-950/30"
      : data.category === "ai"
      ? "bg-purple-950/30"
      : data.category === "loop"
      ? "bg-violet-950/30"
      : data.category === "utility"
      ? "bg-indigo-950/30"
      : data.category === "apps"
      ? "bg-teal-950/30"
      : "bg-blue-950/30";

  const cardBorder =
    data.category === "condition"
      ? "border-amber-500/30"
      : data.category === "ai"
      ? "border-purple-500/30"
      : data.category === "loop"
      ? "border-violet-500/30"
      : data.category === "utility"
      ? "border-indigo-500/30"
      : data.category === "apps"
      ? "border-teal-500/30"
      : "border-blue-500/30";

  const glowColor =
    data.category === "condition"
      ? "shadow-amber-500/40"
      : data.category === "ai"
      ? "shadow-purple-500/40"
      : data.category === "loop"
      ? "shadow-violet-500/40"
      : data.category === "utility"
      ? "shadow-indigo-500/40"
      : data.category === "apps"
      ? "shadow-teal-500/40"
      : "shadow-blue-500/40";

  return (
    <div
      className={cn(
        "px-3 py-2 rounded-lg border min-w-[120px] transition-all duration-200",
        cardBg,
        cardBorder,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        isRunning && `animate-pulse shadow-lg ${glowColor}`,
        isSuccess && "shadow-lg shadow-emerald-500/40",
        isError && "shadow-lg shadow-red-500/40"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-muted !border !border-foreground/20"
      />

      <div className="flex items-center gap-1.5">
        <span className="text-lg">{data.icon || "●"}</span>
        <span className="text-xs font-medium truncate flex-1">{data.label}</span>
        {isRunning && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
        {isSuccess && <span className="text-emerald-400 text-xs">✓</span>}
        {isError && <span className="text-red-400 text-xs">✗</span>}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-muted !border !border-foreground/20"
      />
    </div>
  );
}

export default memo(FlowNode);
