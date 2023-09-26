import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { useSubscription, gql } from '@apollo/client';
import logger from '/imports/startup/client/logger';

import { ParameterizedHookContainerProps } from '../types';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomSubscriptionHookContainer = (props: ParameterizedHookContainerProps) => {
  const { queryFromPlugin } = props;

  const [sendSignal, setSendSignal] = useState(false);

  let customSubscription: any;
  try {
    const subscriptionResult = useSubscription(gql`${queryFromPlugin}`);
    customSubscription = subscriptionResult?.data;
  } catch (err) {
    logger.error(
      `Error while querying custom subscriptions for plugins (query: ${queryFromPlugin}) (Error: ${err})`,
    );
    customSubscription = 'Error';
  }

  const updatePresentationForPlugin = () => {
    window.dispatchEvent(
      new CustomEvent(
        PluginSdk.Internal.BbbHookEvents.Update,
        {
          detail: {
            data: customSubscription,
            hook: PluginSdk.Internal.BbbHooks.UseCustomSubscription,
            parameter: queryFromPlugin,
          },
        },
      ),
    );
  };

  useEffect(() => {
    updatePresentationForPlugin();
  }, [customSubscription, sendSignal]);

  useEffect(() => {
    const updateHookUseCustomSubscription = (() => {
      setSendSignal((previous) => !previous);
    }) as EventListener;
    window.addEventListener(
      PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseCustomSubscription,
    );
    return () => {
      window.removeEventListener(
        PluginSdk.Internal.BbbHookEvents.Subscribe, updateHookUseCustomSubscription,
      );
    };
  }, []);

  return null;
};

export default CustomSubscriptionHookContainer;
