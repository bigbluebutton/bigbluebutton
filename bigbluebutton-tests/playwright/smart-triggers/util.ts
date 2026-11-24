import { type ClientSettingsOverrides } from '../core/page';

type RuleName =
  | 'talkingWhileMuted'
  | 'noMicSignal'
  | 'handStillRaised'
  | 'newMicrophone'
  | 'recordingWithNoSpeech'
  | 'presenterAway';

// Every rule off, so each test turns on only the rule it covers and no other
// hint can appear in its way. The full block is sent because servers whose
// packaged settings predate smart triggers have none of these keys.
const ALL_RULES_OFF = {
  enabled: true,
  talkingWhileMuted: { enabled: false, speechThresholdDb: -50, hideAfterMs: 4000 },
  noMicSignal: { enabled: false, afterSeconds: 6, signalFloorDb: -95, cooldownMs: 300000 },
  handStillRaised: { enabled: false, cooldownMs: 120000 },
  newMicrophone: { enabled: false },
  recordingWithNoSpeech: { enabled: false, startCheckSeconds: 30, maxSilenceMinutes: 10 },
  presenterAway: { enabled: false, cooldownMs: 2000 },
  speechNotTranscribed: {
    enabled: false,
    speechThresholdDb: -50,
    afterSpeakingSeconds: 5,
    hideAfterMs: 10000,
    helpLink: '',
  },
};

export const smartTriggersOverride = (
  rule: RuleName,
  ruleSettings: Record<string, number> = {},
): ClientSettingsOverrides => ({
  public: {
    app: {
      smartTriggers: {
        ...ALL_RULES_OFF,
        [rule]: { ...ALL_RULES_OFF[rule], ...ruleSettings, enabled: true },
      },
    },
  },
});

// Hints driven by a timer show up within this long of the shortened threshold.
export const IDLE_CHECK_TIMEOUT = 45000;

// The fake microphone plays speech. Swapping its track for silence gives a
// microphone that is on but never heard.
export function silenceMicrophone() {
  const { mediaDevices } = navigator;
  const getUserMedia = mediaDevices.getUserMedia.bind(mediaDevices);
  mediaDevices.getUserMedia = async (constraints) => {
    const stream = await getUserMedia(constraints);
    stream.getAudioTracks().forEach((track) => {
      const [silence] = new AudioContext().createMediaStreamDestination().stream.getAudioTracks();
      stream.removeTrack(track);
      track.stop();
      stream.addTrack(silence);
    });
    return stream;
  };
}
