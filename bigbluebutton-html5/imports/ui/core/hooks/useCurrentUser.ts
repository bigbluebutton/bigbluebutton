import { useMemo } from 'react';
import { User } from '../../Types/user';
import createUseSubscription from './createUseSubscription';
import CURRENT_USER_SUBSCRIPTION from '../graphql/queries/currentUserSubscription';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import useStableResponse from './useStableResponse';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { currentUserComparator } from '../graphql/comparators/currentUserComparator';

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

  const singleUserData = responseData ? responseData[0] : null;

  // Create a stable response for the single user data
  const stableResponse = useStableResponse<Partial<User> | null>(
    {
      ...response,
      data: singleUserData,
    } as GraphqlDataHookSubscriptionResponse<Partial<User> | null>,
    currentUserComparator,
  );

  // Combine stable response with rawData
  return useMemo(() => ({
    ...stableResponse,
    rawData: responseData ?? null,
  }), [stableResponse, responseData]);
};

export default useCurrentUser;
