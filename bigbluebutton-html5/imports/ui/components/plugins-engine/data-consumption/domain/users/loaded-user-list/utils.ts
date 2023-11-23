import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { User } from '/imports/ui/Types/user';

/* eslint-disable @typescript-eslint/no-explicit-any */
const formatLoadedUserListDataFromGraphql = (
  responseDataFromGraphql: GraphqlDataHookSubscriptionResponse<Partial<User>[]>,
) => ({
  data: !responseDataFromGraphql.loading ? responseDataFromGraphql.data?.map((userItem) => ({
    userId: userItem.userId,
    name: userItem.name,
    role: userItem.role,
  }) as PluginSdk.LoadedUserListData) : undefined,
  loading: responseDataFromGraphql.loading,
  error: responseDataFromGraphql.errors?.[0],
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.LoadedUserListData>);

export default formatLoadedUserListDataFromGraphql;
