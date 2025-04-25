import { LockSettings, UsersPolicies } from '/imports/ui/Types/meeting';
import { UserListDropdownInterface } from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';

export interface Writer {
  pageId: string;
  userId: string;
}

export interface GetWritersVariables {
}

export interface GetWritersData {
  pres_page_writers: Writer[];
}

export interface UserListItemProps {
  currentUser: User;
  user: User;
  lockSettings: LockSettings;
  index: number;
  usersPolicies: UsersPolicies;
  userListDropdownItems: UserListDropdownInterface[];
  isBreakout: boolean;
  open: boolean;
  setOpenUserAction: React.Dispatch<React.SetStateAction<string | null>>;
  pageId: string;
}

export interface UserActionPermissions {
  allowedToChatPrivately: boolean | undefined;
  allowedToMuteAudio: boolean | undefined;
  allowedToUnmuteAudio:boolean | undefined;
  allowedToChangeWhiteboardAccess: boolean | undefined;
  allowedToSetPresenter: boolean | undefined;
  allowedToPromote: boolean | undefined;
  allowedToDemote: boolean | undefined;
  allowedToChangeUserLockStatus: boolean | undefined;
  allowedToEjectCameras: boolean | undefined;
  allowedToRemove: boolean | undefined;
}
