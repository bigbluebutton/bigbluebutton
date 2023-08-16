import React, { useContext } from 'react';

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
import { LAYOUT_TYPE } from '../layout/enums';
import { sortVideoStreams } from '/imports/ui/components/video-provider/stream-sorting';

const { defaultSorting: DEFAULT_SORTING } = Meteor.settings.public.kurento.cameraSortingModes;

const WebcamContainer = ({
  audioModalIsOpen,
  swapLayout,
  usersVideo,
  layoutType,
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

  const isGridEnabled = layoutType === LAYOUT_TYPE.VIDEO_FOCUS;

  return !audioModalIsOpen
    && (usersVideo.length > 0 || isGridEnabled)
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
          isGridEnabled,
        }}
      />
    )
    : null;
};

export default withTracker((props) => {
  const { current_presentation: hasPresentation } = MediaService.getPresentationInfo();
  const data = {
    audioModalIsOpen: Session.get('audioModalIsOpen'),
    isMeteorConnected: Meteor.status().connected,
  };

  const { streams: usersVideo, gridUsers } = VideoService.getVideoStreams();

  if(gridUsers.length > 0) {
    const items = usersVideo.concat(gridUsers);
    data.usersVideo = sortVideoStreams(items, DEFAULT_SORTING);
  } else {
    data.usersVideo = usersVideo;
  }
  data.swapLayout = !hasPresentation || props.isLayoutSwapped;

  if (data.swapLayout) {
    data.floatingOverlay = true;
    data.hideOverlay = true;
  }

  return data;
})(WebcamContainer);
