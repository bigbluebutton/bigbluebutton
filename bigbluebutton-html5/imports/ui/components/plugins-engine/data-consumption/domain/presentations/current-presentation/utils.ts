import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { CurrentPresentation } from '/imports/ui/Types/presentation';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

const formatCurrentPresentation = (
  graphqlDataResult: GraphqlDataHookSubscriptionResponse<Partial<CurrentPresentation>>,
) => ({
  data: {
    presentationId: graphqlDataResult?.data?.presentationId,
    currentPage: {
      id: graphqlDataResult?.data?.pages?.[0].pageId,
      num: graphqlDataResult?.data?.pages?.[0].num,
      urlsJson: graphqlDataResult?.data?.pages?.[0].urlsJson,
    },
  },
  loading: graphqlDataResult?.loading,
  error: graphqlDataResult?.errors?.[0],
}) as PluginSdk.GraphqlResponseWrapper<PluginSdk.CurrentPresentation>;

export default formatCurrentPresentation;
