import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import LockViewersContainer from '/imports/ui/components/lock-viewers/container';
import GuestPolicyContainer from '/imports/ui/components/waiting-users/guest-policy/container';
import CreateBreakoutRoomContainerGraphql from '../../../../breakout-room/breakout-room-graphql/create-breakout-room/component';
import BBBMenu from '/imports/ui/components/common/menu/component';
import Styled from './styles';
import { defineMessages, useIntl } from 'react-intl';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { uid } from 'radash';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';
import {
  onSaveUserNames, openLearningDashboardUrl,
} from './service';
import { User } from '/imports/ui/Types/user';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { isBreakoutRoomsEnabled, isLearningDashboardEnabled } from '/imports/ui/services/features';
import { useMutation, useLazyQuery } from '@apollo/client';
import { CLEAR_ALL_EMOJI } from '/imports/ui/core/graphql/mutations/userMutations';
import { SET_MUTED } from './mutations';
import { GET_USER_NAMES } from '/imports/ui/core/graphql/queries/users';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';

const intlMessages = defineMessages({
  optionsLabel: {
    id: 'app.userList.userOptions.manageUsersLabel',
    description: 'Manage user label',
  },
  clearAllLabel: {
    id: 'app.userList.userOptions.clearAllLabel',
    description: 'Clear all label',
  },
  clearAllDesc: {
    id: 'app.userList.userOptions.clearAllDesc',
    description: 'Clear all description',
  },
  muteAllLabel: {
    id: 'app.userList.userOptions.muteAllLabel',
    description: 'Mute all label',
  },
  muteAllDesc: {
    id: 'app.userList.userOptions.muteAllDesc',
    description: 'Mute all description',
  },
  unmuteAllLabel: {
    id: 'app.userList.userOptions.unmuteAllLabel',
    description: 'Unmute all label',
  },
  unmuteAllDesc: {
    id: 'app.userList.userOptions.unmuteAllDesc',
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
  clearStatusMessage: {
    id: 'app.userList.content.participants.options.clearedStatus',
    description: 'Used in toast notification when emojis have been cleared',
  },
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - temporary, while meteor exists in the project
const { dynamicGuestPolicy } = window.meetingClientSettings.public.app;

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
}

const UserTitleOptions: React.FC<UserTitleOptionsProps> = ({
  isRTL,
  isMeetingMuted = false,
  isBreakout,
  isModerator,
  hasBreakoutRooms,
  meetingName,
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
  const [isCreateBreakoutRoomModalOpen, setCreateBreakoutRoomModalIsOpen] = useState(false);
  const [isGuestPolicyModalOpen, setGuestPolicyModalIsOpen] = useState(false);
  const [isLockViewersModalOpen, setLockViewersModalIsOpen] = useState(false);

  const [clearAllEmoji] = useMutation(CLEAR_ALL_EMOJI);
  const [setMuted] = useMutation(SET_MUTED);
  const [getUsers, { data: usersData, error: usersError }] = useLazyQuery(GET_USER_NAMES, { fetchPolicy: 'no-cache' });
  const users = usersData?.user || [];

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

  const toggleStatus = () => {
    clearAllEmoji();
    notify(intl.formatMessage(intlMessages.clearStatusMessage), 'info', 'clear_status');
  };

  const toggleMute = (muted: boolean, exceptPresenter: boolean) => {
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

  const actions = useMemo(() => {
    const canCreateBreakout = isModerator
      && !isBreakout
      && !hasBreakoutRooms
      && isBreakoutRoomsEnabled();
    return [
      {
        allow: !isBreakout,
        key: uuids.current[0],
        label: intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllLabel' : 'muteAllLabel']),
        description: intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllDesc' : 'muteAllDesc']),
        onClick: toggleMute.bind(null, !isMeetingMuted, false),
        icon: isMeetingMuted ? 'unmute' : 'mute',
        dataTest: 'muteAll',
      },
      {
        allow: !isMeetingMuted,
        key: uuids.current[1],
        label: intl.formatMessage(intlMessages.muteAllExceptPresenterLabel),
        description: intl.formatMessage(intlMessages.muteAllExceptPresenterDesc),
        onClick: toggleMute.bind(null, isMeetingMuted, true),
        icon: 'mute',
        dataTest: 'muteAllExceptPresenter',
      },
      {
        allow: true,
        key: uuids.current[2],
        label: intl.formatMessage(intlMessages.lockViewersLabel),
        description: intl.formatMessage(intlMessages.lockViewersDesc),
        onClick: () => setLockViewersModalIsOpen(true),
        icon: 'lock',
        dataTest: 'lockViewersButton',
      },
      {
        allow: dynamicGuestPolicy,
        key: uuids.current[3],
        icon: 'user',
        label: intl.formatMessage(intlMessages.guestPolicyLabel),
        description: intl.formatMessage(intlMessages.guestPolicyDesc),
        onClick: () => setGuestPolicyModalIsOpen(true),
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
        allow: true,
        key: uuids.current[5],
        label: intl.formatMessage(intlMessages.clearAllLabel),
        description: intl.formatMessage(intlMessages.clearAllDesc),
        onClick: () => toggleStatus(),
        icon: 'clear_status',
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
        onClick: () => setCreateBreakoutRoomModalIsOpen(true),
        dataTest: 'createBreakoutRooms',
      },
      {
        key: 'separator-02',
        isSeparator: true,
        allow: true,
      },
      {
        allow: isLearningDashboardEnabled(),
        icon: 'multi_whiteboard',
        iconRight: 'popout_window',
        label: intl.formatMessage(intlMessages.learningDashboardLabel),
        description: `${intl.formatMessage(intlMessages.learningDashboardDesc)}
        ${intl.formatMessage(intlMessages.newTab)}`,
        key: uuids.current[8],
        onClick: () => { openLearningDashboardUrl(locale); },
        dividerTop: true,
        dataTest: 'learningDashboard',
      },
    ].filter(({ allow }) => allow);
  }, [isModerator, hasBreakoutRooms, isMeetingMuted, locale]);

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
        setIsOpen: setCreateBreakoutRoomModalIsOpen,
        priority: 'medium',
        Component: CreateBreakoutRoomContainerGraphql,
        otherOptions: {},
      })}

      {renderModal({
        isOpen: isGuestPolicyModalOpen,
        setIsOpen: setGuestPolicyModalIsOpen,
        priority: 'low',
        Component: GuestPolicyContainer,
        otherOptions: {},
      })}

      {renderModal({
        isOpen: isLockViewersModalOpen,
        setIsOpen: setLockViewersModalIsOpen,
        priority: 'low',
        Component: LockViewersContainer,
        otherOptions: {},
      })}

    </>
  );
};

const UserTitleOptionsContainer: React.FC = () => {
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const { data: meetingInfo } = useMeeting((meeting: Partial<Meeting>) => ({
    voiceSettings: meeting?.voiceSettings,
    isBreakout: meeting?.isBreakout,
    breakoutPolicies: meeting?.breakoutPolicies,
    name: meeting?.name,
  }));

  const { data: currentUser } = useCurrentUser((user: Partial<User>) => ({
    userId: user?.userId,
    isModerator: user?.isModerator,
  }));
  // in case of current user isn't load yet
  if (!currentUser?.isModerator ?? true) return null;

  return (
    <UserTitleOptions
      isRTL={isRTL}
      isMeetingMuted={meetingInfo?.voiceSettings?.muteOnStart}
      isBreakout={meetingInfo?.isBreakout}
      isModerator={currentUser?.isModerator ?? false}
      hasBreakoutRooms={meetingInfo?.breakoutPolicies?.breakoutRooms !== undefined
        && meetingInfo.breakoutPolicies.breakoutRooms.length > 0}
      meetingName={meetingInfo?.name}
    />
  );
};

export default UserTitleOptionsContainer;
