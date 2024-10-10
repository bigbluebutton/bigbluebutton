import React, { useCallback } from 'react';
import { useReactiveVar } from '@apollo/client';
import browserInfo from '/imports/utils/browserInfo';
import getFromUserSettings from '/imports/ui/services/users-settings';
import AudioModal from './component';
import AudioError from '/imports/ui/services/audio-manager/error-codes';
import AppService from '/imports/ui/components/app/service';
import {
  joinMicrophone,
  closeModal,
  joinListenOnly,
  leaveEchoTest,
} from './service';
import Service from '../service';
import AudioModalService from '/imports/ui/components/audio/audio-modal/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import AudioManager from '/imports/ui/services/audio-manager';
import { useStorageKey } from '/imports/ui/services/storage/hooks';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useLockContext from '/imports/ui/components/lock-viewers/hooks/useLockContext';
import deviceInfo from '/imports/utils/deviceInfo';
import { useIsAudioTranscriptionEnabled } from '/imports/ui/components/audio/audio-graphql/audio-captions/service';

const invalidDialNumbers = ['0', '613-555-1212', '613-555-1234', '0000'];

const AudioModalContainer = (props) => {
  const { data: meeting } = useMeeting((m) => ({
    voiceSettings: m.voiceSettings,
  }));
  const { data: currentUserData } = useCurrentUser((user) => ({
    away: user.away,
    isModerator: user.isModerator,
  }));
  const getEchoTest = useStorageKey('getEchoTest', 'session');

  const away = currentUserData?.away;
  const isModerator = currentUserData?.isModerator;

  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const APP_CONFIG = window.meetingClientSettings.public.app;
  const forceListenOnly = getFromUserSettings('bbb_force_listen_only', APP_CONFIG.forceListenOnly);
  const listenOnlyMode = getFromUserSettings('bbb_listen_only_mode', APP_CONFIG.listenOnlyMode);
  const skipCheck = getFromUserSettings('bbb_skip_check_audio', APP_CONFIG.skipCheck);
  const skipCheckOnJoin = getFromUserSettings('bbb_skip_check_audio_on_first_join', APP_CONFIG.skipCheckOnJoin);
  // Mobile users have significant trouble figuring out correct audio I/O devices
  // according to feedbacks. The potential absence of echo test after having set
  // an initial device in the first join cycle might complicate things even further
  // if they got it wrong. Hence, we ignore the flag for mobile users.
  const skipEchoTestIfPreviousDevice = getFromUserSettings(
    'bbb_skip_echotest_if_previous_device',
    APP_CONFIG.skipEchoTestIfPreviousDevice,
  ) && !deviceInfo.isMobile;
  const autoJoin = getFromUserSettings('bbb_auto_join_audio', APP_CONFIG.autoJoin);

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
  const { isIe } = browserInfo;

  const {
    enabled: LOCAL_ECHO_TEST_ENABLED,
  } = window.meetingClientSettings.public.media.localEchoTest;

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
  const isMuted = useReactiveVar(AudioManager._isMuted.value);
  const meetingIsBreakout = AppService.useMeetingIsBreakout();
  const supportsTransparentListenOnly = useReactiveVar(
    AudioManager._transparentListenOnlySupported.value,
  );
  const permissionStatus = useReactiveVar(AudioManager._permissionStatus.value);
  const { userLocks } = useLockContext();
  const isListenOnlyInputDevice = Service.inputDeviceId() === 'listen-only';
  const devicesAlreadyConfigured = skipEchoTestIfPreviousDevice
    && Service.inputDeviceId();
  const joinFullAudioImmediately = !isListenOnlyInputDevice
    && (skipCheck || (skipCheckOnJoin && !getEchoTest) || devicesAlreadyConfigured);
  const { setIsOpen } = props;
  const close = useCallback(() => closeModal(() => setIsOpen(false)), [setIsOpen]);
  const joinMic = useCallback(
    (options = {}) => joinMicrophone({
      skipEchoTest: options.skipEchoTest || joinFullAudioImmediately,
    }),
    [skipCheck, skipCheckOnJoin],
  );
  const isTranscriptionEnabled = useIsAudioTranscriptionEnabled();

  if (!currentUserData) return null;

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
      isMuted={isMuted}
      toggleMuteMicrophoneSystem={Service.toggleMuteMicrophoneSystem}
      autoplayBlocked={autoplayBlocked}
      getEchoTest={getEchoTest}
      joinFullAudioImmediately={joinFullAudioImmediately}
      meetingIsBreakout={meetingIsBreakout}
      closeModal={close}
      joinMicrophone={joinMic}
      joinListenOnly={joinListenOnly}
      leaveEchoTest={leaveEchoTest}
      changeInputDevice={Service.changeInputDevice}
      liveChangeInputDevice={Service.liveChangeInputDevice}
      changeInputStream={Service.changeInputStream}
      changeOutputDevice={Service.changeOutputDevice}
      joinEchoTest={Service.joinEchoTest}
      exitAudio={Service.exitAudio}
      localEchoEnabled={LOCAL_ECHO_TEST_ENABLED}
      listenOnlyMode={listenOnlyMode}
      formattedDialNum={formattedDialNum}
      formattedTelVoice={formattedTelVoice}
      combinedDialInNum={combinedDialInNum}
      audioLocked={userLocks.userMic}
      autoJoin={autoJoin}
      skipCheck={skipCheck}
      skipCheckOnJoin={skipCheckOnJoin}
      isMobileNative={navigator.userAgent.toLowerCase().includes('bbbnative')}
      isIE={isIe}
      handleAllowAutoplay={Service.handleAllowAutoplay}
      notify={Service.notify}
      isRTL={isRTL}
      AudioError={AudioError}
      getTroubleshootingLink={AudioModalService.getTroubleshootingLink}
      getMicrophonePermissionStatus={Service.getMicrophonePermissionStatus}
      getAudioConstraints={Service.getAudioConstraints}
      doGUM={Service.doGUM}
      bypassGUM={Service.bypassGUM}
      supportsTransparentListenOnly={supportsTransparentListenOnly}
      setIsOpen={setIsOpen}
      hasMicrophonePermission={Service.hasMicrophonePermission}
      permissionStatus={permissionStatus}
      isTranscriptionEnabled={isTranscriptionEnabled}
      {...props}
    />
  );
};

export default AudioModalContainer;
