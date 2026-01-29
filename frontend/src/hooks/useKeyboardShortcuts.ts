import { useEffect, useCallback } from 'react';
import { useFlowStore } from '@/stores/flowStore';
import { useWorkflowStore } from '@/stores/workflowStore';

export function useKeyboardShortcuts() {
  const {
    nodes,
    edges,
    selectedNodeId,
    setSelectedNodeId,
    addNode,
    removeNode,
    saveFlow,
    clearCanvas,
    activeFlowId,
    flows,
  } = useFlowStore();

  const { setShortcutsModalOpen } = useWorkflowStore();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isInputFocused =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement;

      if (isInputFocused) return;

      const isMod = e.ctrlKey || e.metaKey;

      // Escape - deselect node or close shortcuts modal
      if (e.key === 'Escape') {
        if (selectedNodeId) {
          e.preventDefault();
          setSelectedNodeId(null);
        }
        return;
      }

      // Delete/Backspace - delete selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        e.preventDefault();
        removeNode(selectedNodeId);
        setSelectedNodeId(null);
        return;
      }

      // Ctrl+S - save current flow
      if (isMod && e.key === 's') {
        e.preventDefault();
        const currentFlow = flows.find((f) => f.id === activeFlowId);
        if (currentFlow) {
          saveFlow(currentFlow.name, currentFlow.description);
        } else if (nodes.length > 0) {
          saveFlow('Untitled Flow');
        }
        return;
      }

      // Ctrl+N - new flow
      if (isMod && e.key === 'n') {
        e.preventDefault();
        clearCanvas();
        return;
      }

      // Ctrl+D - duplicate selected node
      if (isMod && e.key === 'd' && selectedNodeId) {
        e.preventDefault();
        const node = nodes.find((n) => n.id === selectedNodeId);
        if (node) {
          const newNode = {
            ...node,
            id: crypto.randomUUID(),
            position: {
              x: node.position.x + 50,
              y: node.position.y + 50,
            },
            data: { ...node.data, status: 'idle' as const },
          };
          addNode(newNode);
          setSelectedNodeId(newNode.id);
        }
        return;
      }

      // Ctrl+? - show shortcuts modal
      if (isMod && e.key === '/') {
        e.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }
    },
    [
      nodes,
      edges,
      selectedNodeId,
      setSelectedNodeId,
      addNode,
      removeNode,
      saveFlow,
      clearCanvas,
      activeFlowId,
      flows,
      setShortcutsModalOpen,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
