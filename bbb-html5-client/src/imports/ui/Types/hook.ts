import { FetchResult } from '@apollo/client';

export type GraphqlDataHookSubscriptionResponse<T> = FetchResult<T> & {
  loading: boolean;
};
