import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import LockViewersContainer from '/imports/ui/components/lock-viewers/container';
import GuestPolicyContainer from '/imports/ui/components/waiting-users/guest-policy/container';
import CreateBreakoutRoomContainerGraphql from '../../../../breakout-room/create-breakout-room/component';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import { defineMessages, useIntl } from 'react-intl';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { uid } from 'radash';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  onSaveUserNames, openLearningDashboardUrl,
} from './service';
import { User } from '/imports/ui/Types/user';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  useIsBreakoutRoomsEnabled,
  useIsLearningDashboardEnabled,
  useIsReactionsEnabled,
} from '/imports/ui/services/features';
import { useMutation, useLazyQuery } from '@apollo/client';
import { SET_MUTED } from './mutations';
import { CLEAR_ALL_REACTION } from '/imports/ui/core/graphql/mutations/userMutations';
import { GET_USER_NAMES } from '/imports/ui/core/graphql/queries/users';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.userList.userOptions.manageUsersLabel',
    description: 'Manage user label',
  },
  clearAllDesc: {
    id: 'app.userList.userOptions.clearAllDesc',
    description: 'Clear all description',
  },
  usersJoinMutedEnableLabel: {
    id: 'app.userList.userOptions.usersJoinMutedEnableLabel',
    description: 'Mute all label',
  },
  usersJoinMutedEnableDesc: {
    id: 'app.userList.userOptions.usersJoinMutedEnableDesc',
    description: 'Enable Join muted button',
  },
  usersJoinMutedDisableLabel: {
    id: 'app.userList.userOptions.usersJoinMutedDisableLabel',
    description: 'Disable Join muted button',
  },
  usersJoinMutedDisableDesc: {
    id: 'app.userList.userOptions.usersJoinMutedDisableDesc',
    description: 'Unmute all desc',
  },
  lockViewersLabel: {
    id: 'app.userList.userOptions.lockViewersLabel',
    description: 'Lock viewers label',
  },
  lockViewersDesc: {
    id: 'app.userList.userOptions.lockViewersDesc',
    description: 'Lock viewers description',
  },
  guestPolicyLabel: {
    id: 'app.userList.userOptions.guestPolicyLabel',
    description: 'Guest policy label',
  },
  guestPolicyDesc: {
    id: 'app.userList.userOptions.guestPolicyDesc',
    description: 'Guest policy description',
  },
  muteAllExceptPresenterLabel: {
    id: 'app.userList.userOptions.muteAllExceptPresenterLabel',
    description: 'Mute all except presenter label',
  },
  muteAllExceptPresenterDesc: {
    id: 'app.userList.userOptions.muteAllExceptPresenterDesc',
    description: 'Mute all except presenter description',
  },
  createBreakoutRoom: {
    id: 'app.actionsBar.actionsDropdown.createBreakoutRoom',
    description: 'Create breakout room option',
  },
  createBreakoutRoomDesc: {
    id: 'app.actionsBar.actionsDropdown.createBreakoutRoomDesc',
    description: 'Description of create breakout room option',
  },
  learningDashboardLabel: {
    id: 'app.learning-dashboard.label',
    description: 'Activity Report label',
  },
  learningDashboardDesc: {
    id: 'app.learning-dashboard.description',
    description: 'Activity Report description',
  },
  saveUserNames: {
    id: 'app.actionsBar.actionsDropdown.saveUserNames',
    description: 'Save user name feature description',
  },
  newTab: {
    id: 'app.modal.newTab',
    description: 'label used in aria description',
  },
  invitationLabel: {
    id: 'app.actionsBar.actionsDropdown.breakoutRoomInvitationLabel',
    description: 'Invitation item',
  },
  invitationDesc: {
    id: 'app.actionsBar.actionsDropdown.breakoutRoomInvitationDesc',
    description: 'Invitation item description',
  },
  clearAllReactionsLabel: {
    id: 'app.userList.userOptions.clearAllReactionsLabel',
    description: 'Clear all reactions label',
  },
  clearAllReactionsDesc: {
    id: 'app.userList.userOptions.clearAllReactionsDesc',
    description: 'Clear all reactions description',
  },
  clearReactionsMessage: {
    id: 'app.userList.userOptions.clearedReactions',
    description: 'Used in toast notification when reactions have been cleared',
  },
});

interface RenderModalProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  priority: string;
  /* Use 'any' if you don't have specific props;
   As this props varies in types usage of any is most appropriate */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<any>;
  otherOptions: object;
}

const renderModal: React.FC<RenderModalProps> = ({
  isOpen, setIsOpen, priority, Component, otherOptions,
}) => {
  if (isOpen) {
    return (
      <Component
        onRequestClose={() => setIsOpen(false)}
        priority={priority}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...otherOptions}
      />
    );
  }
  return null;
};
interface UserTitleOptionsProps {
  isRTL: boolean;
  isMeetingMuted: boolean | undefined;
  isBreakout: boolean | undefined;
  isModerator: boolean;
  hasBreakoutRooms: boolean | undefined;
  meetingName: string | undefined;
  learningDashboardToken: string | undefined;
}

const UserTitleOptions: React.FC<UserTitleOptionsProps> = ({
  isRTL,
  isMeetingMuted,
  isBreakout,
  isModerator,
  hasBreakoutRooms,
  meetingName,
  learningDashboardToken,
}) => {
  const intl = useIntl();
  const { locale } = intl;
  const uuids = useRef<string[]>([
    uid(8, 'options-'),
    uid(8, 'options-'),
    uid(8, 'options-'),
    uid(8, 'options-'),
    uid(8, 'options-'),
    uid(8, 'options-'),
    uid(8, 'options-'),
    uid(8, 'options-'),
    uid(8, 'options-'),
  ]);
  const [isCreateBreakoutRoomModalOpen, setIsCreateBreakoutRoomModalOpen] = useState(false);
  const [isGuestPolicyModalOpen, setIsGuestPolicyModalOpen] = useState(false);
  const [isLockViewersModalOpen, setIsLockViewersModalOpen] = useState(false);

  const [setMuted] = useMutation(SET_MUTED);
  const [clearAllReaction] = useMutation(CLEAR_ALL_REACTION);
  const [getUsers, { data: usersData, error: usersError }] = useLazyQuery(GET_USER_NAMES, { fetchPolicy: 'no-cache' });
  const users = usersData?.user || [];
  const isLearningDashboardEnabled = useIsLearningDashboardEnabled();
  const isBreakoutRoomsEnabled = useIsBreakoutRoomsEnabled();
  const isReactionsEnabled = useIsReactionsEnabled();
  const canInviteUsers = isModerator
  && !isBreakout
  && hasBreakoutRooms;
  const isInvitation = hasBreakoutRooms && isModerator;

  if (usersError) {
    logger.error({
      logCode: 'user_options_get_users_error',
      extraInfo: { usersError },
    }, 'Error fetching users names');
  }

  // users will only be fetched when getUsers is called
  useEffect(() => {
    if (users.length > 0) {
      onSaveUserNames(intl, meetingName ?? '', users);
    }
  }, [users]);

  const callSetMuted = (muted: boolean, exceptPresenter: boolean) => {
    setMuted({
      variables: {
        muted,
        exceptPresenter,
      },
    });

    if (!muted) {
      return logger.info(
        {
          logCode: 'useroptions_unmute_all',
          extraInfo: { logType: 'moderator_action' },
        },
        'moderator disabled meeting mute',
      );
    }

    const logCode = exceptPresenter ? 'useroptions_mute_all_except_presenter' : 'useroptions_mute_all';
    const logMessage = exceptPresenter ? 'moderator enabled meeting mute, all users muted except presenter' : 'moderator enabled meeting mute, all users muted';
    return logger.info(
      {
        logCode,
        extraInfo: { logType: 'moderator_action' },
      },
      logMessage,
    );
  };

  const clearReactions = () => {
    clearAllReaction();
    notify(intl.formatMessage(intlMessages.clearReactionsMessage), 'info', 'clear_status');
  };

  const { dynamicGuestPolicy } = window.meetingClientSettings.public.app;

  const actions = useMemo(() => {
    const canCreateBreakout = isModerator
      && !isBreakout
      && !hasBreakoutRooms
      && isBreakoutRoomsEnabled;
    return [
      {
        allow: !isBreakout,
        key: uuids.current[0],
        label: intl.formatMessage(intlMessages[isMeetingMuted ? 'usersJoinMutedDisableLabel' : 'usersJoinMutedEnableLabel']),
        description: intl.formatMessage(intlMessages[isMeetingMuted ? 'usersJoinMutedDisableDesc' : 'usersJoinMutedEnableDesc']),
        onClick: callSetMuted.bind(null, !isMeetingMuted, false),
        icon: isMeetingMuted ? 'unmute' : 'mute',
        dataTest: 'usersJoinMuted',
      },
      {
        allow: true,
        key: uuids.current[1],
        label: intl.formatMessage(intlMessages.muteAllExceptPresenterLabel),
        description: intl.formatMessage(intlMessages.muteAllExceptPresenterDesc),
        onClick: callSetMuted.bind(null, true, true),
        icon: 'mute',
        dataTest: 'muteAllExceptPresenter',
      },
      {
        allow: true,
        key: uuids.current[2],
        label: intl.formatMessage(intlMessages.lockViewersLabel),
        description: intl.formatMessage(intlMessages.lockViewersDesc),
        onClick: () => setIsLockViewersModalOpen(true),
        icon: 'lock',
        dataTest: 'lockViewersButton',
      },
      {
        allow: dynamicGuestPolicy,
        key: uuids.current[3],
        icon: 'user',
        label: intl.formatMessage(intlMessages.guestPolicyLabel),
        description: intl.formatMessage(intlMessages.guestPolicyDesc),
        onClick: () => setIsGuestPolicyModalOpen(true),
        dataTest: 'guestPolicyLabel',
      },
      {
        allow: isModerator,
        key: uuids.current[4],
        label: intl.formatMessage(intlMessages.saveUserNames),
        onClick: () => getUsers(),
        icon: 'download',
        dataTest: 'downloadUserNamesList',
      },
      {
        allow: isReactionsEnabled && isModerator,
        key: uuids.current[5],
        label: intl.formatMessage(intlMessages.clearAllReactionsLabel),
        description: intl.formatMessage(intlMessages.clearAllReactionsDesc),
        onClick: () => clearReactions(),
        icon: 'clear_status',
        dataTest: 'clearStatus',
      },
      {
        key: 'separator-01',
        isSeparator: true,
        allow: true,
      },
      {
        allow: canCreateBreakout,
        key: uuids.current[6],
        icon: 'rooms',
        label: intl.formatMessage(intlMessages.createBreakoutRoom),
        description: intl.formatMessage(intlMessages.createBreakoutRoomDesc),
        onClick: () => setIsCreateBreakoutRoomModalOpen(true),
        dataTest: 'createBreakoutRooms',
      },
      {
        allow: canInviteUsers,
        key: uuids.current[7],
        icon: 'rooms',
        label: intl.formatMessage(intlMessages.invitationLabel),
        description: intl.formatMessage(intlMessages.invitationDesc),
        onClick: () => setIsCreateBreakoutRoomModalOpen(true),
        dataTest: 'inviteUsers',
      },
      {
        key: 'separator-02',
        isSeparator: true,
        allow: canCreateBreakout,
      },
      {
        allow: isLearningDashboardEnabled,
        icon: 'multi_whiteboard',
        iconRight: 'popout_window',
        label: intl.formatMessage(intlMessages.learningDashboardLabel),
        description: `${intl.formatMessage(intlMessages.learningDashboardDesc)}
        ${intl.formatMessage(intlMessages.newTab)}`,
        key: uuids.current[8],
        onClick: () => { openLearningDashboardUrl(locale, learningDashboardToken); },
        dividerTop: true,
        dataTest: 'learningDashboard',
      },
    ].filter(({ allow }) => allow);
  }, [isModerator, hasBreakoutRooms, isMeetingMuted, locale, intl, isBreakoutRoomsEnabled, isLearningDashboardEnabled]);

  const newLocal = 'true';
  return (
    <>
      <BBBMenu
        trigger={(
          <Styled.OptionsButton
            label={intl.formatMessage(intlMessages.optionsLabel)}
            data-test="manageUsers"
            icon="settings"
            color="light"
            hideLabel
            size="md"
            circle
            onClick={() => null}
          />
        )}
        actions={actions}
        opts={{
          id: 'user-options-dropdown-menu',
          keepMounted: true,
          transitionDuration: 0,
          elevation: 3,
          getcontentanchorel: null,
          fullwidth: newLocal,
          anchorOrigin: { vertical: 'bottom', horizontal: isRTL ? 'right' : 'left' },
          transformOrigin: { vertical: 'top', horizontal: isRTL ? 'right' : 'left' },
        }}
      />
      {renderModal({
        isOpen: isCreateBreakoutRoomModalOpen,
        setIsOpen: setIsCreateBreakoutRoomModalOpen,
        priority: 'medium',
        Component: CreateBreakoutRoomContainerGraphql,
        otherOptions: {
          isUpdate: isInvitation,
        },
      })}

      {renderModal({
        isOpen: isGuestPolicyModalOpen,
        setIsOpen: setIsGuestPolicyModalOpen,
        priority: 'low',
        Component: GuestPolicyContainer,
        otherOptions: {},
      })}

      {renderModal({
        isOpen: isLockViewersModalOpen,
        setIsOpen: setIsLockViewersModalOpen,
        priority: 'low',
        Component: LockViewersContainer,
        otherOptions: {},
      })}

    </>
  );
};

const UserTitleOptionsContainer: React.FC = () => {
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const { data: meetingInfo } = useMeeting((meeting) => ({
    voiceSettings: meeting?.voiceSettings,
    isBreakout: meeting?.isBreakout,
    componentsFlags: meeting?.componentsFlags,
    name: meeting?.name,
    learningDashboardAccessToken: meeting.learningDashboardAccessToken,
  }));

  const { data: currentUser } = useCurrentUser((user: Partial<User>) => ({
    userId: user?.userId,
    isModerator: user?.isModerator,
  }));
  // in case of current user isn't load yet
  if (!currentUser?.isModerator ?? true) return null;

  const hasBreakoutRooms = meetingInfo?.componentsFlags?.hasBreakoutRoom ?? false;

  return (
    <UserTitleOptions
      isRTL={isRTL}
      isMeetingMuted={meetingInfo?.voiceSettings?.muteOnStart}
      isBreakout={meetingInfo?.isBreakout}
      isModerator={currentUser?.isModerator ?? false}
      hasBreakoutRooms={hasBreakoutRooms}
      meetingName={meetingInfo?.name}
      learningDashboardToken={meetingInfo?.learningDashboardAccessToken}
    />
  );
};

export default UserTitleOptionsContainer;
