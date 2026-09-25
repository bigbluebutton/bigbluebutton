import AudioManager from '/imports/ui/services/audio-manager';

// A special audio re-join helper that handles the edge case scenario
// where an audio re-join is requested while the client still flags as being
// connected to audio. That is usually caused by a client's media state vs
// BBB's state desync, so this guarantees things go on orderly.
export const rejoinAudioWhileConnected = () => {
  // Legacy bridges: force a listen-only join. This mitigates an issue with
  // breakout listen-in that we won't fix, and preserves behavior - prlanzarin
  if (!AudioManager.isUsingLiveKit) return AudioManager.joinListenOnly();

  if (AudioManager.inputDeviceId === 'listen-only') return AudioManager.joinListenOnly();

  // LiveKit bridges: rejoin in the mode the client is in, which is supported
  // and preserves the user's previous choice.
  return AudioManager.joinMicrophone({ muted: AudioManager.isMuted });
};

export default {
  rejoinAudioWhileConnected,
};
