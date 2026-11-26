import {
  ApolloLink,
  FetchResult,
  Observable,
  Operation,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { recordMutationAction } from '../actionTrail';
import { isTelemetryActive } from '../config';
import { pluginOfOperation } from '../plugins';
import { recordTelemetry } from '../recorder';
import { GraphqlOperationType, GraphqlPhase } from '../types';

const operationTypeOf = (operation: Operation): GraphqlOperationType => {
  const definition = getMainDefinition(operation.query);
  return definition.kind === 'OperationDefinition' ? definition.operation : 'query';
};

// Hasura streaming subscriptions (<table>_stream fields, such as notification_stream) answer only when
// a new row arrives, so their time to first result measures how long nothing happened (up to 22 min in
// a real meeting), not how slow the server was. Their failures are still recorded.
const isStreamingSubscription = (operation: Operation): boolean => {
  const definition = getMainDefinition(operation.query);
  return definition.kind === 'OperationDefinition'
    && definition.selectionSet.selections.some((selection) => (
      selection.kind === 'Field' && selection.name.value.endsWith('_stream')
    ));
};

// Outermost link: measures what the client feels, from the request to the answer.
// query/mutation: request -> complete (round-trip). subscription: subscribe -> first result.
// Payload sizes are left to the middleware histograms; stringifying every result would cost more
// than the measurement is worth.
const timingLink = new ApolloLink((operation, forward) => {
  if (!isTelemetryActive()) return forward(operation);

  const operationType = operationTypeOf(operation);
  const timesFirstData = operationType === 'subscription' && !isStreamingSubscription(operation);
  const operationName = operation.operationName || 'anonymous';
  const plugin = pluginOfOperation(operationName, operation.getContext().telemetry?.plugin);
  const ts = Date.now();
  const start = performance.now();
  // The repro trail gets the operation name only, never the variables
  if (operationType === 'mutation') recordMutationAction(operationName);

  const emit = (phase: GraphqlPhase, failed: boolean) => recordTelemetry({
    kind: 'graphql',
    ts,
    duration: performance.now() - start,
    operationName,
    operationType,
    phase,
    failed,
    ...(plugin ? { plugin } : {}),
  });

  return new Observable<FetchResult>((observer) => {
    let receivedData = false;
    let failed = false;

    const subscription = forward(operation).subscribe({
      next: (result) => {
        const hasErrors = Boolean(result.errors?.length);
        if (timesFirstData && !receivedData) emit('first-data', hasErrors);
        receivedData = true;
        failed = failed || hasErrors;
        observer.next(result);
      },
      error: (error) => {
        if (operationType !== 'subscription') {
          emit('round-trip', true);
        } else if (!receivedData) {
          emit('first-data', true);
        }
        observer.error(error);
      },
      complete: () => {
        if (operationType !== 'subscription') emit('round-trip', failed);
        observer.complete();
      },
    });

    return () => subscription.unsubscribe();
  });
});

export default timingLink;
