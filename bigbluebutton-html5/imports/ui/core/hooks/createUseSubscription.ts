import { DocumentNode, TypedQueryDocumentNode } from 'graphql';
import {
  useRef, useState, useEffect, useMemo,
} from 'react';
import { FetchResult, gql, useApolloClient } from '@apollo/client';
import * as R from 'ramda';
import { applyPatch, deepClone } from 'fast-json-patch';
import { GraphqlDataHookSubscriptionResponse } from '../../Types/hook';
import useDeepComparison from '../../hooks/useDeepComparison';
import GrahqlSubscriptionStore, { stringToHash } from '../singletons/subscriptionStore';

export const makePatchedQuery = (query: DocumentNode | TypedQueryDocumentNode) => {
  if (!query) {
    throw new Error('Error: query is not defined');
  }

  if (!query.loc) {
    throw new Error('Error: query.loc is not defined');
  }

  // Prepend `Patched_` to the query operationName to inform the middleware that this subscription support jsonPatch
  // It will also set {fetchPolicy: 'no-cache'} because the cache would not work properly when using json-patch
  const regexSubscriptionOperationName = /subscription\s+([^{]*)\{/g;
  if (!regexSubscriptionOperationName.exec(query.loc.source.body)) {
    throw new Error('Error prepending Patched_ to subscription name - check the provided gql');
  }

  const newQueryString = query.loc.source.body.replace(regexSubscriptionOperationName, 'subscription Patched_$1 {');
  return gql`${newQueryString}`;
};

function createUseSubscription<T>(
  query: DocumentNode | TypedQueryDocumentNode,
  queryVariables = {},
  usePatchedSubscription = false,
) {
  let newSubscriptionGQL = query;
  if (usePatchedSubscription) {
    newSubscriptionGQL = makePatchedQuery(query);
  }
  const queryHash = stringToHash(JSON.stringify({ subscription: newSubscriptionGQL, variables: queryVariables }));
  return function useGeneratedUseSubscription(
    projectionFunction: (element: Partial<T>) => Partial<T> = (element) => element,
  ): GraphqlDataHookSubscriptionResponse<Array<Partial<T>>> {
    const subscriptionHashRef = useRef<string>('');
    const subscriptionRef = useRef <DocumentNode | TypedQueryDocumentNode | null>(null);
    const optionsRef = useRef({});
    const subHash = stringToHash(
      JSON.stringify({ subscription: newSubscriptionGQL, variables: queryVariables }),
    );

    useEffect(() => {
      if (subscriptionHashRef.current !== subHash) {
        subscriptionHashRef.current = subHash;
        if (subscriptionRef.current && optionsRef.current) {
          GrahqlSubscriptionStore.unsubscribe(subscriptionRef.current, queryVariables);
        }

        subscriptionRef.current = query;
        optionsRef.current = queryVariables;
      }
    }, [subHash]);

    useEffect(() => {
      return () => {
        GrahqlSubscriptionStore.unsubscribe(newSubscriptionGQL, queryVariables);
      };
    }, []);

    const observer = useRef({
      //  @ts-ignore
      next(response) {
        const { data, loading } = response;

        const hasLoadingChange = oldLoadingRef.current !== loading;
        if (!data && !hasLoadingChange) {
          return;
        }
        let hasResponseChanged = false;
        let objectFromProjectionToSave: GraphqlDataHookSubscriptionResponse<Partial<T>[]> = {
          data: oldProjectionOfDataRef.current,
          loading: oldLoadingRef.current,
        };
        if (data) {
          const resultSetKey = Object.keys(data)[0];
          const newProjectionOfData = data[resultSetKey].map((element: Partial<T>) => projectionFunction(element));
          if (!R.equals(oldProjectionOfDataRef.current, newProjectionOfData) || oldLoadingRef.current !== loading) {
            hasResponseChanged = true;
            objectFromProjectionToSave = {
              ...response,
              loading,
            };
            objectFromProjectionToSave.data = newProjectionOfData;
            oldProjectionOfDataRef.current = newProjectionOfData;
          }
        }
        if (hasLoadingChange) {
          hasResponseChanged = true;
          objectFromProjectionToSave.loading = loading;
          oldLoadingRef.current = loading;
        }

        if (hasResponseChanged) {
          setProjectedData(objectFromProjectionToSave);
        }
      },
      //  @ts-ignore
      error(err) {
        // eslint-disable-next-line no-console
        console.error('err', err);
      },
    });
    const [
      projectedData,
      setProjectedData,
    ] = useState<GraphqlDataHookSubscriptionResponse<Partial<T>[]>>({ loading: true });
    const oldProjectionOfDataRef = useRef<Partial<T>[]>([]);
    const oldLoadingRef = useRef<boolean>(true);

    useEffect(() => {
      const listener = (event: CustomEvent) => {
        if (event.detail.subscriptionHash === subHash) {
          //  @ts-ignore
          observer.current[event.detail.type](event.detail.response);
        }
      };
      //  @ts-ignore
      window.addEventListener('graphqlSubscription', listener);
      GrahqlSubscriptionStore.makeSubscription(newSubscriptionGQL, queryVariables, usePatchedSubscription ? 'no-cache' : undefined);
      return () => {
        //  @ts-ignore
        // window.removeEventListener('graphqlSubscription', listener);
      };
    }, [queryHash]);

    return projectedData;
  };
}

export const useSubscription = <T>(
  query: DocumentNode | TypedQueryDocumentNode,
  variables: Record<string, unknown> = {},
  patched = false,
  projection?: (element: Partial<T>) => Partial<T>,
) => {
  const client = useApolloClient();
  const subscriptionRef = useRef<{ unsubscribe(): void, closed: boolean }>();
  const oldDataToRetunRef = useRef<GraphqlDataHookSubscriptionResponse<Partial<T>[]>>();
  const dataRef = useRef<T[]>([]);
  const paramsDidChange = useDeepComparison(query, variables, patched);
  const [response, setResponse] = useState<FetchResult<unknown>>();
  let newSubscriptionGql = query;

  if (patched) {
    newSubscriptionGql = makePatchedQuery(query);
  }

  useEffect(() => {
    if (paramsDidChange) {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
      const observable = client.subscribe({
        query: newSubscriptionGql,
        variables,
        fetchPolicy: patched ? 'no-cache' : undefined,
      });
      const subscription = observable.subscribe({
        next(response) {
          setResponse(response);
        },
      });
      subscriptionRef.current = subscription;
    }
  });

  useEffect(() => () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
  }, []);

  if (!response) {
    return { loading: true };
  }

  const { data } = response;
  let currentData: T[] = [];

  if (
    patched
    && data
    && typeof data === 'object'
    && 'patch' in data
    && Array.isArray(data.patch)
  ) {
    currentData = applyPatch(deepClone(dataRef.current), data.patch).newDocument;
  } else if (
    data
    && typeof data === 'object'
  ) {
    const resultSetKey = Object.keys(data)[0];
    currentData = data[resultSetKey as keyof typeof data];
  }
  if (patched) {
    dataRef.current = currentData;
  }

  const newProjectionOfData = projection ? currentData.map(projection) : currentData;

  if (!oldDataToRetunRef.current || !R.equals(oldDataToRetunRef.current.data, newProjectionOfData)) {
    const loading = response.data === undefined && response.errors === undefined;
    const dataToReturn: GraphqlDataHookSubscriptionResponse<Partial<T>[]> = {
      ...response,
      loading,
      data: newProjectionOfData,
    };
    oldDataToRetunRef.current = dataToReturn;
    return dataToReturn;
  }

  return oldDataToRetunRef.current;
};

export const useCreateUseSubscription = <T>(
  query: DocumentNode | TypedQueryDocumentNode,
  queryVariables = {},
  usePatchedSubscription = false,
) => {
  const queryString = JSON.stringify(query);
  const queryVariablesString = JSON.stringify(queryVariables);

  const createdSubscription = useMemo(() => {
    return createUseSubscription<T>(query, queryVariables, usePatchedSubscription);
  },
  [queryString, queryVariablesString, usePatchedSubscription]);
  return createdSubscription;
};

export default createUseSubscription;
