import React, { useContext } from 'react';

import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import VideoService from '/imports/ui/components/video-provider/service';
import { useSubscription } from '@apollo/client';
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
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
const { defaultSorting: DEFAULT_SORTING } = Meteor.settings.public.kurento.cameraSortingModes;

const WebcamContainer = ({
  audioModalIsOpen,
  usersVideo,
  layoutType,
  isLayoutSwapped,
}) => {
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const isRTL = layoutSelect((i) => i.isRTL);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const focusedId = layoutSelectInput((i) => i.focusedId);
  const presentation = layoutSelectOutput((i) => i.presentation);
  const cameraDock = layoutSelectOutput((i) => i.cameraDock);
  const layoutContextDispatch = layoutDispatch();
  const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationPageData?.pres_page_curr[0] || {};
  const hasPresentation = !!presentationPage?.presentationId;

  const swapLayout = !hasPresentation || isLayoutSwapped;

  let floatingOverlay = false;
  let hideOverlay = false;

  if (swapLayout) {
    floatingOverlay = true;
    hideOverlay = true;
  }

  const { data: presentationPageData } = useSubscription(CURRENT_PRESENTATION_PAGE_SUBSCRIPTION);
  const presentationPage = presentationPageData?.pres_page_curr[0] || {};
  const hasPresentation = !!presentationPage?.presentationId;

  const swapLayout = !hasPresentation || isLayoutSwapped;

  let floatingOverlay = false;
  let hideOverlay = false;

  if (swapLayout) {
    floatingOverlay = true;
    hideOverlay = true;
  }

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
          floatingOverlay,
          hideOverlay,
        }}
      />
    )
    : null;
};

export default withTracker(() => {
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

  return data;
})(WebcamContainer);
