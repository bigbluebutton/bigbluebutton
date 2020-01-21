import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import {
  isSafari,
  browserVersion,
  isIPhone13,
} from 'react-device-detect';
import SettingsDropdown from './component';
import FullscreenService from '../../fullscreen-button/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const isIphone = navigator.userAgent.match(/iPhone/i);
const noIOSFullscreen = (isSafari && browserVersion < 12) || (isIphone || isIPhone13);

const SettingsDropdownContainer = props => (
  <SettingsDropdown {...props} />
);

export default withTracker((props) => {
  const handleToggleFullscreen = () => FullscreenService.toggleFullScreen();
  return {
    amIModerator: props.amIModerator,
    handleToggleFullscreen,
    noIOSFullscreen,
    isMeteorConnected: Meteor.status().connected,
    isBreakoutRoom: meetingIsBreakout(),
  };
})(SettingsDropdownContainer);
