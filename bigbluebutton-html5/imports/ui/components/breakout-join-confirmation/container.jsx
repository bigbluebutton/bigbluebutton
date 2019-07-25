import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import VoiceUsers from '/imports/api/voice-users/';
import { makeCall } from '/imports/ui/services/api';
import breakoutService from '/imports/ui/components/breakout-room/service';
import BreakoutJoinConfirmationComponent from './component';

const BreakoutJoinConfirmationContrainer = props => (
  <BreakoutJoinConfirmationComponent
    {...props}
  />
);

const getURL = (breakoutId) => {
  const currentUserId = Auth.userID;
  const getBreakout = Breakouts.findOne({ breakoutId });
  const user = getBreakout ? getBreakout.users.find(u => u.userId === currentUserId) : '';
  if (user) return user.redirectToHtml5JoinURL;
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
  if (isFreeJoin && !url) {
    requestJoinURL(breakoutId);
  }

  const currentVoiceUser = VoiceUsers.findOne({ meetingId: Auth.meetingID, intId: Auth.userID });

  return {
    isFreeJoin,
    mountModal,
    breakoutName,
    breakoutURL: url,
    breakouts: breakoutService.getBreakouts(),
    requestJoinURL,
    getURL,
    currentVoiceUser,
  };
})(BreakoutJoinConfirmationContrainer);
