import {
  FetchPolicy,
  ObservableSubscription,
  ReactiveVar,
  makeVar,
} from '@apollo/client';
import { applyPatch, deepClone } from 'fast-json-patch';
import { DocumentNode, TypedQueryDocumentNode } from 'graphql';
import apolloContextHolder from '../graphql/apolloContextHolder/apolloContextHolder';

export interface SubscriptionStructure<T> {
  count: number;
  data: T | null;
  error: Error | null;
  loading: boolean;
  sub: ObservableSubscription | null;
}
// This code was extracted from a geeksforgeeks article
// https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/
export function stringToHash(string: string) {
  return string.split('').reduce((hash, char) => {
    // It's a intended bitwise operation
    // eslint-disable-next-line no-bitwise
    return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
  }, 0).toString();
}

class GrahqlSubscriptionStore {
  // @ts-ignore
  private graphqlSubscriptions: { [key: string]: ReactiveVar<SubscriptionStructure> } = {};

  makeSubscription<T>(
    subscription: DocumentNode | TypedQueryDocumentNode,
    variables?: Record<string, unknown>,
    fetchPolicy?: FetchPolicy,
  ): ReactiveVar<SubscriptionStructure<T>> {
    const subscriptionHash = stringToHash(JSON.stringify({ subscription, variables }));
    const subscriptionStored = this.graphqlSubscriptions[subscriptionHash];
    if (subscriptionStored) {
      const subStored = subscriptionStored();
      subscriptionStored({
        ...subStored,
        count: (subStored.count || 1) + 1,
      });
      window.dispatchEvent(new CustomEvent('graphqlSubscription', { detail: { subscriptionHash, type: 'next', response: subscriptionStored() } }));
      return subscriptionStored;
    }

    const newSubStructure = makeVar<SubscriptionStructure<T>>({
      count: 0,
      data: null,
      error: null,
      loading: true,
      sub: null,
    });
    const apolloClient = apolloContextHolder.getClient();

    const sub = apolloClient.subscribe({
      query: subscription,
      variables,
      fetchPolicy: fetchPolicy || 'no-cache',
    }).subscribe({
      next: (data) => {
        const values = newSubStructure();
        values.loading = false;

        if (data.data.patch) {
          // @ts-ignore
          const accessKey = Object.keys(values.data)[0];
          // @ts-ignore
          const patchedData = applyPatch(deepClone(values.data[accessKey]), data.data.patch).newDocument;
          values.data = {
            [accessKey]: patchedData,
          } as T;
        } else {
          values.data = data.data;
        }
        newSubStructure({ ...values });

        window.dispatchEvent(new CustomEvent('graphqlSubscription', { detail: { subscriptionHash, type: 'next', response: values } }));
      },
      error: (error) => {
        const values = newSubStructure();
        values.error = error;
        values.loading = false;
        newSubStructure(values);
        window.dispatchEvent(new CustomEvent('graphqlSubscription', { detail: { subscriptionHash, type: 'error', error } }));
      },
    });

    const subValues = newSubStructure();
    subValues.sub = sub;
    subValues.count = 1;
    newSubStructure(subValues);
    this.graphqlSubscriptions[subscriptionHash] = newSubStructure;

    return newSubStructure;
  }

  unsubscribe(subscription: DocumentNode | TypedQueryDocumentNode, variables?: Record<string, unknown>) {
    const subscriptionHash = stringToHash(JSON.stringify({ subscription, variables }));
    const subscriptionStored = this.graphqlSubscriptions[subscriptionHash];
    if (!subscriptionStored) {
      return;
    }

    subscriptionStored({
      ...subscriptionStored(),
      count: subscriptionStored().count - 1,
    });

    if (subscriptionStored().count === 0) {
      subscriptionStored()?.sub?.unsubscribe();
      delete this.graphqlSubscriptions[subscriptionHash];
    }
  }
}

export default new GrahqlSubscriptionStore();
