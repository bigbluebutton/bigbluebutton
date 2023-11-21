import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { useSubscription, gql } from '@apollo/client';
import logger from '/imports/startup/client/logger';

import { HookWithArgumentsContainerProps } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomSubscriptionHookContainer = (props: HookWithArgumentsContainerProps) => {
  const { hookArguments } = props;
  const { query: queryFromPlugin, variables } = hookArguments;

  const [sendSignal, setSendSignal] = useState(false);

  let customSubscriptionData: any;
  try {
    const subscriptionResult = useSubscription(gql`${queryFromPlugin}`, {
      variables,
    });
    customSubscriptionData = subscriptionResult;
  } catch (err) {
    logger.error(
      `Error while querying custom subscriptions for plugins (query: ${queryFromPlugin}) (Error: ${err})`,
    );
    customSubscriptionData = 'Error';
  }

  const updatePresentationForPlugin = () => {
    window.dispatchEvent(
      new CustomEvent<PluginSdk.UpdatedEventDetails<any>>(
        PluginSdk.HookEvents.UPDATED,
        {
          detail: {
            data: customSubscriptionData,
            hook: PluginSdk.Hooks.CUSTOM_SUBSCRIPTION,
            hookArguments: {
              query: queryFromPlugin,
              variables,
            } as PluginSdk.CustomSubscriptionArguments,
          } as PluginSdk.UpdatedEventDetails<any>,
        },
      ),
    );
  };

  useEffect(() => {
    updatePresentationForPlugin();
  }, [customSubscriptionData, sendSignal]);

  useEffect(() => {
    const updateHookUseCustomSubscription = (() => {
      setSendSignal((previous) => !previous);
    }) as EventListener;
    window.addEventListener(
      PluginSdk.HookEvents.SUBSCRIBED, updateHookUseCustomSubscription,
    );
    return () => {
      window.removeEventListener(
        PluginSdk.HookEvents.SUBSCRIBED, updateHookUseCustomSubscription,
      );
    };
  }, []);

  return null;
};

export default CustomSubscriptionHookContainer;
