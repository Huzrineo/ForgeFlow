import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDialogStore } from '@/stores/dialogStore';

export default function ConfirmDialog() {
  const { confirmOpen, confirmOptions, closeConfirm } = useDialogStore();
  const overlayRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmOpen && !isLoading) {
        handleCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [confirmOpen, isLoading]);

  useEffect(() => {
    if (confirmOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the confirm button
      setTimeout(() => confirmButtonRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [confirmOpen]);

  if (!confirmOpen || !confirmOptions) return null;

  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
  } = confirmOptions;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      closeConfirm();
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    closeConfirm();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !isLoading) {
      handleCancel();
    }
  };

  const isDanger = variant === 'danger';
  const Icon = isDanger ? AlertTriangle : HelpCircle;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Content */}
        <div className="p-6 text-center">
          <div className={cn(
            'w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center',
            isDanger ? 'bg-destructive/10' : 'bg-primary/10'
          )}>
            <Icon className={cn(
              'w-6 h-6',
              isDanger ? 'text-destructive' : 'text-primary'
            )} />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 pt-0">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50',
              isDanger
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Loading...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
