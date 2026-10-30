import React from 'react';
import { User } from '/imports/ui/Types/user';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

export interface ToolbarEntry {
  allowed: boolean | undefined;
  icon?: string;
  onClick: React.MouseEventHandler;
  dataTest: string;
  label: string;
  key: string;
  disabled?: boolean;
}

// An entry that shows the subject's mute state. The toolbar resolves it in a
// leaf that reads that state, so a mute change re-renders the leaf, not the row.
export interface MuteStateToolbarEntry {
  allowed: boolean | undefined;
  key: string;
  resolve: (isMuted: boolean) => Omit<ToolbarEntry, 'allowed'>;
}

export interface UserItemToolbarProps {
  subjectUser: User;
  pinnedToolbarOptions: (ToolbarEntry | MuteStateToolbarEntry)[];
  otherToolbarOptions: ToolbarEntry[];
  setOpenUserAction: React.Dispatch<React.SetStateAction<string | null>>;
  open: boolean;
  userListDropdownItems: PluginSdk.UserListDropdownInterface[];
}

export interface DropdownItem {
  key: string;
  label?: string;
  icon?: PluginSdk.PluginIconType;
  tooltip?: string;
  allowed?: boolean;
  iconRight?: PluginSdk.PluginIconType;
  textColor?: string;
  isSeparator?: boolean;
  dataTest?: string;
  contentFunction?: ((element: HTMLElement) => void);
  onClick?: (() => void);
}

export default UserItemToolbarProps;
