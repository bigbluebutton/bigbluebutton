import React, { useState } from 'react';
import { User } from '/imports/ui/Types/user';
import { LockSettings, UsersPolicies } from '/imports/ui/Types/meeting';
import { useIntl, defineMessages } from 'react-intl';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import logger from '/imports/startup/client/logger';
import { UserListDropdownItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/user-list-dropdown-item/enums';
import {
  SET_ROLE,
  USER_EJECT_CAMERAS,
  CHAT_CREATE_WITH_USER,
} from './mutations';
import {
  SET_CAMERA_PINNED,
  EJECT_FROM_MEETING,
  EJECT_FROM_VOICE,
  SET_PRESENTER,
  SET_LOCKED,
  SET_USER_CHAT_LOCKED,
} from '/imports/ui/core/graphql/mutations/userMutations';
import {
  isVideoPinEnabledForCurrentUser,
  toggleVoice,
  isMe,
  generateActionsPermissions,
  isVoiceOnlyUser,
} from './service';

import { useIsChatEnabled, useIsPrivateChatEnabled } from '/imports/ui/services/features';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';

import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';

import BBBMenu from '/imports/ui/components/common/menu/component';
import { setPendingChat } from '/imports/ui/core/local-states/usePendingChat';
import Styled from './styles';
import { useMutation, useLazyQuery } from '@apollo/client';
import { CURRENT_PAGE_WRITERS_QUERY } from '/imports/ui/components/whiteboard/queries';
import { PRESENTATION_SET_WRITERS } from '/imports/ui/components/presentation/mutations';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import { notify } from '/imports/ui/services/notification';

interface UserActionsProps {
  userListDropdownItems: PluginSdk.UserListDropdownInterface[];
  user: User;
  currentUser: User;
  lockSettings: LockSettings;
  usersPolicies: UsersPolicies;
  isBreakout: boolean;
  children: React.ReactNode;
  pageId: string;
  open: boolean;
  setOpenUserAction: React.Dispatch<React.SetStateAction<string | null>>;
}

interface DropdownItem {
  key: string;
  label?: string;
  icon?: string;
  tooltip?: string;
  allowed?: boolean;
  iconRight?: string;
  textColor?: string;
  isSeparator?: boolean;
  contentFunction?: ((element: HTMLElement) => void);
  onClick?: (() => void);
}

interface Writer {
  pageId: string;
  userId: string;
}

const messages = defineMessages({
  UnpinUserWebcam: {
    id: 'app.userList.menu.webcamUnpin.label',
    description: 'label for pin user webcam',
  },
  PinUserWebcam: {
    id: 'app.userList.menu.webcamPin.label',
    description: 'label for pin user webcam',
  },
  StartPrivateChat: {
    id: 'app.userList.menu.chat.label',
    description: 'label for option to start a new private chat',
  },
  MuteUserAudioLabel: {
    id: 'app.userList.menu.muteUserAudio.label',
    description: 'Forcefully mute this user',
  },
  UnmuteUserAudioLabel: {
    id: 'app.userList.menu.unmuteUserAudio.label',
    description: 'Forcefully unmute this user',
  },
  removeWhiteboardAccess: {
    id: 'app.userList.menu.removeWhiteboardAccess.label',
    description: 'label to remove user whiteboard access',
  },
  giveWhiteboardAccess: {
    id: 'app.userList.menu.giveWhiteboardAccess.label',
    description: 'label to give user whiteboard access',
  },
  takePresenterLabel: {
    id: 'app.actionsBar.actionsDropdown.takePresenter',
    description: 'Set this user to be the presenter in this meeting',
  },
  makePresenterLabel: {
    id: 'app.userList.menu.makePresenter.label',
    description: 'label to make another user presenter',
  },
  PromoteUserLabel: {
    id: 'app.userList.menu.promoteUser.label',
    description: 'Forcefully promote this viewer to a moderator',
  },
  DemoteUserLabel: {
    id: 'app.userList.menu.demoteUser.label',
    description: 'Forcefully demote this moderator to a viewer',
  },
  UnlockUserLabel: {
    id: 'app.userList.menu.unlockUser.label',
    description: 'Unlock individual user',
  },
  LockUserLabel: {
    id: 'app.userList.menu.lockUser.label',
    description: 'Lock a unlocked user',
  },
  lockPublicChat: {
    id: 'app.userList.menu.lockPublicChat.label',
    description: 'label for option to lock user\'s public chat',
  },
  unlockPublicChat: {
    id: 'app.userList.menu.unlockPublicChat.label',
    description: 'label for option to lock user\'s public chat',
  },
  DirectoryLookupLabel: {
    id: 'app.userList.menu.directoryLookup.label',
    description: 'Directory lookup',
  },
  RemoveUserLabel: {
    id: 'app.userList.menu.removeUser.label',
    description: 'Forcefully remove this user from the meeting',
  },
  ejectUserCamerasLabel: {
    id: 'app.userList.menu.ejectUserCameras.label',
    description: 'label to eject user cameras',
  },
  multiUserLimitHasBeenReachedNotification: {
    id: 'app.whiteboard.toolbar.multiUserLimitHasBeenReachedNotification',
    description: 'message for when the maximum number of whiteboard writers has been reached',
  },
  removeUserConfirmation: {
    id: 'app.userList.menu.removeConfirmation.label',
    description: 'Confirmation message for removing a user from the meeting',
  },
});
const makeDropdownPluginItem: (
  userDropdownItems: PluginSdk.UserListDropdownInterface[]) => DropdownItem[] = (
    userDropdownItems: PluginSdk.UserListDropdownInterface[],
  ) => userDropdownItems.map(
    (userDropdownItem: PluginSdk.UserListDropdownInterface) => {
      const returnValue: DropdownItem = {
        isSeparator: false,
        key: userDropdownItem.id,
        iconRight: undefined,
        onClick: undefined,
        label: undefined,
        icon: undefined,
        tooltip: undefined,
        textColor: undefined,
        allowed: undefined,
      };
      switch (userDropdownItem.type) {
        case UserListDropdownItemType.OPTION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownOption;
          returnValue.label = dropdownButton.label;
          returnValue.tooltip = dropdownButton.tooltip;
          returnValue.icon = dropdownButton.icon;
          returnValue.allowed = dropdownButton.allowed;
          returnValue.onClick = dropdownButton.onClick;
          break;
        }
        case UserListDropdownItemType.FIXED_CONTENT_INFORMATION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownFixedContentInformation;
          returnValue.label = dropdownButton.label;
          returnValue.icon = dropdownButton.icon;
          returnValue.iconRight = dropdownButton.iconRight;
          returnValue.textColor = dropdownButton.textColor;
          returnValue.allowed = dropdownButton.allowed;
          break;
        }
        case UserListDropdownItemType.GENERIC_CONTENT_INFORMATION: {
          const dropdownButton = userDropdownItem as PluginSdk.UserListDropdownGenericContentInformation;
          returnValue.allowed = dropdownButton.allowed;
          returnValue.contentFunction = dropdownButton.contentFunction;
          break;
        }
        case UserListDropdownItemType.SEPARATOR: {
          returnValue.allowed = true;
          returnValue.isSeparator = true;
          break;
        }
        default:
          break;
      }
      return returnValue;
    },
  );

const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUser,
  lockSettings,
  usersPolicies,
  isBreakout,
  children,
  pageId = '',
  userListDropdownItems,
  open,
  setOpenUserAction,
}) => {
  const intl = useIntl();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const layoutContextDispatch = layoutDispatch();

  const [presentationSetWriters] = useMutation(PRESENTATION_SET_WRITERS);
  const [getWriters] = useLazyQuery(
    CURRENT_PAGE_WRITERS_QUERY,
    {
      variables: { pageId },
      fetchPolicy: 'no-cache',
    },
  );
  const voiceToggle = useToggleVoice();
  const isChatEnabled = useIsChatEnabled();
  const isPrivateChatEnabled = useIsPrivateChatEnabled();

  const handleWhiteboardAccessChange = async () => {
    // There is no presentation available, so access cannot be granted.
    if (!pageId) return;
    try {
      // Fetch the writers data
      const { data } = await getWriters();
      const allWriters: Writer[] = data?.pres_page_writers || [];
      const currentWriters = allWriters?.filter((writer: Writer) => writer.pageId === pageId);

      // Determine if the user has access
      const { userId, presPagesWritable } = user;
      const hasAccess = presPagesWritable.some(
        (page: { userId: string; isCurrentPage: boolean }) => (page?.userId === userId && page?.isCurrentPage),
      );

      // Prepare the updated list of user IDs for whiteboard access
      const usersIds = currentWriters?.map((writer: { userId: string }) => writer?.userId);
      const newUsersIds: string[] = hasAccess
        ? usersIds.filter((id: string) => id !== userId)
        : [...usersIds, userId];

      // Check if the maximum number of writers has been reached.
      // If so, notify the user then return.
      const WHITEBOARD_CONFIG = window.meetingClientSettings.public.whiteboard;
      if (newUsersIds.length >= WHITEBOARD_CONFIG.maxNumberOfActiveUsers) {
        notify(
          intl.formatMessage(
            messages.multiUserLimitHasBeenReachedNotification,
            { numberOfUsers: WHITEBOARD_CONFIG.maxNumberOfActiveUsers },
          ),
          'info',
          'pen_tool',
        );
        return;
      }

      // Update the writers
      await presentationSetWriters({
        variables: {
          pageId,
          usersIds: newUsersIds,
        },
      });
    } catch (error) {
      logger.warn({
        logCode: 'user_action_whiteboard_access_failed',
      }, 'Error updating whiteboard access.');
    }
  };

  const { data: unmutedUsers } = useWhoIsUnmuted();
  const isMuted = !unmutedUsers[user.userId];

  const actionsnPermitions = generateActionsPermissions(
    user,
    currentUser,
    lockSettings,
    usersPolicies,
    isBreakout,
    isMuted,
  );
  const {
    allowedToChatPrivately,
    allowedToMuteAudio,
    allowedToUnmuteAudio,
    allowedToChangeWhiteboardAccess,
    allowedToSetPresenter,
    allowedToPromote,
    allowedToDemote,
    allowedToChangeUserLockStatus,
    allowedToRemove,
    allowedToEjectCameras,
  } = actionsnPermitions;

  const userLocked = user.locked
    && lockSettings?.hasActiveLockSetting
    && !user.isModerator;

  const userChatLocked = user.userLockSettings?.disablePublicChat;

  const userDropdownItems = userListDropdownItems.filter(
    (item: PluginSdk.UserListDropdownInterface) => (user?.userId === item?.userId),
  );

  const hasWhiteboardAccess = user.presPagesWritable?.some(
    (page: { pageId: string; userId: string }) => (page.pageId === pageId && page.userId === user.userId),
  );

  const [setRole] = useMutation(SET_ROLE);
  const [chatCreateWithUser] = useMutation(CHAT_CREATE_WITH_USER);
  const [setCameraPinned] = useMutation(SET_CAMERA_PINNED);
  const [ejectFromMeeting] = useMutation(EJECT_FROM_MEETING);
  const [ejectFromVoice] = useMutation(EJECT_FROM_VOICE);
  const [setPresenter] = useMutation(SET_PRESENTER);
  const [setLocked] = useMutation(SET_LOCKED);
  const [setUserChatLocked] = useMutation(SET_USER_CHAT_LOCKED);
  const [userEjectCameras] = useMutation(USER_EJECT_CAMERAS);

  const removeUser = (userId: string, banUser: boolean) => {
    if (isVoiceOnlyUser(user.userId)) {
      ejectFromVoice({
        variables: {
          userId,
          banUser,
        },
      });
    } else {
      ejectFromMeeting({
        variables: {
          userId,
          banUser,
        },
      });
    }
  };
  const titleActions = userDropdownItems.filter(
    (item: PluginSdk.UserListDropdownInterface) => (
      item?.type === UserListDropdownItemType.TITLE_ACTION),
  );
  const dropdownOptions = [
    {
      allowed: true,
      key: 'userName',
      label: user.name,
      titleActions,
      isTitle: true,
    },
    ...makeDropdownPluginItem(userDropdownItems.filter(
      (item: PluginSdk.UserListDropdownInterface) => (
        item?.type === UserListDropdownItemType.FIXED_CONTENT_INFORMATION
        || item?.type === UserListDropdownItemType.GENERIC_CONTENT_INFORMATION
        || (item?.type === UserListDropdownItemType.SEPARATOR
          && (item as PluginSdk.UserListDropdownSeparator)?.position
          === PluginSdk.UserListDropdownSeparatorPosition.BEFORE)),
    )),
    {
      allowed: user?.cameras?.length > 0
        && isVideoPinEnabledForCurrentUser(currentUser, isBreakout),
      key: 'pinVideo',
      label: user.pinned
        ? intl.formatMessage(messages.UnpinUserWebcam)
        : intl.formatMessage(messages.PinUserWebcam),
      onClick: () => {
        // toggle user pinned status
        setCameraPinned({
          variables: {
            userId: user.userId,
            pinned: !user.pinned,
          },
        });
      },
      icon: user.pinned ? 'pin-video_off' : 'pin-video_on',
    },
    {
      allowed: (() => {
        const preventSelfChat = user.userId !== currentUser.userId;
        const moderatorOverride = currentUser.isModerator
          && allowedToChatPrivately;
        const regularUserCondition = (isPrivateChatEnabled
          && isChatEnabled
          && !lockSettings?.disablePrivateChat
          && !isVoiceOnlyUser(user.userId)
          && !isBreakout)
          || user.isModerator;

        const isAllowed = preventSelfChat
          && (moderatorOverride || regularUserCondition || !currentUser.locked);

        return isAllowed;
      })(),
      key: 'activeChat',
      label: intl.formatMessage(messages.StartPrivateChat),
      onClick: () => {
        setPendingChat(user.userId);
        setOpenUserAction(null);
        chatCreateWithUser({
          variables: {
            userId: user.userId,
          },
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: true,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.CHAT,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: '',
        });
      },
      icon: 'chat',
      dataTest: 'startPrivateChat',
    },
    {
      allowed: isChatEnabled
        && !user.isModerator
        && currentUser.isModerator
        && !isVoiceOnlyUser(user.userId),
      key: 'lockChat',
      label: userChatLocked
        ? intl.formatMessage(messages.unlockPublicChat)
        : intl.formatMessage(messages.lockPublicChat),
      onClick: () => {
        try {
          setUserChatLocked({ variables: { userId: user.userId, disablePubChat: !userChatLocked } });
        } catch (e) {
          logger.error('Error on trying to toggle muted');
        }
        setOpenUserAction(null);
      },
      icon: userChatLocked ? 'unlock' : 'lock',
      dataTest: 'togglePublicChat',
    },
    {
      allowed: allowedToMuteAudio
        && !isBreakout,
      key: 'mute',
      label: intl.formatMessage(messages.MuteUserAudioLabel),
      onClick: () => {
        toggleVoice(user.userId, true, voiceToggle);
        setOpenUserAction(null);
      },
      icon: 'mute',
    },
    {
      allowed: allowedToUnmuteAudio
        && !lockSettings?.disableMic
        && !isBreakout,
      key: 'unmute',
      label: intl.formatMessage(messages.UnmuteUserAudioLabel),
      onClick: () => {
        toggleVoice(user.userId, false, voiceToggle);
        setOpenUserAction(null);
      },
      icon: 'unmute',
      dataTest: 'unmuteUser',
    },
    {
      allowed: allowedToChangeWhiteboardAccess
        && !user.presenter
        && !isVoiceOnlyUser(user.userId)
        && pageId,
      key: 'changeWhiteboardAccess',
      label: hasWhiteboardAccess
        ? intl.formatMessage(messages.removeWhiteboardAccess)
        : intl.formatMessage(messages.giveWhiteboardAccess),
      onClick: () => {
        handleWhiteboardAccessChange();
        setOpenUserAction(null);
      },
      icon: 'pen_tool',
      dataTest: 'changeWhiteboardAccess',
    },
    {
      allowed: allowedToSetPresenter && !isVoiceOnlyUser(user.userId),
      key: 'setPresenter',
      label: isMe(user.userId)
        ? intl.formatMessage(messages.takePresenterLabel)
        : intl.formatMessage(messages.makePresenterLabel),
      onClick: () => {
        setPresenter({
          variables: {
            userId: user.userId,
          },
        });
        setOpenUserAction(null);
      },
      icon: 'presentation',
      dataTest: isMe(user.userId) ? 'takePresenter' : 'makePresenter',
    },
    {
      allowed: allowedToPromote,
      key: 'promote',
      label: intl.formatMessage(messages.PromoteUserLabel),
      onClick: () => {
        setRole({
          variables: {
            userId: user.userId,
            role: 'MODERATOR',
          },
        });
        setOpenUserAction(null);
      },
      icon: 'promote',
      dataTest: 'promoteToModerator',
    },
    {
      allowed: allowedToDemote,
      key: 'demote',
      label: intl.formatMessage(messages.DemoteUserLabel),
      onClick: () => {
        setRole({
          variables: {
            userId: user.userId,
            role: 'VIEWER',
          },
        });
        setOpenUserAction(null);
      },
      icon: 'user',
      dataTest: 'demoteToViewer',
    },
    {
      allowed: allowedToChangeUserLockStatus,
      key: 'unlockUser',
      label: userLocked ? intl.formatMessage(messages.UnlockUserLabel, { userName: user.name })
        : intl.formatMessage(messages.LockUserLabel, { userName: user.name }),
      onClick: () => {
        setLocked({
          variables: {
            userId: user.userId,
            locked: !userLocked,
          },
        });
        setOpenUserAction(null);
      },
      icon: userLocked ? 'unlock' : 'lock',
      dataTest: 'unlockUserButton',
    },
    {
      allowed: allowedToRemove,
      key: 'remove',
      label: intl.formatMessage(messages.RemoveUserLabel, { 0: user.name }),
      onClick: () => {
        setIsConfirmationModalOpen(true);
        setOpenUserAction(null);
      },
      icon: 'circle_close',
      dataTest: 'removeUser',
    },
    {
      allowed: allowedToEjectCameras
        && user?.cameras?.length > 0
        && !isBreakout,
      key: 'ejectUserCameras',
      label: intl.formatMessage(messages.ejectUserCamerasLabel),
      onClick: () => {
        userEjectCameras({
          variables: {
            userId: user.userId,
          },
        });
        setOpenUserAction(null);
      },
      icon: 'video_off',
      dataTest: 'ejectCamera',
    },
    ...makeDropdownPluginItem(userDropdownItems.filter(
      (item: PluginSdk.UserListDropdownInterface) => (
        item?.type !== UserListDropdownItemType.FIXED_CONTENT_INFORMATION
        && item?.type !== UserListDropdownItemType.GENERIC_CONTENT_INFORMATION
        && !(item?.type === UserListDropdownItemType.SEPARATOR
          && (item as PluginSdk.UserListDropdownSeparator)?.position
          === PluginSdk.UserListDropdownSeparatorPosition.BEFORE)
      ),
    )),
  ];

  const actions = dropdownOptions.filter((key) => key.allowed);
  if (!(actions.length > 1) || user.bot) {
    return (
      <Styled.NoPointerEvents>
        {children}
      </Styled.NoPointerEvents>
    );
  }

  return (
    <div>
      <BBBMenu
        trigger={
          (
            <Styled.UserActionsTrigger
              isActionsOpen={open}
              selected={open}
              tabIndex={-1}
              onClick={() => setOpenUserAction(user.userId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setOpenUserAction(user.userId);
                }
              }}
            >
              {children}
            </Styled.UserActionsTrigger>
          )
        }
        actions={actions}
        onCloseCallback={() => {
          setOpenUserAction(null);
        }}
        open={open}
      />
      {isConfirmationModalOpen ? (
        <ConfirmationModal
          intl={intl}
          title={intl.formatMessage(messages.removeUserConfirmation, { userName: user.name })}
          checkboxMessageId="app.userlist.menu.removeConfirmation.desc"
          confirmParam={user.userId}
          onConfirm={removeUser}
          confirmButtonDataTest="removeUserConfirmation"
          {...{
            onRequestClose: () => setIsConfirmationModalOpen(false),
            priority: 'low',
            setIsOpen: setIsConfirmationModalOpen,
            isOpen: isConfirmationModalOpen,
          }}
        />
      ) : null}
    </div>
  );
};

export default UserActions;
