import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { UserVoice } from '/imports/ui/Types/userVoice';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const formatTalkingIndicatorDataFromGraphql = (
  responseDataFromGraphql: GraphqlDataHookSubscriptionResponse<Partial<UserVoice>[]>,
) => ({
  data: !responseDataFromGraphql.loading ? responseDataFromGraphql.data?.map((userVoice) => ({
    talking: userVoice.talking,
    startTime: userVoice.startTime,
    muted: userVoice.muted,
    userId: userVoice.userId,
  }) as PluginSdk.UserVoice) : undefined,
  loading: responseDataFromGraphql.loading,
  error: responseDataFromGraphql.errors?.[0],
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.UserVoice>);

export default formatTalkingIndicatorDataFromGraphql;
