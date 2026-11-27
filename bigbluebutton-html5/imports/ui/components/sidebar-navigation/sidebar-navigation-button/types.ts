import { ReactNode } from 'react';
import { PANELS } from '/imports/ui/components/layout/enums';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';

export interface SidebarNavigationButtonProps {
  panel?: typeof PANELS[keyof typeof PANELS];
  isOpened?: boolean;
  iconName: PluginIconType;
  label: string;
  hasNotification?: boolean;
  hasPrivateNotification?: boolean;
  // Spoken in place of the generic state when the button has a notification.
  notificationLabel?: string;
  // Text of a visible badge (e.g. set by a plugin); spoken whenever it is not empty.
  badgeLabel?: string;
  // Number shown under the icon; spoken as part of the button name.
  count?: number;
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
  $hasPrivateNotification?: boolean;
  $disabled?: boolean;
  $locked?: boolean;
}
