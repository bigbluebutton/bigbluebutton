import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { Meeting } from '/imports/ui/Types/meeting';

const formatMeetingResponseFromGraphql = (
  graphqlDataResult: GraphqlDataHookSubscriptionResponse<Partial<Meeting>>,
): PluginSdk.GraphqlResponseWrapper<PluginSdk.MeetingData> => ({
  // While loading, useMeeting holds only the static meeting data, which lacks fields
  // MeetingData declares as required, such as lockSettings.
  data: graphqlDataResult.loading ? undefined : graphqlDataResult.data,
  loading: graphqlDataResult.loading,
  error: graphqlDataResult?.errors?.[0],
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.MeetingData>);

export default formatMeetingResponseFromGraphql;
