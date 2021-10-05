import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Users from '/imports/api/users/';
import Auth from '/imports/ui/services/auth';
import MediaService, { getSwapLayout, shouldEnableSwapLayout } from '/imports/ui/components/media/service';
import {
  isVideoBroadcasting,
  isGloballyBroadcasting,
} from './service';
import ScreenshareComponent from './component';
import { layoutSelect, layoutSelectOutput, layoutDispatch } from '../layout/context';

const ScreenshareContainer = (props) => {
  const screenShare = layoutSelectOutput((i) => i.screenShare);
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const layoutContextDispatch = layoutDispatch();

  const { element } = fullscreen;
  const fullscreenElementId = 'Screenshare';
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
