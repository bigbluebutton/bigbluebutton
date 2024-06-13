import React from 'react';
import { useMutation } from '@apollo/client';
import ManyUsersComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_WEBCAM_ONLY_FOR_MODERATOR } from '/imports/ui/components/lock-viewers/mutations';
import { useViewersInWebcamCount } from '../hooks';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const ManyUsersContainer: React.FC = () => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const { data: meetingData } = useMeeting((m) => ({
    usersPolicies: m.usersPolicies,
    lockSettings: m.lockSettings,
  }));

  const [setWebcamOnlyForModerator] = useMutation(SET_WEBCAM_ONLY_FOR_MODERATOR);

  const toggleWebcamsOnlyForModerator = () => {
    setWebcamOnlyForModerator({
      variables: {
        webcamsOnlyForModerator: true,
      },
    });
  };

  const viewersInWebcam = useViewersInWebcamCount();

  const currentUserIsModerator = !!currentUserData?.isModerator;

  const webcamOnlyForModerator = !!meetingData?.usersPolicies?.webcamsOnlyForModerator;
  const lockSettingsDisableCam = !!meetingData?.lockSettings?.disableCam;

  return (
    <ManyUsersComponent
      toggleWebcamsOnlyForModerator={toggleWebcamsOnlyForModerator}
      currentUserIsModerator={currentUserIsModerator}
      viewersInWebcam={viewersInWebcam}
      limitOfViewersInWebcam={window.meetingClientSettings.public.app.viewersInWebcam}
      limitOfViewersInWebcamIsEnable={window.meetingClientSettings.public.app.enableLimitOfViewersInWebcam}
      lockSettingsDisableCam={lockSettingsDisableCam}
      webcamOnlyForModerator={webcamOnlyForModerator}
    />
  );
};

export default ManyUsersContainer;
