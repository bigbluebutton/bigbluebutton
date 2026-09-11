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
