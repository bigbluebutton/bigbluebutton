import { useEffect, useMemo } from 'react';
import GrahqlSubscriptionStore, { stringToHash } from '/imports/ui/core/singletons/subscriptionStore';
import { DocumentNode, TypedQueryDocumentNode } from 'graphql';
import { useReactiveVar } from '@apollo/client';

const useDeduplicatedSubscription = <T>(
  subscription: DocumentNode | TypedQueryDocumentNode,
  variables?: Record<string, unknown>,
) => {
  const subscriptionHash = stringToHash(JSON.stringify({ subscription, variables }));

  useEffect(() => {
    return () => {
      GrahqlSubscriptionStore.unsubscribe(subscription, variables);
    };
  }, []);

  const sub = useMemo(() => {
    return GrahqlSubscriptionStore.makeSubscription<T>(subscription, variables);
  }, [subscriptionHash]);
  return useReactiveVar(sub);
};

export default useDeduplicatedSubscription;
