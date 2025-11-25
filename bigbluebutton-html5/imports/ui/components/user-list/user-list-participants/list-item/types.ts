import { LockSettings, UsersPolicies } from '/imports/ui/Types/meeting';
import { UserListDropdownInterface } from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';

export interface Writer {
  userId: string;
  name: string;
  presenter: boolean;
}

export interface GetWritersVariables {
}

export interface GetWritersData {
  user_whiteboardWriteAccess: Writer[];
}

export interface UserListItemProps {
  currentUserIsModerator: boolean;
  currentUserIsPresenter: boolean;
  currentUserLocked: boolean;
  user: User;
  lockSettings: LockSettings;
  index: number;
  usersPolicies: UsersPolicies;
  userListDropdownItems: UserListDropdownInterface[];
  isBreakout: boolean;
  open: boolean;
  setOpenUserAction: React.Dispatch<React.SetStateAction<string | null>>;
  pageId: string;
  type: 'raised-hand' | 'participant';
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
  allowedToLowerHand: boolean | undefined;
}
