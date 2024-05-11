import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { useMutation } from '@apollo/client';
import ManyUsersComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_WEBCAM_ONLY_FOR_MODERATOR } from '/imports/ui/components/lock-viewers/mutations';
import { useViewersInWebcamCount } from '../hooks';
import { LockSettings } from '/imports/ui/Types/meeting';

interface ManyUsersContainerProps {
  lockSettings: LockSettings,
  webcamOnlyForModerator: boolean,
  limitOfViewersInWebcam: number,
  limitOfViewersInWebcamIsEnable: boolean,
}

const ManyUsersContainer: React.FC<ManyUsersContainerProps> = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
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

  const {
    limitOfViewersInWebcam,
    limitOfViewersInWebcamIsEnable,
    lockSettings,
    webcamOnlyForModerator,
  } = props;

  return (
    <ManyUsersComponent
      toggleWebcamsOnlyForModerator={toggleWebcamsOnlyForModerator}
      currentUserIsModerator={currentUserIsModerator}
      viewersInWebcam={viewersInWebcam}
      limitOfViewersInWebcam={limitOfViewersInWebcam}
      limitOfViewersInWebcamIsEnable={limitOfViewersInWebcamIsEnable}
      lockSettings={lockSettings}
      webcamOnlyForModerator={webcamOnlyForModerator}
    />
  );
};

export default withTracker(() => {
  const meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  }, { fields: { 'usersPolicies.webcamsOnlyForModerator': 1, lockSettings: 1 } });
  return {
    lockSettings: meeting.lockSettings,
    webcamOnlyForModerator: meeting.usersPolicies.webcamsOnlyForModerator,
    limitOfViewersInWebcam: window.meetingClientSettings.public.app.viewersInWebcam,
    limitOfViewersInWebcamIsEnable: window.meetingClientSettings
      .public.app.enableLimitOfViewersInWebcam,
  };
})(ManyUsersContainer);
