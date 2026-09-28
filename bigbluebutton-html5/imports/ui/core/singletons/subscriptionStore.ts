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

export interface SubscriptionEventDetail {
  subscriptionHash: string;
  type: 'next' | 'error';
  response?: SubscriptionStructure<unknown>;
  error?: Error;
}

export type SubscriptionListener = (detail: SubscriptionEventDetail) => void;

// Report a throwing listener as the DOM reports a throwing event listener: at
// once, to window 'error' listeners and the console, without stopping the rest
// or reaching Apollo. Without reportError, a throw inside a DOM dispatch does it.
function callListener(listener: SubscriptionListener, detail: SubscriptionEventDetail) {
  try {
    listener(detail);
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error);
    } else {
      const reporter = new EventTarget();
      reporter.addEventListener('error', () => { throw error; });
      reporter.dispatchEvent(new Event('error'));
    }
  }
}

// This code was extracted from a geeksforgeeks article
// https://www.geeksforgeeks.org/how-to-create-hash-from-string-in-javascript/
function stringToHash(string: string) {
  let hash = 0;
  for (let i = 0; i < string.length; i += 1) {
    // It's a intended bitwise operation
    // eslint-disable-next-line no-bitwise
    hash = string.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
  }
  return hash.toString();
}

const subscriptionHashes = new WeakMap<DocumentNode | TypedQueryDocumentNode, Map<string, string>>();

// Serializing and hashing a query document costs milliseconds, and hooks ask for
// the key on every render. The key is cached per document object and variables:
// documents are module constants or gql results, which graphql-tag caches by
// source. Variable-driven subscriptions (user list pages, searches) add one small
// entry per distinct variables value for the session.
export function getSubscriptionHash(
  subscription: DocumentNode | TypedQueryDocumentNode,
  variables?: Record<string, unknown>,
) {
  let byVariables = subscriptionHashes.get(subscription);
  if (!byVariables) {
    byVariables = new Map();
    subscriptionHashes.set(subscription, byVariables);
  }
  const variablesKey = variables === undefined ? '' : JSON.stringify(variables);
  let hash = byVariables.get(variablesKey);
  if (hash === undefined) {
    hash = stringToHash(JSON.stringify({ subscription, variables }));
    byVariables.set(variablesKey, hash);
  }
  return hash;
}

class GrahqlSubscriptionStore {
  // @ts-ignore
  private graphqlSubscriptions: { [key: string]: ReactiveVar<SubscriptionStructure> } = {};

  // Hooks listen here, per hash, so a frame runs only the hooks of its query.
  private listeners = new Map<string, Set<SubscriptionListener>>();

  // Hashes whose entry an error, or a next that threw, changed in place
  // without publishing; the mark stays until a next publishes the entry.
  private unpublished = new Set<string>();

  makeSubscription<T>(
    subscription: DocumentNode | TypedQueryDocumentNode,
    variables?: Record<string, unknown>,
    fetchPolicy?: FetchPolicy,
    listener?: SubscriptionListener,
  ): ReactiveVar<SubscriptionStructure<T>> {
    const subscriptionHash = getSubscriptionHash(subscription, variables);
    if (listener) {
      const hashListeners = this.listeners.get(subscriptionHash);
      if (hashListeners) {
        hashListeners.add(listener);
      } else {
        this.listeners.set(subscriptionHash, new Set([listener]));
      }
    }
    const subscriptionStored = this.graphqlSubscriptions[subscriptionHash];
    if (subscriptionStored) {
      const subStored = subscriptionStored();
      this.setCount(subscriptionHash, subscriptionStored, (subStored.count || 1) + 1);
      const detail: SubscriptionEventDetail = { subscriptionHash, type: 'next', response: subscriptionStored() };
      // Once the entry holds data, every hook of the hash already has it, so only
      // the mounting one gets it here. Until then the others can be out of step,
      // as an error ends the entry's loading without a 'next'; this realigns them.
      if (subStored.data === null) {
        this.notifyListeners(detail);
      } else if (listener) {
        callListener(listener, detail);
      }
      window.dispatchEvent(new CustomEvent('graphqlSubscription', { detail }));
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
        this.unpublished.add(subscriptionHash);
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
        this.unpublished.delete(subscriptionHash);

        this.dispatch({ subscriptionHash, type: 'next', response: values });
      },
      error: (error) => {
        this.unpublished.add(subscriptionHash);
        const values = newSubStructure();
        values.error = error;
        values.loading = false;
        newSubStructure(values);
        this.dispatch({ subscriptionHash, type: 'error', error });
      },
    });

    const subValues = newSubStructure();
    subValues.sub = sub;
    subValues.count = 1;
    newSubStructure(subValues);
    this.graphqlSubscriptions[subscriptionHash] = newSubStructure;

    return newSubStructure;
  }

  removeListener(subscriptionHash: string, listener: SubscriptionListener) {
    const hashListeners = this.listeners.get(subscriptionHash);
    if (hashListeners?.delete(listener) && hashListeners.size === 0) {
      this.listeners.delete(subscriptionHash);
    }
  }

  unsubscribe(subscription: DocumentNode | TypedQueryDocumentNode, variables?: Record<string, unknown>) {
    const subscriptionHash = getSubscriptionHash(subscription, variables);
    const subscriptionStored = this.graphqlSubscriptions[subscriptionHash];
    if (!subscriptionStored) {
      return;
    }

    this.setCount(subscriptionHash, subscriptionStored, subscriptionStored().count - 1);

    if (subscriptionStored().count === 0) {
      subscriptionStored()?.sub?.unsubscribe();
      delete this.graphqlSubscriptions[subscriptionHash];
      this.unpublished.delete(subscriptionHash);
    }
  }

  // No consumer renders the count, and publishing it would re-render every
  // consumer of the hash, so it is written in place. A marked entry is still
  // republished: a consumer that does not re-render otherwise shows the
  // in-place change only through a publish.
  private setCount(
    subscriptionHash: string,
    subscriptionStored: ReactiveVar<SubscriptionStructure<unknown>>,
    count: number,
  ) {
    const subStored = subscriptionStored();
    if (this.unpublished.has(subscriptionHash)) {
      subscriptionStored({ ...subStored, count });
    } else {
      subStored.count = count;
    }
  }

  private notifyListeners(detail: SubscriptionEventDetail) {
    const hashListeners = this.listeners.get(detail.subscriptionHash);
    if (!hashListeners) return;
    // Over a copy, as a DOM dispatch does: a listener added meanwhile waits for
    // the next event, and one removed meanwhile is skipped.
    Array.from(hashListeners).forEach((listener) => {
      if (hashListeners.has(listener)) callListener(listener, detail);
    });
  }

  private dispatch(detail: SubscriptionEventDetail) {
    this.notifyListeners(detail);
    // Listeners outside the hooks, such as services, get every event here.
    window.dispatchEvent(new CustomEvent('graphqlSubscription', { detail }));
  }
}

export default new GrahqlSubscriptionStore();
