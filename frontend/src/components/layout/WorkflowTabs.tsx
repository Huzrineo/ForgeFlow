import { useState, useRef, useEffect } from "react";
import { X, Plus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabStore, type Tab } from "@/stores/tabStore";

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  tabId: string | null;
}

export default function WorkflowTabs() {
  const {
    openTabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab,
    closeOtherTabs,
    closeAllTabs,
    duplicateTab,
  } = useTabStore();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    tabId: null,
  });

  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu((prev) => ({ ...prev, visible: false }));
      }
    };

    if (contextMenu.visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu.visible]);

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      tabId,
    });
  };

  const handleMiddleClick = (e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      closeTab(tabId);
    }
  };

  const handleContextAction = (action: string) => {
    if (!contextMenu.tabId) return;

    switch (action) {
      case "close":
        closeTab(contextMenu.tabId);
        break;
      case "closeOthers":
        closeOtherTabs(contextMenu.tabId);
        break;
      case "closeAll":
        closeAllTabs();
        break;
      case "duplicate":
        duplicateTab(contextMenu.tabId);
        break;
    }

    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handleNewTab = () => {
    openTab();
  };

  return (
    <div className="h-8 bg-background/80 border-b border-border/50 flex items-center px-1 gap-0.5 overflow-x-auto scrollbar-thin">
      {openTabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isActive={tab.id === activeTabId}
          onClick={() => setActiveTab(tab.id)}
          onClose={() => closeTab(tab.id)}
          onContextMenu={(e) => handleContextMenu(e, tab.id)}
          onMouseDown={(e) => handleMiddleClick(e, tab.id)}
        />
      ))}

      <button
        onClick={handleNewTab}
        className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors ml-0.5 shrink-0"
        title="New tab"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-popover border border-border rounded-md shadow-lg py-1 min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <ContextMenuItem onClick={() => handleContextAction("close")}>
            Close
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => handleContextAction("closeOthers")}
            disabled={openTabs.length <= 1}
          >
            Close Others
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleContextAction("closeAll")}>
            Close All
          </ContextMenuItem>
          <div className="h-px bg-border my-1" />
          <ContextMenuItem onClick={() => handleContextAction("duplicate")}>
            Duplicate
          </ContextMenuItem>
        </div>
      )}
    </div>
  );
}

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

function TabItem({ tab, isActive, onClick, onClose, onContextMenu, onMouseDown }: TabItemProps) {
  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className={cn(
        "group h-7 flex items-center gap-1.5 px-2.5 rounded-t cursor-pointer transition-colors shrink-0 max-w-[160px]",
        isActive
          ? "bg-muted/80 text-foreground border-b-2 border-primary"
          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      )}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseDown={onMouseDown}
    >
      <FileText className="w-3 h-3 shrink-0 opacity-60" />
      
      <span className="text-xs truncate select-none">{tab.name}</span>
      
      {tab.isUnsaved && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" title="Unsaved changes" />
      )}

      <button
        onClick={handleCloseClick}
        className={cn(
          "w-4 h-4 flex items-center justify-center rounded shrink-0 transition-colors",
          "opacity-0 group-hover:opacity-100",
          isActive && "opacity-60",
          "hover:bg-muted-foreground/20"
        )}
        title="Close tab"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

interface ContextMenuItemProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

function ContextMenuItem({ children, onClick, disabled }: ContextMenuItemProps) {
  return (
    <button
      className={cn(
        "w-full px-3 py-1.5 text-xs text-left transition-colors",
        disabled
          ? "text-muted-foreground cursor-not-allowed"
          : "hover:bg-muted text-foreground"
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
