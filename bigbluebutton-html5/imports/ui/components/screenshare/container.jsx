import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users/';
import Auth from '/imports/ui/services/auth';
import MediaService, {
  getSwapLayout,
  shouldEnableSwapLayout,
} from '/imports/ui/components/media/service';
import {
  isVideoBroadcasting,
  isGloballyBroadcasting,
} from './service';
import ScreenshareComponent from './component';
import LayoutContext from '../layout/context';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { shouldEnableVolumeControl } from './service';

const ScreenshareContainer = (props) => {
  const fullscreenElementId = 'Screenshare';
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { output, fullscreen } = layoutContextState;
  const { screenShare } = output;
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);

  if (isVideoBroadcasting()) {
    return (
      <ScreenshareComponent
        {
        ...{
          layoutContextDispatch,
          ...props,
          ...screenShare,
          fullscreenContext,
          fullscreenElementId,
        }
        }
      />
    );
  }
  return null;
};

const LAYOUT_CONFIG = Meteor.settings.public.layout;

export default withTracker(() => {
  const user = Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } });
  return {
    isGloballyBroadcasting: isGloballyBroadcasting(),
    isPresenter: user.presenter,
    getSwapLayout,
    shouldEnableSwapLayout,
    toggleSwapLayout: MediaService.toggleSwapLayout,
    hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
    enableVolumeControl: shouldEnableVolumeControl(),
  };
})(ScreenshareContainer);
