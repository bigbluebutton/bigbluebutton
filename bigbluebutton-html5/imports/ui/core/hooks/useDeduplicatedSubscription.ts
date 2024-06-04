import { useEffect, useMemo } from 'react';
import GrahqlSubscriptionStore, { stringToHash } from '/imports/ui/core/singletons/subscriptionStore';
import { DocumentNode, TypedQueryDocumentNode } from 'graphql';
import { OperationVariables, SubscriptionHookOptions, useReactiveVar } from '@apollo/client';
// same as useSubscription type
//  eslint-disable-next-line @typescript-eslint/no-explicit-any
const useDeduplicatedSubscription = <T = any>(
  subscription: DocumentNode | TypedQueryDocumentNode,
  options?: SubscriptionHookOptions<NoInfer<T>, NoInfer<OperationVariables>>,
) => {
  const subscriptionHash = stringToHash(JSON.stringify({ subscription, variables: options?.variables }));

  useEffect(() => {
    return () => {
      GrahqlSubscriptionStore.unsubscribe(subscription, options?.variables);
    };
  }, []);

  const sub = useMemo(() => {
    return GrahqlSubscriptionStore.makeSubscription<T>(subscription, options?.variables);
  }, [subscriptionHash]);
  return useReactiveVar(sub);
};

export default useDeduplicatedSubscription;
