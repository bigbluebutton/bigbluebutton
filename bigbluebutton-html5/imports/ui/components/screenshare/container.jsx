import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
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
import { layoutSelect, layoutSelectOutput, layoutDispatch } from '../layout/context';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const ScreenshareContainer = (props) => {
  const screenShare = layoutSelectOutput((i) => i.screenShare);
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const layoutContextDispatch = layoutDispatch();

  const { element } = fullscreen;
  const fullscreenElementId = 'Screenshare';
  const fullscreenContext = (element === fullscreenElementId);

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const isPresenter = currentUser.presenter;

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
          isPresenter,
        }
        }
      />
    );
  }
  return null;
};

const LAYOUT_CONFIG = Meteor.settings.public.layout;

export default withTracker(() => ({
  isGloballyBroadcasting: isGloballyBroadcasting(),
  getSwapLayout,
  shouldEnableSwapLayout,
  toggleSwapLayout: MediaService.toggleSwapLayout,
  hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
}))(ScreenshareContainer);
