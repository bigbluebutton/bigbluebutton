import { useEffect, useMemo, useState } from 'react';
import GrahqlSubscriptionStore, { stringToHash, SubscriptionStructure } from '/imports/ui/core/singletons/subscriptionStore';
import { DocumentNode, TypedQueryDocumentNode } from 'graphql';
import {
  OperationVariables, SubscriptionHookOptions, makeVar, useReactiveVar, ReactiveVar,
} from '@apollo/client';
import { makePatchedQuery } from '/imports/ui/core/hooks/createUseSubscription';

const initialEmptySub = makeVar<SubscriptionStructure<unknown>>({
  count: 0,
  data: null,
  error: null,
  loading: true,
  sub: null,
});

const useDeduplicatedSubscription = <T>(
  subscription: DocumentNode | TypedQueryDocumentNode,
  options?: SubscriptionHookOptions<NoInfer<T>, NoInfer<OperationVariables>>,
  usePatchedSubscription = false,
) => {
  // When patching is enabled, rename the operation to Patched_* so the middleware streams
  // JSON patches instead of full datasets; the subscription store applies them automatically.
  const query = useMemo(
    () => (usePatchedSubscription ? makePatchedQuery(subscription) : subscription),
    [subscription, usePatchedSubscription],
  );
  const subscriptionHash = stringToHash(JSON.stringify({
    subscription: query,
    variables: options?.variables,
    skip: options?.skip,
  }));

  const [subVar, setSubVar] = useState<
    ReactiveVar<SubscriptionStructure<T>>>(() => initialEmptySub as ReactiveVar<SubscriptionStructure<T>>);

  useEffect(() => {
    if (options?.skip) {
      setSubVar(() => makeVar<SubscriptionStructure<T>>({
        count: 0,
        data: null,
        error: null,
        loading: true,
        sub: null,
      }));
      return () => {};
    }

    const newSubVar = GrahqlSubscriptionStore.makeSubscription<T>(
      query,
      options?.variables,
      usePatchedSubscription ? 'no-cache' : undefined,
    );
    setSubVar(() => newSubVar);

    return () => {
      GrahqlSubscriptionStore.unsubscribe(query, options?.variables);
    };
  }, [subscriptionHash, options?.skip]);

  return useReactiveVar(subVar);
};

export default useDeduplicatedSubscription;
