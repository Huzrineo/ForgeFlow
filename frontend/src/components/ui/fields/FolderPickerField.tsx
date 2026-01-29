import { useState } from "react";
import { FolderOpen, Folder } from "lucide-react";
import { SelectDirectory } from "../../../../wailsjs/go/main/App";

interface FolderPickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function FolderPickerField({
  value,
  onChange,
  placeholder,
}: FolderPickerFieldProps) {
  const [error, setError] = useState("");

  const handleBrowse = async () => {
    try {
      const result = await SelectDirectory("Select Directory");

      if (result) {
        onChange(result);
        setError("");
      }
    } catch (e: any) {
      setError(e.message || "Failed to select directory");
    }
  };

  const getFolderName = (path: string) => {
    if (!path) return "";
    const parts = path.replace(/\\/g, "/").split("/");
    return parts[parts.length - 1] || parts[parts.length - 2] || path;
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Select folder..."}
          className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="button"
          onClick={handleBrowse}
          className="px-3 py-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
          title="Browse directories"
        >
          <FolderOpen className="w-4 h-4" />
        </button>
      </div>

      {value && (
        <div className="flex items-center gap-2 text-xs text-primary">
          <Folder className="w-3 h-3" />
          <span className="truncate">{getFolderName(value)}</span>
        </div>
      )}

      {error && <div className="text-xs text-destructive">{error}</div>}
    </div>
  );
}
