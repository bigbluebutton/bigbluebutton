import React, { useState } from 'react';
import { User } from '/imports/ui/Types/user';
import {LockSettings, UsersPolicies} from '/imports/ui/Types/meeting';
import { generateActionsPermissions, isVoiceOnlyUser } from './service';
import { useIntl, defineMessages } from 'react-intl';
import {
  isVideoPinEnabledForCurrentUser,
  getGroupChatPrivate,
  setEmojiStatus,
  toggleVoice,
  changeWhiteboardAccess,
  isMe,
  removeUser,
} from './service';

import { makeCall } from '/imports/ui/services/api';
import { isChatEnabled } from '/imports/ui/services/features';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';
import { EMOJI_STATUSES } from '/imports/utils/statuses';

import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';

import BBBMenu from '/imports/ui/components/common/menu/component';

interface UserActionsProps {
  user: User;
  currentUser: User;
  lockSettings: LockSettings;
  usersPolicies: UsersPolicies;
  isBreakout: boolean;
  children: React.ReactNode;
};

const messages = defineMessages({
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'label for option to show emoji menu',
  },
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
  ClearStatusLabel: {
    id: 'app.userList.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
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
  backTriggerLabel: {
    id: 'app.audio.backLabel',
    description: 'label for option to hide emoji menu',
  },
});

const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUser,
  lockSettings,
  usersPolicies,
  isBreakout,
  children,
}) => {
  const intl = useIntl();
  const [showNestedOptions, setShowNestedOptions] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const layoutContextDispatch = layoutDispatch();
  const actionsnPermitions = generateActionsPermissions(
    user,
    currentUser,
    lockSettings,
    usersPolicies,
    isBreakout
  );

  const {
    allowedToChangeStatus,
    allowedToChatPrivately,
    allowedToResetStatus,
    allowedToMuteAudio,
    allowedToUnmuteAudio,
    allowedToChangeWhiteboardAccess,
    allowedToSetPresenter,
    allowedToPromote,
    allowedToDemote,
    allowedToChangeUserLockStatus,
    allowUserLookup,
    allowedToRemove,
    allowedToEjectCameras,
  } = actionsnPermitions

  const {
    disablePrivateChat,
  } = lockSettings;
  
  const userLocked = user.locked
    && lockSettings.hasActiveLockSetting
    && user.isModerator;

  const dropdownOptions = [
    {
      allowed: allowedToChangeStatus,
      key: 'setstatus',
      label: intl.formatMessage(messages.statusTriggerLabel),
      onClick: () => setShowNestedOptions(true),
      icon: 'user',
      iconRight: 'right_arrow',
      dataTest: 'setStatus',
    },
    {
      allowed: user.cameras.length > 0
        && isVideoPinEnabledForCurrentUser(currentUser, isBreakout),
      key: 'pinVideo',
      label: user.pinned
        ? intl.formatMessage(messages.UnpinUserWebcam)
        : intl.formatMessage(messages.PinUserWebcam),
      onClick: () => {
        // toggle user pinned status
        makeCall('changePin', user.userId, !user.pinned);
      },
      icon: user.pinned ? 'pin-video_off' : 'pin-video_on',
    },
    {
      allowed: isChatEnabled()
        && (
          currentUser.isModerator ? allowedToChatPrivately
          : allowedToChatPrivately && (
            !(currentUser.locked && disablePrivateChat)
            // TODO: Add check for hasPrivateChat between users
            || user.isModerator
          )
        )
        && !isVoiceOnlyUser(user.userId)
        && !isBreakout,
      key: 'activeChat',
      label: intl.formatMessage(messages.StartPrivateChat),
      onClick: () => {
        setSelected(false);
        getGroupChatPrivate(currentUser.userId, user);
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
          value: user.userId,
        });
      },
      icon: 'chat',
      dataTest: 'startPrivateChat',
    },
    {
      allowed: allowedToResetStatus
        && user.emoji !== 'none',
      key: 'clearStatus',
      label: intl.formatMessage(messages.ClearStatusLabel),
      onClick: () => {
        setEmojiStatus(user.userId, 'none');
        setSelected(false);
      },
      icon: 'clear_status',
    },
    {
      allowed: allowedToMuteAudio
        && !isBreakout,
      key: 'mute',
      label: intl.formatMessage(messages.MuteUserAudioLabel),
      onClick: () => {
        toggleVoice(user.userId);
        setSelected(false);
      },
      icon: 'mute',
    },
    {
      allowed: allowedToUnmuteAudio
        && !lockSettings.disableMic
        && !isBreakout,
      key: 'unmute',
      label: intl.formatMessage(messages.UnmuteUserAudioLabel),
      onClick: () => {
        toggleVoice(user.userId);
        setSelected(false);
      },
      icon: 'unmute',
    },
    {
      allowed: allowedToChangeWhiteboardAccess
        && !user.presenter
        && !isVoiceOnlyUser(user.userId),
      key: 'changeWhiteboardAccess',
      label: user.whiteboardAccess
        ? intl.formatMessage(messages.removeWhiteboardAccess)
        : intl.formatMessage(messages.giveWhiteboardAccess),
      onClick: () => {
        changeWhiteboardAccess(user.userId, user.presPagesWritable.length > 0)
        setSelected(false);
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
        makeCall('assignPresenter', user.userId);
        setSelected(false);
      },
      icon: 'presentation',
      dataTest: isMe(user.userId) ? 'takePresenter' : 'makePresenter',
    },
    {
      allowed: allowedToPromote,
      key: 'promote',
      label: intl.formatMessage(messages.PromoteUserLabel),
      onClick: () => {
        makeCall('changeRole', user.userId, 'MODERATOR');
        setSelected(false);
      },
      icon: 'promote',
      dataTest: 'promoteToModerator',
    },
    {
      allowed: allowedToDemote,
      key: 'demote',
      label: intl.formatMessage(messages.DemoteUserLabel),
      onClick: () => {
        makeCall('changeRole', user.userId, 'VIEWER');
        setSelected(false);
      },
      icon: 'user',
      dataTest: 'demoteToViewer',
    },
    {
      allowed: allowedToChangeUserLockStatus,
      key: 'unlockUser',
      label: userLocked ? intl.formatMessage(messages.UnlockUserLabel, { 0: user.name })
        : intl.formatMessage(messages.LockUserLabel, { 0: user.name }),
      onClick: () => {
        makeCall('toggleUserLock', user.userId, !userLocked);
        setSelected(false);
      },
      icon: userLocked ? 'unlock' : 'lock',
      dataTest: 'unlockUserButton',
    },
    {
      allowed: allowUserLookup,
      key: 'directoryLookup',
      label: intl.formatMessage(messages.DirectoryLookupLabel),
      onClick: () => {
        makeCall('requestUserInformation', user.extId);
        setSelected(false);
      },
      icon: 'user',
    },
    {
      allowed: allowedToRemove,
      key: 'remove',
      label: intl.formatMessage(messages.RemoveUserLabel, { 0: user.name }),
      onClick: () => {
        setIsConfirmationModalOpen(true)
        setSelected(false);
      },
      icon: 'circle_close',
      dataTest: 'removeUser'
    },
    {
      allowed: allowedToEjectCameras
        && user.cameras.length > 0
        && !isBreakout,
      key: 'ejectUserCameras',
      label: intl.formatMessage(messages.ejectUserCamerasLabel),
      onClick: () => {
        makeCall('ejectUserCameras', user.userId);
        setSelected(false);
      },
      icon: 'video_off',
    },
  ];

  const nestedOptions = [
    {
      allowed: allowedToChangeStatus,
      key: 'back',
      label: intl.formatMessage(messages.backTriggerLabel),
      onClick: () => setShowNestedOptions(false),
      icon: 'left_arrow',
      divider: true,
    },
    ...Object.keys(EMOJI_STATUSES).map((key) => ({
      allowed: showNestedOptions,
      key: key,
      label: intl.formatMessage({ id: `app.actionsBar.emojiMenu.${key}Label` }),
      onClick: () => {
        setEmojiStatus(user.userId, key);
        setSelected(false);
        setShowNestedOptions(false);
      },
      icon: EMOJI_STATUSES[key],
      dataTest: key,
    })),
  ];

  const actions = showNestedOptions 
    ? nestedOptions.filter(key => key.allowed)
    : dropdownOptions.filter(key => key.allowed);
  if (!actions.length) return children;
  return <div>
  <BBBMenu
  trigger={
    (
      <div
        isActionsOpen={selected}
        selected={selected === true}
        tabIndex={-1}
        onClick={() => setSelected(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setSelected(true);
          }
        }}
        role="button"
      >
        {children}
      </div>
    )
  }
  actions={actions}
  selectedEmoji={user.emoji}
  onCloseCallback={() =>{
    setSelected(false);
    setShowNestedOptions(false);
  }}
  open={selected}
/>
{isConfirmationModalOpen ? <ConfirmationModal
  intl={intl}
  titleMessageId="app.userList.menu.removeConfirmation.label"
  titleMessageExtra={user.name}
  checkboxMessageId="app.userlist.menu.removeConfirmation.desc"
  confirmParam={user.userId}
  onConfirm={removeUser}
  confirmButtonDataTest="removeUserConfirmation"
  {...{
    onRequestClose: () => setIsConfirmationModalOpen(false),
    priority: "low",
    setIsOpen: setIsConfirmationModalOpen,
    isOpen: isConfirmationModalOpen
  }}
/> : null}
  </div>;
};

export default UserActions;
