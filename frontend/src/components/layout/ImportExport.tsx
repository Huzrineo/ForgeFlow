import { useState } from "react";
import { X, Upload, Download, FileJson, AlertCircle } from "lucide-react";
import { useFlowStore } from "@/stores/flowStore";
import { ExportFlow, ImportFlow } from "../../../wailsjs/go/main/Storage";

interface ImportExportProps {
  onClose: () => void;
}

export default function ImportExport({ onClose }: ImportExportProps) {
  const { flows, activeFlowId, nodes, edges, loadFlow } = useFlowStore();
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async (flowId: string) => {
    try {
      const flowData = await ExportFlow(flowId);
      const flow = JSON.parse(flowData);
      
      const blob = new Blob([JSON.stringify(flow, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${flow.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess(`Exported "${flow.name}" successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to export flow: ${err}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleExportCurrent = () => {
    if (!activeFlowId) {
      // Export current canvas as new flow
      const flow = {
        id: crypto.randomUUID(),
        name: "Untitled Flow",
        description: "Exported from canvas",
        nodes,
        edges,
        enabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const blob = new Blob([JSON.stringify(flow, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flow-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setSuccess("Exported current canvas successfully");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      handleExport(activeFlowId);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const flow = JSON.parse(text);
      
      // Validate flow structure
      if (!flow.nodes || !Array.isArray(flow.nodes)) {
        throw new Error("Invalid flow format: missing nodes array");
      }
      if (!flow.edges || !Array.isArray(flow.edges)) {
        throw new Error("Invalid flow format: missing edges array");
      }
      
      // Import flow
      const newFlowId = await ImportFlow(text);
      
      setSuccess(`Imported "${flow.name || 'Untitled Flow'}" successfully`);
      setTimeout(() => {
        setSuccess(null);
        loadFlow(newFlowId);
        onClose();
      }, 2000);
    } catch (err) {
      setError(`Failed to import flow: ${err}`);
    } finally {
      setImporting(false);
      // Reset input
      event.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#252526] rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3e3e42]">
          <div>
            <h2 className="text-lg font-semibold text-[#d4d4d4]">Import / Export Flows</h2>
            <p className="text-sm text-[#858585]">Backup and share your automation flows</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2d2d30] rounded transition-colors"
          >
            <X className="w-5 h-5 text-[#d4d4d4]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <FileJson className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}

          {/* Import Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#d4d4d4] mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import Flow
            </h3>
            <div className="bg-[#1e1e1e] rounded-lg p-6 border-2 border-dashed border-[#3e3e42] hover:border-[#007acc] transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
                id="flow-import"
              />
              <label
                htmlFor="flow-import"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <FileJson className="w-12 h-12 text-[#858585] mb-3" />
                <p className="text-sm text-[#d4d4d4] mb-1">
                  {importing ? "Importing..." : "Click to select a flow file"}
                </p>
                <p className="text-xs text-[#858585]">
                  Supports .json files exported from ForgeFlow
                </p>
              </label>
            </div>
          </div>

          {/* Export Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#d4d4d4] mb-3 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Flows
            </h3>
            
            {/* Current Canvas */}
            {(nodes.length > 0 || edges.length > 0) && (
              <div className="mb-3">
                <button
                  onClick={handleExportCurrent}
                  className="w-full flex items-center justify-between p-4 bg-[#1e1e1e] hover:bg-[#2d2d30] rounded-lg border border-[#3e3e42] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <FileJson className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-[#d4d4d4]">
                        Current Canvas
                      </div>
                      <div className="text-xs text-[#858585]">
                        {nodes.length} nodes, {edges.length} connections
                      </div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#858585]" />
                </button>
              </div>
            )}

            {/* Saved Flows */}
            {flows.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {flows.map((flow) => (
                  <button
                    key={flow.id}
                    onClick={() => handleExport(flow.id)}
                    className="w-full flex items-center justify-between p-4 bg-[#1e1e1e] hover:bg-[#2d2d30] rounded-lg border border-[#3e3e42] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[#2d2d30] flex items-center justify-center">
                        <FileJson className="w-5 h-5 text-[#858585]" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-[#d4d4d4]">
                          {flow.name}
                        </div>
                        <div className="text-xs text-[#858585]">
                          {flow.nodes.length} nodes • Updated {new Date(flow.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-[#858585]" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#858585] text-sm">
                No saved flows to export
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#3e3e42] bg-[#1e1e1e] rounded-b-lg">
          <p className="text-xs text-[#858585]">
            💡 Tip: Exported flows can be shared with others or used as backups
          </p>
        </div>
      </div>
    </div>
  );
}
