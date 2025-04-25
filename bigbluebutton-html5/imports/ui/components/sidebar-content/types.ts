import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';

type ResizableEdge = {
  top: boolean;
  bottom: boolean;
  right: boolean;
  left: boolean;
}

interface SidebarContentContanerProps {
  isSharedNotesPinned: boolean;
}

interface SidebarContentProps {
  top: number;
  left?: number;
  right?: number;
  zIndex: number;
  minWidth: number;
  width: number;
  maxWidth: number;
  minHeight: number;
  height: number;
  maxHeight: number;
  isResizable: boolean;
  resizableEdge: ResizableEdge;
  contextDispatch: DispatcherFunction;
  sidebarContentPanel: string;
  isSharedNotesPinned: boolean;
}

interface SidebarContentPanelProps {
  isRTL: boolean;
  isChrome: boolean;
}

export {
  SidebarContentContanerProps,
  SidebarContentPanelProps,
  SidebarContentProps,
};
