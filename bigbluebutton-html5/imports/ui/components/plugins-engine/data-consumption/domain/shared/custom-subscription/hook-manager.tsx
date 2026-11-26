import { useEffect } from 'react';
import { gql } from '@apollo/client';
import { CustomSubscriptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-subscription/types';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { SubscriptionHookWithArgumentsContainerProps } from './types';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { markPluginOperation } from '/imports/ui/core/telemetry/plugins';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomSubscriptionHookContainer = (props: SubscriptionHookWithArgumentsContainerProps) => {
  const { hookArguments, version } = props;
  const { query: queryFromPlugin, variables } = hookArguments;
  const previousVersion = usePreviousValue(version);

  const subscriptionDocument = gql`${queryFromPlugin}`;
  // Before the subscription starts, so the timing link already sees it as plugin traffic
  markPluginOperation(subscriptionDocument);
  const customSubscriptionData = useDeduplicatedSubscription(subscriptionDocument, {
    variables,
  });

  const updateCustomSubscriptionForPlugin = () => {
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<any>>(
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: customSubscriptionData,
            hook: DataConsumptionHooks.CUSTOM_SUBSCRIPTION,
            hookArguments: {
              query: queryFromPlugin,
              variables,
            } as CustomSubscriptionArguments,
          } as UpdatedEventDetails<any>,
        },
      ),
    );
  };

  useEffect(() => {
    updateCustomSubscriptionForPlugin();
  }, [customSubscriptionData]);
  useEffect(() => {
    const previousVersionValue = previousVersion ?? 0;
    if (version > previousVersionValue) {
      updateCustomSubscriptionForPlugin();
    }
  }, [version]);

  return null;
};

export default CustomSubscriptionHookContainer;
