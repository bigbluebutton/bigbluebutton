import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getVideoUrl } from './service';
import ExternalVideoComponent from './component';
import { layoutSelectInput, layoutSelectOutput, layoutDispatch } from '../layout/context';
import MediaService, { getSwapLayout } from '/imports/ui/components/media/service';
import getFromUserSettings from '/imports/ui/services/users-settings';

const ExternalVideoContainer = (props) => {
<<<<<<< HEAD
  const externalVideo = layoutSelectOutput((i) => i.externalVideo);
  const cameraDock = layoutSelectInput((i) => i.cameraDock);
  const { isResizing } = cameraDock;
  const layoutContextDispatch = layoutDispatch();

=======
  const fullscreenElementId = 'ExternalVideo';
  const layoutManager = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutManager;
  const { output, input, fullscreen } = layoutContextState;
  const { externalVideo } = output;
  const { cameraDock } = input;
  const { isResizing } = cameraDock;
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);
>>>>>>> 07cfcd376a44aceb543bcb8f098cf34d73b6b8bf
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

const LAYOUT_CONFIG = Meteor.settings.public.layout;

export default withTracker(({ isPresenter }) => {
  const inEchoTest = Session.get('inEchoTest');
  return {
    inEchoTest,
    isPresenter,
    videoUrl: getVideoUrl(),
    getSwapLayout,
    toggleSwapLayout: MediaService.toggleSwapLayout,
    hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
  };
})(ExternalVideoContainer);
