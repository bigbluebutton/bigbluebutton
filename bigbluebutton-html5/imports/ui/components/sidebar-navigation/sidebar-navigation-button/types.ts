import { ReactNode } from 'react';
import { PANELS } from '/imports/ui/components/layout/enums';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';

export interface SidebarNavigationButtonProps {
  panel?: typeof PANELS[keyof typeof PANELS];
  isOpened?: boolean;
  iconName: PluginIconType;
  label: string;
  hasNotification?: boolean;
  isDisabled?: boolean;
  isLocked?: boolean;
  accessKey?: string;
  dataTest?: string;
  id?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onToggle?: (isOpening: boolean) => void;
  children?: ReactNode;
  ariaDescribedBy?: string;
}

export interface ListItemProps {
  $active?: boolean;
  $hasNotification?: boolean;
  $disabled?: boolean;
  $locked?: boolean;
}
