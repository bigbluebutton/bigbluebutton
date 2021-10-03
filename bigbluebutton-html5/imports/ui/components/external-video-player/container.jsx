import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getVideoUrl } from './service';
import ExternalVideoComponent from './component';
import LayoutContext from '../layout/context';
import MediaService, { getSwapLayout } from '/imports/ui/components/media/service';

const ExternalVideoContainer = (props) => {
  const layoutManager = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutManager;
  const { output, input } = layoutContextState;
  const { externalVideo } = output;
  const { cameraDock } = input;
  const { isResizing } = cameraDock;
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
