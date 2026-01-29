import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SaveFlowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
  defaultName?: string;
  defaultDescription?: string;
}

export default function SaveFlowDialog({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultName = '', 
  defaultDescription = '' 
}: SaveFlowDialogProps) {
  const [name, setName] = useState(defaultName);
  const [description, setDescription] = useState(defaultDescription);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Flow name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await onSave(name, description);
      onClose();
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save flow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
      setName('');
      setDescription('');
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div 
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Save Workflow</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="My Workflow"
              disabled={isSaving}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this workflow do?"
              disabled={isSaving}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
