import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import SettingsDropdown from './component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { layoutSelectInput } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';

const { isIphone } = deviceInfo;
const { isSafari, isValidSafariVersion } = browserInfo;

const noIOSFullscreen = !!(((isSafari && !isValidSafariVersion) || isIphone));

const SettingsDropdownContainer = (props) => {
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;

  return (
    <SettingsDropdown {...{ isMobile, ...props }} />
  );
};

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
