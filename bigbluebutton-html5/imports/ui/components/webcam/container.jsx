import React, { useContext } from 'react';

import { withModalMounter } from '/imports/ui/components/common/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
import Auth from '/imports/ui/services/auth';
import breakoutService from '/imports/ui/components/breakout-room/service';
import VideoService from '/imports/ui/components/video-provider/service';
import { UsersContext } from '../components-data/users-context/context';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import WebcamComponent from '/imports/ui/components/webcam/component';

const WebcamContainer = ({
  audioModalIsOpen,
  swapLayout,
  usersVideo,
}) => {
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const isRTL = layoutSelect((i) => i.isRTL);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentation = layoutSelectOutput((i) => i.presentation);
  const cameraDock = layoutSelectOutput((i) => i.cameraDock);
  const layoutContextDispatch = layoutDispatch();

  const { cameraOptimalGridSize } = cameraDockInput;
  const { display: displayPresentation } = presentation;

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];

  return !audioModalIsOpen
    && usersVideo.length > 0
    ? (
      <WebcamComponent
        {...{
          swapLayout,
          usersVideo,
          cameraDock,
          cameraOptimalGridSize,
          layoutContextDispatch,
          fullscreen,
          isPresenter: currentUser.presenter,
          displayPresentation,
          isRTL,
        }}
      />
    )
    : null;
};

let userWasInBreakout = false;

export default withModalMounter(withTracker(() => {
  const { current_presentation: hasPresentation } = MediaService.getPresentationInfo();
  const data = {
    audioModalIsOpen: Session.get('audioModalIsOpen'),
    isMeteorConnected: Meteor.status().connected,
  };

  const userIsInBreakout = breakoutService.getBreakoutUserIsIn(Auth.userID);
  let deviceIds = Session.get('deviceIds');

  if (!userIsInBreakout && userWasInBreakout && deviceIds && deviceIds !== '') {
    /* used when re-sharing cameras after leaving a breakout room.
    it is needed in cases where the user has more than one active camera
    so we only share the second camera after the first
    has finished loading (can't share more than one at the same time) */
    const canConnect = Session.get('canConnect');

    deviceIds = deviceIds.split(',');

    if (canConnect) {
      const deviceId = deviceIds.shift();

      Session.set('canConnect', false);
      Session.set('WebcamDeviceId', deviceId);
      Session.set('deviceIds', deviceIds.join(','));

      VideoService.joinVideo(deviceId);
    }
  } else {
    userWasInBreakout = userIsInBreakout;
  }

  const { streams: usersVideo } = VideoService.getVideoStreams();
  data.usersVideo = usersVideo;
  data.swapLayout = (getSwapLayout() || !hasPresentation) && shouldEnableSwapLayout();

  if (data.swapLayout) {
    data.floatingOverlay = true;
    data.hideOverlay = true;
  }

  return data;
})(WebcamContainer));
