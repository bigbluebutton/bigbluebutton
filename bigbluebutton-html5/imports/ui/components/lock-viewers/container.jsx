import React from 'react';
import { useMutation } from '@apollo/client';
import LockViewersComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_LOCK_SETTINGS_PROPS, SET_WEBCAM_ONLY_FOR_MODERATOR } from './mutations';
import useMeeting from '../../core/hooks/useMeeting';
import { useIsChatEnabled, useIsPrivateChatEnabled, useIsSharedNotesEnabled } from '../../services/features';

const LockViewersContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  const [setLockSettingsProps] = useMutation(SET_LOCK_SETTINGS_PROPS);
  const [setWebcamOnlyForModerator] = useMutation(SET_WEBCAM_ONLY_FOR_MODERATOR);

  const updateLockSettings = (lockSettings) => {
    setLockSettingsProps({
      variables: {
        disableCam: lockSettings.disableCam,
        disableMic: lockSettings.disableMic,
        disablePrivChat: lockSettings.disablePrivateChat,
        disablePubChat: lockSettings.disablePublicChat,
        disableNotes: lockSettings.disableNotes,
        hideUserList: lockSettings.hideUserList,
        lockOnJoin: lockSettings.lockOnJoin,
        lockOnJoinConfigurable: lockSettings.lockOnJoinConfigurable,
        hideViewersCursor: lockSettings.hideViewersCursor,
        hideViewersAnnotation: lockSettings.hideViewersAnnotation,
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

  const { setIsOpen } = props;
  const closeModal = () => setIsOpen(false);
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
    usersPolicies: m.usersPolicies,
  }));
  const isChatEnabled = useIsChatEnabled();
  const isPrivateChatEnabled = useIsPrivateChatEnabled();
  const isSharedNotesEnabled = useIsSharedNotesEnabled();

  return amIModerator && meeting && (
    <LockViewersComponent
      updateWebcamsOnlyForModerator={updateWebcamsOnlyForModerator}
      updateLockSettings={updateLockSettings}
      closeModal={closeModal}
      showToggleLabel={false}
      meeting={meeting}
      isChatEnabled={isChatEnabled}
      isPrivateChatEnabled={isPrivateChatEnabled}
      isSharedNotesEnabled={isSharedNotesEnabled}
      {...props}
    />
  );
};

export default LockViewersContainer;
