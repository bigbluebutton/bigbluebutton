import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';

/* eslint-disable @typescript-eslint/no-explicit-any */
const formatLoadedUserListDataFromGraphql = (
  responseDataFromGraphql: Partial<User>[],
) => ({
  data: responseDataFromGraphql ? responseDataFromGraphql?.map((userItem) => ({
    userId: userItem.userId,
    name: userItem.name,
    role: userItem.role,
  }) as PluginSdk.LoadedUserListData) : undefined,
  loading: !(responseDataFromGraphql),
  error: undefined,
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.LoadedUserListData>);

export default formatLoadedUserListDataFromGraphql;
