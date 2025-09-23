import { useEffect, useState } from 'react';
import GrahqlSubscriptionStore, { stringToHash, SubscriptionStructure } from '/imports/ui/core/singletons/subscriptionStore';
import { DocumentNode, TypedQueryDocumentNode } from 'graphql';
import { OperationVariables, makeVar, ReactiveVar } from '@apollo/client';

import { useReactiveVar, useSubscription } from '@apollo/client/react';

const initialEmptySub = makeVar<SubscriptionStructure<unknown>>({
  count: 0,
  data: null,
  error: null,
  loading: true,
  sub: null,
});

const useDeduplicatedSubscription = <T>(
  subscription: DocumentNode | TypedQueryDocumentNode,
  options?: useSubscription.Options<NoInfer<T>, NoInfer<OperationVariables>>,
) => {
  const subscriptionHash = stringToHash(JSON.stringify({
    subscription,
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

    const newSubVar = GrahqlSubscriptionStore.makeSubscription<T>(subscription, options?.variables);
    setSubVar(() => newSubVar);

    return () => {
      GrahqlSubscriptionStore.unsubscribe(subscription, options?.variables);
    };
  }, [subscriptionHash, options?.skip]);

  return useReactiveVar(subVar);
};

export default useDeduplicatedSubscription;
