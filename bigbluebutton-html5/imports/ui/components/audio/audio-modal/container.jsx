import React from 'react';
import { useReactiveVar } from '@apollo/client';
import { withTracker } from 'meteor/react-meteor-data';
import browserInfo from '/imports/utils/browserInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import AudioModal from './component';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import AudioError from '/imports/ui/services/audio-manager/error-codes';
import AppService from '/imports/ui/components/app/service';
import {
  joinMicrophone,
  closeModal,
  joinListenOnly,
  leaveEchoTest,
} from './service';
import Storage from '/imports/ui/services/storage/session';
import Service from '../service';
import AudioModalService from '/imports/ui/components/audio/audio-modal/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import AudioManager from '/imports/ui/services/audio-manager';

const AudioModalContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    away: user.away,
    isModerator: user.isModerator,
  }));

  const away = currentUserData?.away;
  const isModerator = currentUserData?.isModerator;

  const APP_CONFIG = window.meetingClientSettings.public.app;
  const forceListenOnly = getFromUserSettings('bbb_force_listen_only', APP_CONFIG.forceListenOnly);

  const forceListenOnlyAttendee = forceListenOnly && !isModerator;
  const inputDeviceId = useReactiveVar(AudioManager._inputDeviceId.value);
  const outputDeviceId = useReactiveVar(AudioManager._outputDeviceId.value);
  const showPermissionsOvelay = useReactiveVar(AudioManager._isWaitingPermissions.value);
  const isUsingAudio = Service.useIsUsingAudio();
  const isConnecting = useReactiveVar(AudioManager._isConnecting.value);
  const isConnected = useReactiveVar(AudioManager._isConnected.value);
  const isListenOnly = useReactiveVar(AudioManager._isListenOnly.value);
  const isEchoTest = useReactiveVar(AudioManager._isEchoTest.value);
  const autoplayBlocked = useReactiveVar(AudioManager._autoplayBlocked.value);

  return (
    <AudioModal
      away={away}
      forceListenOnlyAttendee={forceListenOnlyAttendee}
      inputDeviceId={inputDeviceId}
      outputDeviceId={outputDeviceId}
      showPermissionsOvelay={showPermissionsOvelay}
      isUsingAudio={isUsingAudio}
      isConnecting={isConnecting}
      isConnected={isConnected}
      isListenOnly={isListenOnly}
      isEchoTest={isEchoTest}
      autoplayBlocked={autoplayBlocked}
      {...props}
    />
  );
};

const invalidDialNumbers = ['0', '613-555-1212', '613-555-1234', '0000'];
const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

export default lockContextContainer(withTracker(({ userLocks, setIsOpen }) => {
  const APP_CONFIG = window.meetingClientSettings.public.app;
  const listenOnlyMode = getFromUserSettings('bbb_listen_only_mode', APP_CONFIG.listenOnlyMode);
  const skipCheck = getFromUserSettings('bbb_skip_check_audio', APP_CONFIG.skipCheck);
  const skipCheckOnJoin = getFromUserSettings('bbb_skip_check_audio_on_first_join', APP_CONFIG.skipCheckOnJoin);
  const autoJoin = getFromUserSettings('bbb_auto_join_audio', APP_CONFIG.autoJoin);
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, { fields: { voiceSettings: 1 } });
  const getEchoTest = Storage.getItem('getEchoTest');

  let formattedDialNum = '';
  let formattedTelVoice = '';
  let combinedDialInNum = '';
  if (meeting && meeting.voiceSettings) {
    const { dialNumber, telVoice } = meeting.voiceSettings;
    if (invalidDialNumbers.indexOf(dialNumber) < 0) {
      formattedDialNum = dialNumber;
      formattedTelVoice = telVoice;
      combinedDialInNum = `${dialNumber.replace(/\D+/g, '')},,,${telVoice.replace(/\D+/g, '')}`;
    }
  }

  const meetingIsBreakout = AppService.meetingIsBreakout();

  const joinFullAudioImmediately = (
    autoJoin
    && (
      skipCheck
      || (skipCheckOnJoin && !getEchoTest)
    ))
    || (
      skipCheck
      || (skipCheckOnJoin && !getEchoTest)
    );

  const { isIe } = browserInfo;

  const SHOW_VOLUME_METER = window.meetingClientSettings.public.media.showVolumeMeter;

  const {
    enabled: LOCAL_ECHO_TEST_ENABLED,
  } = window.meetingClientSettings.public.media.localEchoTest;

  return ({
    meetingIsBreakout,
    closeModal: () => closeModal(() => setIsOpen(false)),
    joinMicrophone: (skipEchoTest) => joinMicrophone(skipEchoTest || skipCheck || skipCheckOnJoin),
    joinListenOnly,
    leaveEchoTest,
    changeInputDevice: (inputDeviceId) => Service
      .changeInputDevice(inputDeviceId),
    changeInputStream: (inputStream) => Service.changeInputStream(inputStream),
    changeOutputDevice: (outputDeviceId, isLive) => Service
      .changeOutputDevice(outputDeviceId, isLive),
    joinEchoTest: () => Service.joinEchoTest(),
    exitAudio: () => Service.exitAudio(),
    showVolumeMeter: SHOW_VOLUME_METER,
    localEchoEnabled: LOCAL_ECHO_TEST_ENABLED,
    listenOnlyMode,
    formattedDialNum,
    formattedTelVoice,
    combinedDialInNum,
    audioLocked: userLocks.userMic,
    joinFullAudioImmediately,
    isMobileNative: navigator.userAgent.toLowerCase().includes('bbbnative'),
    isIE: isIe,
    handleAllowAutoplay: () => Service.handleAllowAutoplay(),
    notify: Service.notify,
    isRTL,
    AudioError,
    getTroubleshootingLink: AudioModalService.getTroubleshootingLink,
  });
})(AudioModalContainer));
