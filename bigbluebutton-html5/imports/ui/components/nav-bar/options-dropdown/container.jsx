import React from 'react';
import { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import OptionsDropdown from './component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import { layoutSelectInput, layoutSelect } from '../../layout/context';
import { SMALL_VIEWPORT_BREAKPOINT } from '../../layout/enums';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { USER_LEAVE_MEETING } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';

const { isIphone } = deviceInfo;
const { isSafari, isValidSafariVersion } = browserInfo;

const noIOSFullscreen = !!(((isSafari && !isValidSafariVersion) || isIphone));
const getAudioCaptions = () => Session.get('audioCaptions') || false;

const setAudioCaptions = (value) => Session.set('audioCaptions', value);

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

  const {
    data: currentMeeting,
  } = useMeeting((m) => {
    return {
      componentsFlags: m.componentsFlags,
    };
  });

  const componentsFlags = currentMeeting?.componentsFlags;
  const audioCaptionsEnabled = componentsFlags?.hasCaption;

  const [userLeaveMeeting] = useMutation(USER_LEAVE_MEETING);
  const openOptions = useShortcut('openOptions');

  return (
    <OptionsDropdown {...{
      isMobile,
      isRTL,
      optionsDropdownItems,
      userLeaveMeeting,
      audioCaptionsEnabled,
      shortcuts: openOptions,
      ...props,
    }}
    />
  );
};

export default withTracker((props) => {
  const handleToggleFullscreen = () => FullscreenService.toggleFullScreen();
  return {
    amIModerator: props.amIModerator,
    audioCaptionsActive: getAudioCaptions(),
    audioCaptionsSet: (value) => setAudioCaptions(value),
    isMobile: deviceInfo.isMobile,
    handleToggleFullscreen,
    noIOSFullscreen,
    isMeteorConnected: Meteor.status().connected,
    isBreakoutRoom: meetingIsBreakout(),
    isDropdownOpen: Session.get('dropdownOpen'),
  };
})(OptionsDropdownContainer);
