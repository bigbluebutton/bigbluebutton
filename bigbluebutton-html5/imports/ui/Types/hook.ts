import { ApolloLink } from '@apollo/client';

export type GraphqlDataHookSubscriptionResponse<T> = ApolloLink.Result<T> & {
  loading: boolean;
};
