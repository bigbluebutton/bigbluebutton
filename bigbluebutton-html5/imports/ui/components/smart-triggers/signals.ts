import { makeVar } from '@apollo/client';

export const audioSettingsRequest = makeVar(0);

export const presentationActivityAt = makeVar(Date.now());

export const presentationMounted = makeVar(false);

export default {
  audioSettingsRequest,
  presentationActivityAt,
  presentationMounted,
};
