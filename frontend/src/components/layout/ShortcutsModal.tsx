import { useEffect, useRef } from 'react';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkflowStore } from '@/stores/workflowStore';

interface ShortcutItem {
  action: string;
  keys: string[];
}

interface ShortcutGroup {
  category: string;
  shortcuts: ShortcutItem[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    category: 'Edit',
    shortcuts: [
      { action: 'Undo', keys: ['Ctrl', 'Z'] },
      { action: 'Redo', keys: ['Ctrl', 'Y'] },
      { action: 'Copy node', keys: ['Ctrl', 'C'] },
      { action: 'Paste node', keys: ['Ctrl', 'V'] },
      { action: 'Duplicate node', keys: ['Ctrl', 'D'] },
      { action: 'Delete node', keys: ['Delete'] },
      { action: 'Deselect node', keys: ['Esc'] },
    ],
  },
  {
    category: 'File',
    shortcuts: [
      { action: 'Save flow', keys: ['Ctrl', 'S'] },
      { action: 'New flow', keys: ['Ctrl', 'N'] },
    ],
  },
  {
    category: 'Help',
    shortcuts: [
      { action: 'Show shortcuts', keys: ['Ctrl', '/'] },
    ],
  },
];

function KeyBadge({ children }: { children: string }) {
  return (
    <kbd className="px-2 py-1 text-xs font-medium bg-muted border border-border rounded-md min-w-[24px] text-center">
      {children}
    </kbd>
  );
}

export default function ShortcutsModal() {
  const { shortcutsModalOpen, setShortcutsModalOpen } = useWorkflowStore();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && shortcutsModalOpen) {
        setShortcutsModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [shortcutsModalOpen, setShortcutsModalOpen]);

  useEffect(() => {
    if (shortcutsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [shortcutsModalOpen]);

  if (!shortcutsModalOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      setShortcutsModalOpen(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className={cn(
          'w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {shortcutGroups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {group.category}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.action}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.action}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <KeyBadge>{key}</KeyBadge>
                          {i < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Press <KeyBadge>Esc</KeyBadge> to close
          </p>
        </div>
      </div>
    </div>
  );
}
