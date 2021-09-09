import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getVideoUrl } from './service';
import ExternalVideoComponent from './component';
import { LayoutContextFunc } from '../layout/context';
import MediaService, { getSwapLayout } from '/imports/ui/components/media/service';

const ExternalVideoContainer = (props) => {
  const { layoutContextSelector } = LayoutContextFunc;

  const externalVideo = layoutContextSelector.selectOutput((i) => i.externalVideo);
  const cameraDock = layoutContextSelector.selectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutContextSelector.layoutDispatch();

  return (
    <ExternalVideoComponent
      {
      ...{
        layoutContextDispatch,
        ...props,
        ...externalVideo,
        isResizing,
      }
      }
    />
  );
};

export default withTracker(({ isPresenter }) => {
  const inEchoTest = Session.get('inEchoTest');
  return {
    inEchoTest,
    isPresenter,
    videoUrl: getVideoUrl(),
    getSwapLayout,
    toggleSwapLayout: MediaService.toggleSwapLayout,
  };
})(ExternalVideoContainer);
