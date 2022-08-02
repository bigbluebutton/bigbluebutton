import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import SettingsDropdown from './component';
import audioCaptionsService from '/imports/ui/components/audio/captions/service';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { layoutSelectInput, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';

const { isIphone } = deviceInfo;
const { isSafari, isValidSafariVersion } = browserInfo;

const noIOSFullscreen = !!(((isSafari && !isValidSafariVersion) || isIphone));

const SettingsDropdownContainer = (props) => {
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const isRTL = layoutSelect((i) => i.isRTL);

  return (
    <SettingsDropdown {...{ isMobile, isRTL, ...props }} />
  );
};

export default withTracker((props) => {
  const handleToggleFullscreen = () => FullscreenService.toggleFullScreen();
  return {
    amIModerator: props.amIModerator,
    audioCaptionsEnabled: audioCaptionsService.hasAudioCaptions(),
    audioCaptionsActive: audioCaptionsService.getAudioCaptions(),
    audioCaptionsSet: (value) => audioCaptionsService.setAudioCaptions(value),
    isMobile: deviceInfo.isMobile,
    handleToggleFullscreen,
    noIOSFullscreen,
    isMeteorConnected: Meteor.status().connected,
    isBreakoutRoom: meetingIsBreakout(),
    isDropdownOpen: Session.get('dropdownOpen'),
  };
})(SettingsDropdownContainer);
