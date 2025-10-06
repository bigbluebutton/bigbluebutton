import { gql, useMutation } from '@apollo/client';
import { useEffect } from 'react';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { DataCreationHookEnums } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-creation/enums';
import { MutationVariablesWrapper, UseCustomMutationArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-creation/types';
import logger from '/imports/startup/client/logger';
import { makeCustomHookIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/utils';
import { MutationTriggerHandlerProps } from './types';
import useUpdateMutationResultForPlugin from './hooks';

const MutationTriggerHandler: React.FC<MutationTriggerHandlerProps> = (props: MutationTriggerHandlerProps) => {
  const {
    mutation,
    options,
    count,
  } = props;
  const graphqlMutation = gql(mutation);
  const [mutate, result] = useMutation(graphqlMutation, options);

  useUpdateMutationResultForPlugin(result, mutation, options);

  const handleMutationTrigger = ((event: CustomEvent<UpdatedEventDetails<
      MutationVariablesWrapper<object>
    >>) => {
    const { hook, hookArguments, data } = event.detail;
    const {
      mutation: mutationReceived,
      options: optionsReceived,
    } = (hookArguments || { mutation: null, options: null }) as UseCustomMutationArguments;

    if (hook === DataCreationHookEnums.TRIGGER_MUTATION
      && makeCustomHookIdentifier(mutationReceived, optionsReceived)
          === makeCustomHookIdentifier(mutation, options)) {
      mutate(data).catch(() => {
        logger.error({
          logCode: 'plugin_custom_mutation_execution_error',
          extraInfo: {
            mutationData: {
              mutation,
              options,
              data,
            },
          },
        }, 'Error while executing mutation, ignoring...');
      });
    }
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(HookEvents.PLUGIN_SENT_CHANGES_TO_BBB_CORE, handleMutationTrigger);
    return () => {
      window.removeEventListener(HookEvents.PLUGIN_SENT_CHANGES_TO_BBB_CORE, handleMutationTrigger);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<void>>(HookEvents.BBB_CORE_UPDATED_STATE, {
        detail: {
          hook: DataCreationHookEnums.MUTATION_READY,
          hookArguments: {
            mutation,
            options,
          },
          data: undefined,
        },
      }),
    );
  }, [count]);
  return null;
};

export default MutationTriggerHandler;
