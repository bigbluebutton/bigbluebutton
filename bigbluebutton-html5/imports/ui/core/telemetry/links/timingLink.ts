import {
  ApolloLink,
  FetchResult,
  Observable,
  Operation,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { recordMutationAction } from '../actionTrail';
import { isTelemetryActive } from '../config';
import { recordTelemetry } from '../recorder';
import { GraphqlOperationType, GraphqlPhase } from '../types';

const operationTypeOf = (operation: Operation): GraphqlOperationType => {
  const definition = getMainDefinition(operation.query);
  return definition.kind === 'OperationDefinition' ? definition.operation : 'query';
};

// Outermost link: measures what the client feels, from the request to the answer.
// query/mutation: request -> complete (round-trip). subscription: subscribe -> first result.
// Payload sizes are left to the middleware histograms; stringifying every result would cost more
// than the measurement is worth.
const timingLink = new ApolloLink((operation, forward) => {
  if (!isTelemetryActive()) return forward(operation);

  const operationType = operationTypeOf(operation);
  const operationName = operation.operationName || 'anonymous';
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
  });

  return new Observable<FetchResult>((observer) => {
    let receivedData = false;
    let failed = false;

    const subscription = forward(operation).subscribe({
      next: (result) => {
        const hasErrors = Boolean(result.errors?.length);
        if (operationType === 'subscription' && !receivedData) emit('first-data', hasErrors);
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
