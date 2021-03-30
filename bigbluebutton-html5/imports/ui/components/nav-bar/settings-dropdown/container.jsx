import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import browser from 'browser-detect';
import SettingsDropdown from './component';
import FullscreenService from '../../fullscreen-button/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const BROWSER_RESULTS = browser();
const isSafari = BROWSER_RESULTS.name === 'safari';
const isIphone = (navigator.userAgent.match(/iPhone/i)) ? true : false;
const noIOSFullscreen = ((isSafari && BROWSER_RESULTS.versionNumber < 12) || isIphone) ? true : false;

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
