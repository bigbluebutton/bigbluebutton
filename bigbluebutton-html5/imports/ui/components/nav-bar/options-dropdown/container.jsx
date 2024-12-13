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
import { useIsLayoutsEnabled } from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import Auth from '/imports/ui/services/auth';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/user-actions/mutations';
import {
  muteAway,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';

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

  const { data: currentUserData } = useCurrentUser((user) => ({
    away: user.away,
  }));
  const voiceToggle = useToggleVoice();
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const muted = !unmutedUsers[Auth.userID];

  const away = currentUserData?.away;

  const componentsFlags = currentMeeting?.componentsFlags;
  const audioCaptionsEnabled = componentsFlags?.hasCaption;

  const [userLeaveMeeting] = useMutation(USER_LEAVE_MEETING);
  const [setAway] = useMutation(SET_AWAY);

  const handleToggleAFK = () => {
    muteAway(muted, away, voiceToggle);
    setAway({
      variables: {
        away: !away,
      },
    });
  };

  const openOptions = useShortcut('openOptions');
  const audioCaptionsActive = useStorageKey('audioCaptions') || false;
  const isDropdownOpen = useStorageKey('dropdownOpen');
  const isLayoutsEnabled = useIsLayoutsEnabled();

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
      isLayoutsEnabled,
      away,
      handleToggleAFK,
      ...props,
    }}
    />
  );
};

export default OptionsDropdownContainer;
