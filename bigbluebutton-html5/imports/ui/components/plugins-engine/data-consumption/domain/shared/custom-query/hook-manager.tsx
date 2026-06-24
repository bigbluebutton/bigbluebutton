import { useEffect } from 'react';
import {
  gql,
  useQuery,
} from '@apollo/client';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { QueryHookWithArgumentsContainerProps } from './types';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CustomQueryHookContainer = (props: QueryHookWithArgumentsContainerProps) => {
  const { hookArguments, resolveQuery } = props;
  const { query: queryFromPlugin, variables } = hookArguments;

  const customQueryData = useQuery(gql`${queryFromPlugin}`, {
    variables,
  });
  const updateCustomQueryForPlugin = () => {
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<any>>(
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: customQueryData,
            hook: DataConsumptionHooks.CUSTOM_QUERY,
            hookArguments: {
              query: queryFromPlugin,
              variables,
            },
          } as UpdatedEventDetails<any>,
        },
      ),
    );
  };

  useEffect(() => {
    updateCustomQueryForPlugin();
    if (!customQueryData.loading) {
      resolveQuery();
    }
  }, [customQueryData]);

  return null;
};

export default CustomQueryHookContainer;
