import { makeVar } from '@apollo/client';

export const audioSettingsRequest = makeVar(0);

export const presentationActivityAt = makeVar(Date.now());

export const presentationMounted = makeVar(false);

// Written on every transcription result: read it, don't subscribe to it.
export const lastTranscriptionAt = makeVar(0);

export const speechRecognitionActive = makeVar(false);

export default {
  audioSettingsRequest,
  presentationActivityAt,
  presentationMounted,
  lastTranscriptionAt,
  speechRecognitionActive,
};
