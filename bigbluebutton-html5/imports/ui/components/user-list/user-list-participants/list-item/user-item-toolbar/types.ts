import React from 'react';
import { User } from '/imports/ui/Types/user';

export interface ToolbarEntry {
  allowed: boolean | undefined;
  icon: string;
  onClick: React.MouseEventHandler;
  dataTest: string;
  label: string;
  key: string;
}

export interface UserItemToolbarProps {
  subjectUser: User;
  pinnedToolbarOptions: ToolbarEntry[];
  otherToolbarOptions: ToolbarEntry[];
  setOpenUserAction: React.Dispatch<React.SetStateAction<string | null>>;
  open: boolean;
}

export default UserItemToolbarProps;
