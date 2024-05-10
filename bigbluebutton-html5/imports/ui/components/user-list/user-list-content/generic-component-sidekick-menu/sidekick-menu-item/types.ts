export interface SidekickContentMenuItemProps {
  sidebarContentPanel: string;
  layoutContextDispatch: (...args: unknown[]) => void;
  contentMessage: string;
  iconName: string;
  open: boolean;
  sidekickContentId: string;
  currentSidekickContent: string;
  sidebarContentPanelIsOpen: boolean;
}
