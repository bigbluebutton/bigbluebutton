import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import WakeLock from './component';
import Service from './service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import useUserChangedLocalSettings from '../../services/settings/hooks/useUserChangedLocalSettings';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';
import { useStorageKey } from '../../services/storage/hooks';

const propTypes = {
  areAudioModalsOpen: PropTypes.bool,
  autoJoin: PropTypes.bool,
};

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const WakeLockContainer = (props) => {
  if (!Service.isMobile()) return null;
  const APP_CONFIG = window.meetingClientSettings.public.app;
  const autoJoin = getFromUserSettings('bbb_auto_join_audio', APP_CONFIG.autoJoin);
  const inEchoTest = useStorageKey('inEchoTest');
  const audioModalIsOpen = useStorageKey('audioModalIsOpen');
  const areAudioModalsOpen = audioModalIsOpen || inEchoTest;
  const wereAudioModalsOpen = usePrevious(areAudioModalsOpen);
  const [endedAudioSetup, setEndedAudioSetup] = useState(false || !autoJoin);
  const setLocalSettings = useUserChangedLocalSettings();
  const { wakeLock: wakeLockSettings } = useSettings(SETTINGS.APPLICATION);

  useEffect(() => {
    if (wereAudioModalsOpen && !areAudioModalsOpen && !endedAudioSetup) {
      setEndedAudioSetup(true);
    }
  }, [areAudioModalsOpen]);

  return endedAudioSetup ? (
    <WakeLock
      setLocalSettings={setLocalSettings}
      wakeLockSettings={wakeLockSettings}
      request={Service.request}
      release={Service.release}
      areAudioModalsOpen={areAudioModalsOpen}
      {...props}
    />
  ) : null;
};

WakeLockContainer.propTypes = propTypes;

export default WakeLockContainer;
