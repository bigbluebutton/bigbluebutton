import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import SettingsDropdown from './component';
import FullscreenService from '../../fullscreen-button/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const { isIphone } = deviceInfo;
const { isSafari, isValidSafariVersion } = browserInfo;

const noIOSFullscreen = !!(((isSafari && !isValidSafariVersion) || isIphone));

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
    isDropdownOpen: Session.get('dropdownOpen'),
  };
})(SettingsDropdownContainer);
