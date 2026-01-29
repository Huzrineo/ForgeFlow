import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useDialogStore } from '@/stores/dialogStore';

export default function ContextMenu() {
  const { contextMenuOpen, contextMenuOptions, closeContextMenu } = useDialogStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };

    const handleScroll = () => {
      closeContextMenu();
    };

    if (contextMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [contextMenuOpen, closeContextMenu]);

  if (!contextMenuOpen || !contextMenuOptions) return null;

  const { items, position } = contextMenuOptions;

  // Calculate position to keep menu in viewport
  const menuWidth = 200;
  const menuHeight = items.length * 36;
  const adjustedX = Math.min(position.x, window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(position.y, window.innerHeight - menuHeight - 10);

  const handleItemClick = (item: typeof items[0]) => {
    if (item.disabled || item.separator) return;
    item.onClick?.();
    closeContextMenu();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        zIndex: 100,
      }}
      className="min-w-[200px] bg-popover border border-border rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
    >
      {items.map((item) => {
        if (item.separator) {
          return (
            <div
              key={item.id}
              className="h-px bg-border my-1 mx-2"
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={cn(
              'w-full px-3 py-2 text-left text-sm flex items-center gap-3 transition-colors',
              item.disabled
                ? 'opacity-50 cursor-not-allowed'
                : item.danger
                  ? 'hover:bg-destructive/10 hover:text-destructive'
                  : 'hover:bg-muted'
            )}
          >
            {item.icon && (
              <span className="w-4 h-4 flex items-center justify-center">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
            {item.shortcut && (
              <span className="text-xs text-muted-foreground">
                {item.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
