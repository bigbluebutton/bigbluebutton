import { makeVar } from '@apollo/client';
import { stringToHash } from '/imports/ui/core/singletons/subscriptionStore';
import { makePatchedQuery } from '/imports/ui/core/hooks/createUseSubscription';
import MEETING_SUBSCRIPTION from '/imports/ui/core/graphql/queries/meetingSubscription';

const settings = makeVar([]);
const voiceConf = makeVar();
const patchedSub = makePatchedQuery(MEETING_SUBSCRIPTION);
const subHash = stringToHash(JSON.stringify({
  subscription: patchedSub,
  variables: {},
}));

window.addEventListener('graphqlSubscription', (e) => {
  const { subscriptionHash, response } = e.detail;
  if (subscriptionHash === subHash) {
    const { data } = response;
    if (data) {
      const { metadata = [], voiceSettings } = data.meeting[0];
      // convert metadata format to { key: value }
      const result = metadata.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {});
      settings(result);
      voiceConf(voiceSettings.voiceConf);
    }
  }
});

export default function getFromMeetingSettings(setting, defaultValue) {
  const metadata = settings();
  const value = metadata ? metadata[setting] : undefined;

  return value || defaultValue;
}

export function getVoiceConf() {
  return voiceConf();
}
