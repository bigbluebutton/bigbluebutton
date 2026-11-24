import { makeVar } from '@apollo/client';

// Written on every transcription result: read it, don't subscribe to it.
export const lastTranscriptionAt = makeVar(0);

export const speechRecognitionActive = makeVar(false);

export default {
  lastTranscriptionAt,
  speechRecognitionActive,
};
