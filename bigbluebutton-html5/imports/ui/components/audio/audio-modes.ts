import getFromUserSettings from '/imports/ui/services/users-settings';

export interface AudioModes {
  // Listen only is the only mode on offer to this user.
  forceListenOnlyAttendee: boolean;
  // Listen only is offered at all.
  listenOnlyMode: boolean;
}

/**
 * The microphone / listen only rules, in one place: the audio modal applies
 * them once the user is in the meeting, the pre-flight before they join. The
 * bridge is the caller's to resolve - a subscription in the meeting, the static
 * meeting data before it.
 */
export const getAudioModes = (
  { isModerator, usingLiveKit }: { isModerator: boolean; usingLiveKit: boolean },
): AudioModes => {
  const APP_CONFIG = window.meetingClientSettings.public.app;
  const forceListenOnly = getFromUserSettings('bbb_force_listen_only', APP_CONFIG.forceListenOnly);
  const listenOnlyMode = forceListenOnly
    || (getFromUserSettings('bbb_listen_only_mode', APP_CONFIG.listenOnlyMode) && !usingLiveKit);

  return {
    forceListenOnlyAttendee: forceListenOnly && !isModerator,
    listenOnlyMode: !!listenOnlyMode,
  };
};

export default getAudioModes;
