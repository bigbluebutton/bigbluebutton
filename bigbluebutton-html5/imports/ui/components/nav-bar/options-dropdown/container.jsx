import React from 'react';
import { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import OptionsDropdown from './component';
import audioCaptionsService from '/imports/ui/components/audio/captions/service';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { layoutSelectInput, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { USER_LEAVE_MEETING } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';

const { isIphone } = deviceInfo;
const { isSafari, isValidSafariVersion } = browserInfo;

const noIOSFullscreen = !!(((isSafari && !isValidSafariVersion) || isIphone));

const OptionsDropdownContainer = (props) => {
  const { width: browserWidth } = layoutSelectInput((i) => i.browser);
  const isMobile = browserWidth <= SMALL_VIEWPORT_BREAKPOINT;
  const isRTL = layoutSelect((i) => i.isRTL);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  let optionsDropdownItems = [];
  if (pluginsExtensibleAreasAggregatedState.optionsDropdownItems) {
    optionsDropdownItems = [
      ...pluginsExtensibleAreasAggregatedState.optionsDropdownItems,
    ];
  }

  const [userLeaveMeeting] = useMutation(USER_LEAVE_MEETING);

  return (
    <OptionsDropdown {...{
      isMobile, isRTL, optionsDropdownItems, userLeaveMeeting, ...props,
    }}
    />
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
})(OptionsDropdownContainer);
