import { useMemo } from 'react';
import { User } from '../../Types/user';
import createUseSubscription from './createUseSubscription';
import CURRENT_USER_SUBSCRIPTION from '../graphql/queries/currentUserSubscription';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import useStableResponse, { precompareResponses } from './useStableResponse';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { userShallowEqual } from './userComparators';

const currentUserSubscription = createUseSubscription<User>(CURRENT_USER_SUBSCRIPTION, {}, true);
const useCurrentUser = (fn: (c: Partial<User>) => Partial<User> = (u) => u) => {
  const response = currentUserSubscription(fn);
  let responseData = response.data;

  if (responseData && responseData.length > 1) {
    // log info about the current user if the subscription returns more than one user
    logger.error({
      logCode: 'multiple_current_user_error',
      extraInfo: {
        data: JSON.stringify(responseData),
        currentUserId: Auth.userID,
      },
    }, 'More than one user returned from current user subscription error');

    responseData = responseData.filter((user) => user.userId === Auth.userID);
  }

  const returnObject = useMemo(() => ({
    ...response,
    data: responseData ? responseData[0] : null,
    rawData: responseData ?? null,
  }), [response, responseData]);

  const currentUserComparator = (
    a: GraphqlDataHookSubscriptionResponse<Partial<User> | null> | null,
    b: GraphqlDataHookSubscriptionResponse<Partial<User> | null>,
  ) => {
    const pre = precompareResponses<Partial<User> | null>(a, b);
    if (pre === true) return true;
    if (pre === false) return false;
    const { aData: ad, bData: bd } = pre;
    return userShallowEqual(ad as Partial<User>, bd as Partial<User>);
  };

  return useStableResponse<Partial<User> | null>(
    returnObject as GraphqlDataHookSubscriptionResponse<Partial<User> | null>,
    currentUserComparator,
  );
};

export default useCurrentUser;
