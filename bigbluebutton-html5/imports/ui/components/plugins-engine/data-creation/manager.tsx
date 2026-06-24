import * as React from 'react';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import {
  GraphqlResponseWrapper, HookEventWrapper,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { useEffect, useState } from 'react';
import { makeCustomHookIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/utils';
import { MutationSubscriptionObject } from './types';
import MutationTriggerHandler from './mutation-trigger-handler/handler';
import { mutationSubscriptionHelper } from './utils';
import ErrorBoundary from '../../common/error-boundary/component';

const ERROR_MESSAGE_ON_MUTATION_CREATION = 'Possible error while creating mutation for plugin';

const ERROR_METADATA_ON_MUTATION_CREATION = {
  logCode: 'plugin_custom_mutation_creation_error',
  logMessage: ERROR_MESSAGE_ON_MUTATION_CREATION,
};

const PluginDataCreationManager: React.FC = () => {
  const [
    mutationSubscriptionCountObject,
    setMutationSubscriptionCountObject,
  ] = useState<MutationSubscriptionObject>({});

  const handleMutationReceivedEvent: EventListener = (
    (event: HookEventWrapper<GraphqlResponseWrapper<void>>) => {
      mutationSubscriptionHelper(
        event, setMutationSubscriptionCountObject, 1,
      );
    }) as EventListener;

  const handleMutationUnsubscribedEvent: EventListener = (
    (event: HookEventWrapper<GraphqlResponseWrapper<void>>) => {
      mutationSubscriptionHelper(
        event, setMutationSubscriptionCountObject, -1,
      );
    }) as EventListener;

  // Handling mutation creation and destruction;
  useEffect(() => {
    window.addEventListener(
      HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE,
      handleMutationReceivedEvent,
    );
    window.addEventListener(
      HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE,
      handleMutationUnsubscribedEvent,
    );
    return () => {
      window.removeEventListener(
        HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE,
        handleMutationReceivedEvent,
      );
      window.removeEventListener(
        HookEvents.PLUGIN_UNSUBSCRIBED_FROM_BBB_CORE,
        handleMutationUnsubscribedEvent,
      );
    };
  }, []);
  return (
    Object.entries(mutationSubscriptionCountObject)
      .filter(([, subscriptionCount]) => subscriptionCount.count > 0)
      .map(([key, subscriptionCount]) => (
        <ErrorBoundary
          key={key}
          Fallback={() => {
            setMutationSubscriptionCountObject((currentState) => {
              const mutationIdentifier = makeCustomHookIdentifier(
                subscriptionCount.mutation, subscriptionCount.options,
              );
              const newMutationCountObject = { ...currentState };
              // Delete problematic entry from object
              if (newMutationCountObject[mutationIdentifier]) delete newMutationCountObject[mutationIdentifier];
              return newMutationCountObject;
            });
          }}
          logMetadata={ERROR_METADATA_ON_MUTATION_CREATION}
          errorMessage={ERROR_MESSAGE_ON_MUTATION_CREATION}
          errorInfo={
            {
              mutationData: {
                mutation: subscriptionCount.mutation,
                options: subscriptionCount.options,
              },
            }
          }
        >
          <MutationTriggerHandler
            mutation={subscriptionCount.mutation}
            options={subscriptionCount.options}
            count={subscriptionCount.count}
          />
        </ErrorBoundary>
      ))
  );
};

export default PluginDataCreationManager;
