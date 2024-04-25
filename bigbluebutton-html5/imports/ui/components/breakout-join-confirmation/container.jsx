import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import { useMutation } from '@apollo/client';
import breakoutService from '/imports/ui/components/breakout-room/service';
import AudioManager from '/imports/ui/services/audio-manager';
import BreakoutJoinConfirmationComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { BREAKOUT_ROOM_REQUEST_JOIN_URL } from '../breakout-room/mutations';
import { CAMERA_BROADCAST_STOP } from '../video-provider/mutations';
import { useStreams, useExitVideo } from '/imports/ui/components/video-provider/video-provider-graphql/hooks';

const BreakoutJoinConfirmationContrainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
  }));
  const { streams } = useStreams();
  const amIPresenter = currentUserData?.presenter;

  const [breakoutRoomRequestJoinURL] = useMutation(BREAKOUT_ROOM_REQUEST_JOIN_URL);
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);

  const sendUserUnshareWebcam = (cameraId) => {
    cameraBroadcastStop({ variables: { cameraId } });
  };

  const requestJoinURL = (breakoutRoomId) => {
    breakoutRoomRequestJoinURL({ variables: { breakoutRoomId } });
  };

  const exitVideo = useExitVideo();

  return <BreakoutJoinConfirmationComponent
    {...props}
    amIPresenter={amIPresenter}
    requestJoinURL={requestJoinURL}
    sendUserUnshareWebcam={sendUserUnshareWebcam}
    streams={streams}
    exitVideo={exitVideo}
  />
};

const getURL = (breakoutId) => {
  const currentUserId = Auth.userID;
  const breakout = Breakouts.findOne({ breakoutId }, { fields: { [`url_${currentUserId}`]: 1 } });
  const breakoutUrlData = (breakout && breakout[`url_${currentUserId}`]) ? breakout[`url_${currentUserId}`] : null;
  if (breakoutUrlData) return breakoutUrlData.redirectToHtml5JoinURL;
  return '';
};

export default withTracker(({ breakout, breakoutName }) => {
  const isFreeJoin = breakout.freeJoin;
  const { breakoutId } = breakout;
  const url = getURL(breakoutId);

  return {
    isFreeJoin,
    breakoutName,
    breakoutURL: url,
    breakouts: breakoutService.getBreakouts(),
    getURL,
    voiceUserJoined: AudioManager.isUsingAudio(),
  };
})(BreakoutJoinConfirmationContrainer);
