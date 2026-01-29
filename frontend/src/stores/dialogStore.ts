import { create } from 'zustand';
import type { DialogOptions, ConfirmDialogOptions, ContextMenuOptions } from '@/types/dialog';

interface DialogState {
  // Dialog
  dialogOpen: boolean;
  dialogOptions: DialogOptions | null;
  openDialog: (options: DialogOptions) => void;
  closeDialog: () => void;
  
  // Confirm Dialog
  confirmOpen: boolean;
  confirmOptions: ConfirmDialogOptions | null;
  confirmResolver: ((value: boolean) => void) | null;
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  closeConfirm: (result: boolean) => void;
  
  // Context Menu
  contextMenuOpen: boolean;
  contextMenuOptions: ContextMenuOptions | null;
  openContextMenu: (options: ContextMenuOptions) => void;
  closeContextMenu: () => void;
}

export const useDialogStore = create<DialogState>()((set, get) => ({
  // Dialog
  dialogOpen: false,
  dialogOptions: null,
  openDialog: (options) => set({ dialogOpen: true, dialogOptions: options }),
  closeDialog: () => {
    set((state) => {
      state.dialogOptions?.onClose?.();
      return { dialogOpen: false, dialogOptions: null };
    });
  },
  
  // Confirm Dialog
  confirmOpen: false,
  confirmOptions: null,
  confirmResolver: null,
  confirm: (options) => {
    return new Promise((resolve) => {
      set({ 
        confirmOpen: true, 
        confirmOptions: options,
        confirmResolver: resolve 
      });
    });
  },
  closeConfirm: (result) => {
    const { confirmResolver, confirmOptions } = get();
    if (result) confirmOptions?.onConfirm?.();
    else confirmOptions?.onCancel?.();
    
    if (confirmResolver) confirmResolver(result);
    set({ confirmOpen: false, confirmOptions: null, confirmResolver: null });
  },
  
  // Context Menu
  contextMenuOpen: false,
  contextMenuOptions: null,
  openContextMenu: (options) => set({ contextMenuOpen: true, contextMenuOptions: options }),
  closeContextMenu: () => set({ contextMenuOpen: false, contextMenuOptions: null }),
}));
