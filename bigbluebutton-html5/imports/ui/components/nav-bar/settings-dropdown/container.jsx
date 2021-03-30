import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Bowser from 'bowser';
import SettingsDropdown from './component';
import FullscreenService from '../../fullscreen-button/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const BROWSER_RESULTS = Bowser.getParser(window.navigator.userAgent);
const isSafari = BROWSER_RESULTS.getBrowserName() === 'Safari';
const isIphone = !!(navigator.userAgent.match(/iPhone/i));
const isValidBrowserVersion = BROWSER_RESULTS.satisfies({
  safari: '>12',
});

const noIOSFullscreen = !!(((isSafari && !isValidBrowserVersion) || isIphone));

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
