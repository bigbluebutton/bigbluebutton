import * as React from 'react';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import {
  GraphqlResponseWrapper, HookEventWrapper,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { useEffect, useState } from 'react';
import { MutationSubscriptionObject } from './types';
import MutationTriggerHandler from './mutation-trigger-handler/handler';
import { mutationSubscriptionHelper } from './utils';

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
    Object.entries(mutationSubscriptionCountObject).map(
      ([key, subscriptionCount]) => subscriptionCount.count > 0 && (
      <MutationTriggerHandler
        key={key}
        mutation={subscriptionCount.mutation}
        options={subscriptionCount.options}
        count={subscriptionCount.count}
      />
      ),
    )
  );
};

export default PluginDataCreationManager;
