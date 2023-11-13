import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getVideoUrl } from './service';
import ExternalVideoComponent from './component';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import ExternalVideoPlayerContainer from './external-video-player-graphql/component';

const ExternalVideoContainer = (props) => {
  const fullscreenElementId = 'ExternalVideo';
  const externalVideo = layoutSelectOutput((i) => i.externalVideo);
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);

  return (
    <ExternalVideoComponent
      {
      ...{
        layoutContextDispatch,
        ...props,
        ...externalVideo,
        isResizing,
        fullscreenElementId,
        fullscreenContext,
      }
      }
    />
  );
};

withTracker(({ isPresenter }) => {
  const inEchoTest = Session.get('inEchoTest');
  return {
    inEchoTest,
    isPresenter,
    videoUrl: getVideoUrl(),
  };
})(ExternalVideoContainer);

export default ExternalVideoPlayerContainer;
