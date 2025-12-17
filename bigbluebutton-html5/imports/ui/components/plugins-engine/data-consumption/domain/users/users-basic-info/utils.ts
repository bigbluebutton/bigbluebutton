import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UserBasicInfo } from '/imports/ui/Types/user';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

const formatUsersBasicInfoDataFromGraphql = (
  responseDataFromGraphql?: GraphqlDataHookSubscriptionResponse<Partial<UserBasicInfo>[]>,
) => ({
  ...responseDataFromGraphql,
  data: responseDataFromGraphql?.data ? {
    user: responseDataFromGraphql?.data.map((userItem) => ({
      userId: userItem.userId,
      extId: userItem.extId,
      name: userItem.name,
      role: userItem.role,
      avatar: userItem.avatar,
      color: userItem.color,
      isModerator: userItem.isModerator,
      presenter: userItem.presenter,
    })),
  } : undefined,
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.UsersBasicInfoResponseFromGraphqlWrapper>);

export default formatUsersBasicInfoDataFromGraphql;
