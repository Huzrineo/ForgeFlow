import Dialog from './Dialog';
import ConfirmDialog from './ConfirmDialog';
import ContextMenu from './ContextMenu';

export default function DialogProvider() {
  return (
    <>
      <Dialog />
      <ConfirmDialog />
      <ContextMenu />
    </>
  );
}
