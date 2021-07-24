import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users/';
import Auth from '/imports/ui/services/auth';
import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
import {
  isVideoBroadcasting,
  isGloballyBroadcasting,
} from './service';
import ScreenshareComponent from './component';
import { NLayoutContext } from '../layout/context/context';

const ScreenshareContainer = (props) => {
  const fullscreenElementId = 'Screenshare';
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { output, layoutLoaded, fullscreen } = newLayoutContextState;
  const { screenShare } = output;
  const { element } = fullscreen;
  const fullscreenContext = (element === fullscreenElementId);

  if (isVideoBroadcasting()) {
    return (
      <ScreenshareComponent
        {
        ...{
          newLayoutContextDispatch,
          ...props,
          ...screenShare,
          layoutLoaded,
          fullscreenContext,
          fullscreenElementId,
        }
        }
      />
    );
  }
  return null;
};

export default withTracker(() => {
  const user = Users.findOne({ userId: Auth.userID }, { fields: { presenter: 1 } });
  return {
    isGloballyBroadcasting: isGloballyBroadcasting(),
    isPresenter: user.presenter,
    getSwapLayout,
    shouldEnableSwapLayout,
    toggleSwapLayout: MediaService.toggleSwapLayout,
  };
})(ScreenshareContainer);
