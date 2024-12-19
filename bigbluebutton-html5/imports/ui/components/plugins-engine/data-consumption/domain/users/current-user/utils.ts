import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

const formatCurrentUserResponseFromGraphql = (
  graphqlDataResult: GraphqlDataHookSubscriptionResponse<Partial<User>>,
): PluginSdk.GraphqlResponseWrapper<PluginSdk.CurrentUserData> => ({
  data: !graphqlDataResult.loading ? {
    userId: graphqlDataResult?.data?.userId,
    name: graphqlDataResult?.data?.name,
    role: graphqlDataResult?.data?.role,
    presenter: graphqlDataResult?.data?.presenter,
    cameras: graphqlDataResult?.data?.cameras,
    extId: graphqlDataResult?.data?.extId,
  } : undefined,
  loading: graphqlDataResult.loading,
  error: graphqlDataResult?.errors?.[0],
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.CurrentUserData>);

export default formatCurrentUserResponseFromGraphql;
