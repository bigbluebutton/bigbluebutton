import React from 'react';

export const AUDIO_MODES = {
  MICROPHONE: 'microphone',
  LISTEN_ONLY: 'listenOnly',
} as const;

export type AudioMode = typeof AUDIO_MODES[keyof typeof AUDIO_MODES];

export interface PreFlightContextValue {
  audioMode: AudioMode;
  setAudioMode: (mode: AudioMode) => void;
  joinMuted: boolean;
  setJoinMuted: (muted: boolean) => void;
  shareCamera: boolean;
  setShareCamera: (share: boolean) => void;
  // Set by the camera setup when the preview degrades to an error state: the
  // camera toggle then reads as off and the join does not try to share it.
  cameraFailed: boolean;
  setCameraFailed: (failed: boolean) => void;
  // Set by the audio selectors and the camera setup when the browser refuses
  // the device: the join waits on the device permission screen meanwhile.
  microphoneDenied: boolean;
  setMicrophoneDenied: (denied: boolean) => void;
  cameraDenied: boolean;
  setCameraDenied: (denied: boolean) => void;
  // Set while the browser has yet to answer for the device, its prompt
  // possibly open: the join waits for the answer. The camera's covers any
  // load of a camera the user turned on, not only its prompt.
  setMicrophonePending: (pending: boolean) => void;
  setCameraPending: (pending: boolean) => void;
  // A pending device the user is about to join with.
  devicesPending: boolean;
  // Bumped by the permission screen's retry: the audio selectors and the
  // camera setup ask the browser again whenever it changes.
  permissionRetry: number;
  // The user passed over a denied microphone where listen only is off: the
  // join carries no audio, and the microphone controls read as such.
  joiningWithoutAudio: boolean;
  // Set by the setup panel so the join can persist the camera selections
  // (device, profile, virtual background) right before joining.
  commitCameraRef: React.MutableRefObject<(() => void) | null>;
  commit: () => void;
}

const PreFlightContext = React.createContext<PreFlightContextValue | null>(null);

export const usePreFlight = (): PreFlightContextValue => {
  const context = React.useContext(PreFlightContext);

  if (!context) {
    throw new Error('usePreFlight must be used within a PreFlight component');
  }

  return context;
};

export default PreFlightContext;
