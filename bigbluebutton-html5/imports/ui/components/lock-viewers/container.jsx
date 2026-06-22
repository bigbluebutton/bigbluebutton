import React from 'react';
import { useMutation } from '@apollo/client';
import LockViewersComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_LOCK_SETTINGS_PROPS, SET_WEBCAM_ONLY_FOR_MODERATOR } from './mutations';
import { SET_POLICY, SET_LOBBY_MESSAGE } from '../user-list/guest-management/waiting-users/mutations';
import useMeeting from '../../core/hooks/useMeeting';
import { useIsChatEnabled, useIsPrivateChatEnabled, useIsSharedNotesEnabled } from '../../services/features';

const LockViewersContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  const [setLockSettingsProps] = useMutation(SET_LOCK_SETTINGS_PROPS);
  const [setWebcamOnlyForModerator] = useMutation(SET_WEBCAM_ONLY_FOR_MODERATOR);
  const [setPolicy] = useMutation(SET_POLICY);
  const [setLobbyMessageMutation] = useMutation(SET_LOBBY_MESSAGE);

  const updateLockSettings = (lockSettings) => {
    setLockSettingsProps({
      variables: {
        disableCam: lockSettings.disableCam,
        disableMic: lockSettings.disableMic,
        disablePrivChat: lockSettings.disablePrivateChat,
        disablePubChat: lockSettings.disablePublicChat,
        disableNotes: lockSettings.disableNotes,
        isolateUsers: lockSettings.isolateUsers,
        lockOnJoin: lockSettings.lockOnJoin,
        lockOnJoinConfigurable: lockSettings.lockOnJoinConfigurable,
        hideViewersCursor: lockSettings.hideViewersCursor,
        hideViewersAnnotation: lockSettings.hideViewersAnnotation,
        presenterPolicy: lockSettings.presenterPolicy,
      },
    });
  };

  const updateWebcamsOnlyForModerator = (webcamsOnlyForModerator) => {
    setWebcamOnlyForModerator({
      variables: {
        webcamsOnlyForModerator,
      },
    });
  };

  const changeGuestPolicy = (guestPolicy) => {
    setPolicy({
      variables: {
        guestPolicy,
      },
    });
  };

  const setLobbyMessage = (message) => {
    setLobbyMessageMutation({
      variables: {
        message,
      },
    });
  };

  const { setIsOpen } = props;
  const closeModal = () => setIsOpen(false);
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
    usersPolicies: m.usersPolicies,
  }));
  const isChatEnabled = useIsChatEnabled();
  const isPrivateChatEnabled = useIsPrivateChatEnabled();
  const isSharedNotesEnabled = useIsSharedNotesEnabled();

  const guestLobbyMessage = meeting?.usersPolicies?.guestLobbyMessage || '';

  return amIModerator && meeting && (
    <LockViewersComponent
      updateWebcamsOnlyForModerator={updateWebcamsOnlyForModerator}
      updateLockSettings={updateLockSettings}
      changeGuestPolicy={changeGuestPolicy}
      setLobbyMessage={setLobbyMessage}
      guestLobbyMessage={guestLobbyMessage}
      closeModal={closeModal}
      meeting={meeting}
      isChatEnabled={isChatEnabled}
      isPrivateChatEnabled={isPrivateChatEnabled}
      isSharedNotesEnabled={isSharedNotesEnabled}
      {...props}
    />
  );
};

export default LockViewersContainer;
