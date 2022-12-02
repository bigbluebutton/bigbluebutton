import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import { getRemoteDesktopUrl, getRemoteDesktopPassword, getRemoteDesktopCanOperate } from './service';
import LayoutContext from '../layout/context';
import RemoteDesktop from './component';
import getFromUserSettings from '/imports/ui/services/users-settings';

const RemoteDesktopContainer = props => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const {
    input, output, layoutType, fullscreen, deviceType,
  } = layoutContextState;
  const { presentation } = output;
  const { element } = fullscreen;
  const fullscreenElementId = 'RemoteDesktop';
  const fullscreenContext = (element === fullscreenElementId);
  return (
    <RemoteDesktop {...{ ...props, layoutContextDispatch, presentationBounds: presentation, fullscreenContext, }} />
  );
};

const LAYOUT_CONFIG = Meteor.settings.public.layout;

export default withTracker(({ isPresenter }) => {
  const inEchoTest = Session.get('inEchoTest');
  return {
    inEchoTest,
    isPresenter,
    remoteDesktopUrl: getRemoteDesktopUrl(),
    remoteDesktopPassword: getRemoteDesktopPassword(),
    remoteDesktopCanOperate: getRemoteDesktopCanOperate(),
    hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
  };
})(RemoteDesktopContainer);
