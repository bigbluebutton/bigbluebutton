import getFromUserSettings from '/imports/ui/services/users-settings';
import meetingStaticData from '/imports/ui/core/singletons/meetingStaticData';

export interface AudioModeAvailability {
  canUseMicrophone: boolean;
  canListenOnly: boolean;
}

/**
 * Mirrors the audio modal's microphone/listen only rules (audio/audio-modal/
 * container.jsx). The bridge comes from meetingStaticData, which is populated
 * before the join - the legacy public.media.* configs are not this meeting's.
 */
export const getAudioModeAvailability = (isModerator: boolean): AudioModeAvailability => {
  const APP_CONFIG = window.meetingClientSettings.public.app;
  const usingLiveKit = meetingStaticData.getMeetingData()?.audioBridge === 'livekit';
  const forceListenOnly = getFromUserSettings('bbb_force_listen_only', APP_CONFIG.forceListenOnly);
  const listenOnlyMode = forceListenOnly
    || (getFromUserSettings('bbb_listen_only_mode', APP_CONFIG.listenOnlyMode) && !usingLiveKit);
  const forceListenOnlyAttendee = forceListenOnly && !isModerator;

  return {
    canUseMicrophone: !forceListenOnlyAttendee,
    canListenOnly: !!listenOnlyMode,
  };
};
