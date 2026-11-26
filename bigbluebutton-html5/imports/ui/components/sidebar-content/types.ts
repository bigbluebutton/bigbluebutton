import { DispatcherFunction } from '/imports/ui/components/layout/layoutTypes';

interface SidebarContentContanerProps {
  isSharedNotesPinned: boolean;
}

interface SidebarContentProps {
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
