import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import breakoutService from '/imports/ui/components/breakout-room/service';
import AudioManager from '/imports/ui/services/audio-manager';
import BreakoutJoinConfirmationComponent from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const BreakoutJoinConfirmationContrainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;

  return <BreakoutJoinConfirmationComponent
    {...props}
    amIPresenter={amIPresenter}
  />
};

const getURL = (breakoutId) => {
  const currentUserId = Auth.userID;
  const breakout = Breakouts.findOne({ breakoutId }, { fields: { [`url_${currentUserId}`]: 1 } });
  const breakoutUrlData = (breakout && breakout[`url_${currentUserId}`]) ? breakout[`url_${currentUserId}`] : null;
  if (breakoutUrlData) return breakoutUrlData.redirectToHtml5JoinURL;
  return '';
};

const requestJoinURL = (breakoutId) => {
  makeCall('requestJoinURL', {
    breakoutId,
  });
};

export default withTracker(({ breakout, mountModal, breakoutName }) => {
  const isFreeJoin = breakout.freeJoin;
  const { breakoutId } = breakout;
  const url = getURL(breakoutId);

  return {
    isFreeJoin,
    mountModal,
    breakoutName,
    breakoutURL: url,
    breakouts: breakoutService.getBreakouts(),
    requestJoinURL,
    getURL,
    voiceUserJoined: AudioManager.isUsingAudio(),
  };
})(BreakoutJoinConfirmationContrainer);
