import { DocumentNode, TypedQueryDocumentNode } from 'graphql';
import {
  useRef, useState, useEffect, useMemo,
} from 'react';
import { gql, useApolloClient } from '@apollo/client';
import R from 'ramda';
import { applyPatch, deepClone } from 'fast-json-patch';
import { GraphqlDataHookSubscriptionResponse } from '../../Types/hook';

function createUseSubscription<T>(
  query: DocumentNode | TypedQueryDocumentNode,
  queryVariables = {},
  usePatchedSubscription = false,
) {
  return function useGeneratedUseSubscription(
    projectionFunction: (element: Partial<T>) => Partial<T> = (element) => element,
  ): GraphqlDataHookSubscriptionResponse<Array<Partial<T>>> {
    const client = useApolloClient();
    const [
      projectedData,
      setProjectedData,
    ] = useState<GraphqlDataHookSubscriptionResponse<Partial<T>[]>>({ loading: true });
    const oldProjectionOfDataRef = useRef<Partial<T>[]>([]);
    const dataRef = useRef<Array<T>>([]);
    let newSubscriptionGQL = query;
    if (usePatchedSubscription) {
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
      newSubscriptionGQL = gql`${newQueryString}`;
    }

    useEffect(() => {
      const apolloSubscription = client
        .subscribe({
          query: newSubscriptionGQL,
          variables: queryVariables,
          fetchPolicy: usePatchedSubscription ? 'no-cache' : undefined,
        })
        .subscribe({
          next(response) {
            const { data } = response;
            let currentData: T[] = [];
            if (usePatchedSubscription && data.patch) {
              const patchedData = applyPatch(deepClone(dataRef.current), data.patch).newDocument;
              currentData = [...patchedData];
            } else {
              const resultSetKey = Object.keys(data)[0];
              currentData = data[resultSetKey];
            }
            if (usePatchedSubscription) {
              dataRef.current = currentData;
            }

            const newProjectionOfData = currentData.map((element: Partial<T>) => projectionFunction(element));
            if (!R.equals(oldProjectionOfDataRef.current, newProjectionOfData)) {
              const loading = response.data === undefined && response.errors === undefined;
              const objectFromProjectionToSave: GraphqlDataHookSubscriptionResponse<Partial<T>[]> = {
                ...response,
                loading,
              };
              objectFromProjectionToSave.data = newProjectionOfData;
              oldProjectionOfDataRef.current = newProjectionOfData;
              setProjectedData(objectFromProjectionToSave);
            }
          },
          error(err) {
            // eslint-disable-next-line no-console
            console.error('err', err);
          },
        });
      return () => apolloSubscription.unsubscribe();
    }, [queryVariables]);

    return projectedData;
  };
}

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
