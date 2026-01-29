import { useCallback } from 'react';
import { useDialogStore } from '@/stores/dialogStore';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}

export function useConfirm() {
  const { confirm: openConfirm } = useDialogStore();

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        openConfirm({
          ...options,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
    },
    [openConfirm]
  );

  return { confirm };
}
