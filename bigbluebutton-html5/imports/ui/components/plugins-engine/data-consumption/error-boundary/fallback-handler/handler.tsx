/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { CustomSubscriptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-subscription/types';
import { CustomQueryArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/custom-query/types';
import { DataConsumptionFallbackHandlerProps } from './types';
import { deleteDataConsumptionHookEntry } from '../../utils';

const FallbackHandler: React.FC<DataConsumptionFallbackHandlerProps> = (props: DataConsumptionFallbackHandlerProps) => {
  const {
    hook, errorInformation, setDataConsumptionHookWithArgumentUtilizationCount,
  } = props;
  const customSubscriptionData = {
    data: null,
    error: errorInformation,
    loading: false,
  };

  const updateCustomSubscriptionForPlugin = () => {
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<any>>(
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: customSubscriptionData,
            hook,
            hookArguments: {
              query: errorInformation.dataConsumptionInformation.query,
              variables: errorInformation.dataConsumptionInformation.variables,
            } as CustomSubscriptionArguments | CustomQueryArguments,
          } as UpdatedEventDetails<any>,
        },
      ),
    );
  };

  React.useEffect(() => {
    const hookArguments = {
      query: errorInformation.dataConsumptionInformation.query,
      variables: errorInformation.dataConsumptionInformation.variables,
    };
    updateCustomSubscriptionForPlugin();
    deleteDataConsumptionHookEntry(
      setDataConsumptionHookWithArgumentUtilizationCount,
      hook, hookArguments,
    );
  }, []);
  return null;
};

export default FallbackHandler;
