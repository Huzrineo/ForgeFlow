import { useCallback } from 'react';
import { useDialogStore } from '@/stores/dialogStore';
import type { ContextMenuItem } from '@/types/dialog';

export function useContextMenu() {
  const { openContextMenu, closeContextMenu } = useDialogStore();

  const showContextMenu = useCallback(
    (e: React.MouseEvent, items: ContextMenuItem[]) => {
      e.preventDefault();
      e.stopPropagation();
      openContextMenu({
        items,
        position: { x: e.clientX, y: e.clientY },
      });
    },
    [openContextMenu]
  );

  return { showContextMenu, closeContextMenu };
}
