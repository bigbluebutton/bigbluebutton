import React, { useContext } from 'react';
import deviceInfo from '/imports/utils/deviceInfo';
import browserInfo from '/imports/utils/browserInfo';
import OptionsDropdown from './component';
import FullscreenService from '/imports/ui/components/common/fullscreen-button/service';
import { layoutSelect } from '../../layout/context';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { USER_LEAVE_MEETING } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import Session from '/imports/ui/services/storage/in-memory';

const { isIphone } = deviceInfo;
const { isSafari, isValidSafariVersion } = browserInfo;

const noIOSFullscreen = !!(((isSafari && !isValidSafariVersion) || isIphone));

const setAudioCaptions = (value) => Session.setItem('audioCaptions', value);

const OptionsDropdownContainer = (props) => {
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
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
    isBreakout: m.isBreakout,
  }));

  const componentsFlags = currentMeeting?.componentsFlags;
  const audioCaptionsEnabled = componentsFlags?.hasCaption;

  const [userLeaveMeeting] = useMutation(USER_LEAVE_MEETING);
  const openOptions = useShortcut('openOptions');
  const audioCaptionsActive = useStorageKey('audioCaptions') || false;
  const isDropdownOpen = useStorageKey('dropdownOpen');

  return (
    <OptionsDropdown {...{
      isRTL,
      optionsDropdownItems,
      userLeaveMeeting,
      audioCaptionsEnabled,
      shortcuts: openOptions,
      audioCaptionsActive,
      isDropdownOpen,
      handleToggleFullscreen: FullscreenService.toggleFullScreen,
      audioCaptionsSet: (value) => setAudioCaptions(value),
      isMobile: deviceInfo.isMobile,
      noIOSFullscreen,
      isBreakoutRoom: currentMeeting?.isBreakout,
      // TODO: Replace/Remove
      isMeteorConnected: true,
      ...props,
    }}
    />
  );
};

export default OptionsDropdownContainer;
