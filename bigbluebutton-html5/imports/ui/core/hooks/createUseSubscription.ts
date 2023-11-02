import { TypedQueryDocumentNode, DocumentNode } from 'graphql';
import { useRef, useState, useEffect } from 'react';

import { gql, useApolloClient } from '@apollo/client';
import R from 'ramda';
import { applyPatch } from 'fast-json-patch';

function createUseSubscription<T>(
  query: DocumentNode | TypedQueryDocumentNode,
  usePatchedSubscription = false,
  variables = {},
) {
  return function useGeneratedUseSubscription(projectionFunction: (element: Partial<T>) => void): Array<Partial<T>> {
    const client = useApolloClient();
    const [projectedData, setProjectedData] = useState<Array<T>>([]);
    const oldProjectionOfDataRef = useRef<Array<T>>([]);
    const dataRef = useRef<Array<T>>([]);

    let newSubscriptionGQL = query;
    if (usePatchedSubscription) {
      if (!query) {
        throw new Error('Error: query is not defined');
      }

      // Check if the loc property is defined
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
          variables,
          fetchPolicy: usePatchedSubscription ? 'no-cache' : undefined,
        })
        .subscribe({
          next({ data }) {
            let currentData = [];
            if (usePatchedSubscription && data.patch) {
              const patchedData = applyPatch(dataRef.current, data.patch).newDocument;
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
              oldProjectionOfDataRef.current = newProjectionOfData;
              setProjectedData(newProjectionOfData);
            }
          },
          error(err) {
            // eslint-disable-next-line no-console
            console.error('err', err);
          },
        });
      return () => apolloSubscription.unsubscribe();
    }, []);

    return projectedData;
  };
}
export default createUseSubscription;
