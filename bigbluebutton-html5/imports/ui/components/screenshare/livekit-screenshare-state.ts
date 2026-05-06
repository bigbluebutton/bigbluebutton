import { makeVar } from '@apollo/client';

export const liveKitScreenshareHasAudioVar = makeVar<boolean>(false);

export const setLiveKitScreenshareHasAudio = (hasAudio: boolean): void => {
  if (liveKitScreenshareHasAudioVar() !== hasAudio) {
    liveKitScreenshareHasAudioVar(hasAudio);
  }
};
