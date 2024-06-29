import { UserVoice } from '/imports/ui/Types/userVoice';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const formatTalkingIndicatorDataFromGraphql = (
  talkingIndicatorList: Partial<UserVoice>[],
): PluginSdk.GraphqlResponseWrapper<PluginSdk.UserVoice[]> => ({
  data: talkingIndicatorList.map((userVoice) => ({
    talking: userVoice.talking,
    startTime: userVoice.startTime,
    muted: userVoice.muted,
    userId: userVoice.userId,
  }) as PluginSdk.UserVoice),
  loading: !(talkingIndicatorList),
  error: undefined,
});

export default formatTalkingIndicatorDataFromGraphql;
