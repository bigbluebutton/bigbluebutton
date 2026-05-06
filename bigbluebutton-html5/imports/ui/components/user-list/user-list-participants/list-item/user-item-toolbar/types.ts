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

export interface UserItemToolbarProps {
  subjectUser: User;
  pinnedToolbarOptions: ToolbarEntry[];
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
