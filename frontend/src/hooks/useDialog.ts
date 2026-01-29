import { useCallback } from 'react';
import { useDialogStore } from '@/stores/dialogStore';
import type { DialogOptions } from '@/types/dialog';

export function useDialog() {
  const { openDialog, closeDialog, dialogOpen } = useDialogStore();

  const showDialog = useCallback(
    (options: Omit<DialogOptions, 'onClose'>) => {
      openDialog(options);
    },
    [openDialog]
  );

  return { showDialog, closeDialog, isOpen: dialogOpen };
}
