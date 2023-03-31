import React, { useContext } from 'react';

import { withModalMounter } from '/imports/ui/components/common/modal/service';
import { withTracker } from 'meteor/react-meteor-data';
import MediaService from '/imports/ui/components/media/service';
import Auth from '/imports/ui/services/auth';
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
  const focusedId = layoutSelectInput((i) => i.focusedId);
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
          focusedId: cameraDock.focusedId,
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

export default withModalMounter(withTracker((props) => {
  const { current_presentation: hasPresentation } = MediaService.getPresentationInfo();
  const data = {
    audioModalIsOpen: Session.get('audioModalIsOpen'),
    isMeteorConnected: Meteor.status().connected,
  };

  const { streams: usersVideo } = VideoService.getVideoStreams();
  data.usersVideo = usersVideo;
  data.swapLayout = !hasPresentation || props.isLayoutSwapped;

  if (data.swapLayout) {
    data.floatingOverlay = true;
    data.hideOverlay = true;
  }

  return data;
})(WebcamContainer));
