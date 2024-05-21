import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { Meeting } from '/imports/ui/Types/meeting';

const formatMeetingResponseFromGraphql = (
  graphqlDataResult: GraphqlDataHookSubscriptionResponse<Partial<Meeting>>,
): PluginSdk.GraphqlResponseWrapper<PluginSdk.Meeting> => ({
  data: graphqlDataResult.data ? {
    name: graphqlDataResult?.data?.name,
    meetingId: graphqlDataResult?.data?.meetingId,
    loginUrl: graphqlDataResult?.data?.loginUrl,
  } : undefined,
  loading: graphqlDataResult.loading,
  error: graphqlDataResult?.errors?.[0],
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.Meeting>);

export default formatMeetingResponseFromGraphql;
