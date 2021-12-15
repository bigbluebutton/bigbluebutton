import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getVideoUrl } from './service';
import ExternalVideoComponent from './component';
import LayoutContext from '../layout/context';
import MediaService, { getSwapLayout } from '/imports/ui/components/media/service';
import getFromUserSettings from '/imports/ui/services/users-settings';

const ExternalVideoContainer = (props) => {
  const fullscreenElementId = 'ExternalVideo';
  const layoutManager = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutManager;
  const { output, input, fullscreen } = layoutContextState;
  const { externalVideo } = output;
  const { cameraDock } = input;
  const { isResizing } = cameraDock;
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
