import { makeVar } from '@apollo/client';
import { stringToHash } from '/imports/ui/core/singletons/subscriptionStore';
import { makePatchedQuery } from '/imports/ui/core/hooks/createUseSubscription';
import MEETING_SUBSCRIPTION from '/imports/ui/core/graphql/queries/meetingSubscription';

const voiceConf = makeVar();
const patchedSub = makePatchedQuery(MEETING_SUBSCRIPTION);
const subHash = stringToHash(JSON.stringify({
  subscription: patchedSub,
  variables: {},
}));

window.addEventListener('graphqlSubscription', (e) => {
  const { subscriptionHash, response } = e.detail;
  if (!response) return;
  if (subscriptionHash === subHash) {
    const { data } = response;
    if (data) {
      const { voiceSettings } = data.meeting[0];
      voiceConf(voiceSettings.voiceConf);
    }
  }
});

export function getVoiceConf() {
  return voiceConf();
}

export default {
  getVoiceConf,
};
