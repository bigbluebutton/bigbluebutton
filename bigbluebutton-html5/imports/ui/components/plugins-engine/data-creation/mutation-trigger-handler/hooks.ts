/* eslint-disable @typescript-eslint/no-explicit-any */
import { MutationResult } from '@apollo/client';
import { useState, useEffect } from 'react';
import { isEqual } from 'radash';
import { DataCreationHookEnums } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-creation/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { MutationResultObject } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-creation/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import projectMutationResult from './utils';

/**
 * This hook sends the projected mutation result back to the plugin.
 * It observes only the relevant part of the GraphQL result and forwards
 * it when changes occur, avoiding unnecessary data
 *
 * @param resultFromGraphql result of the useMutation from graphql with lots of information
 * @param mutation mutation used to create the trigger function
 * @param options options sent to customize the mutation
 */
const useUpdateMutationResultForPlugin = (
  resultFromGraphql: MutationResult<any>, mutation: string, options?: object,
) => {
  const projection = projectMutationResult(resultFromGraphql);
  const [projectionResult, setProjectionResult] = useState(projection);

  useEffect(() => {
    setProjectionResult((prev) => {
      if (!isEqual(prev, projection)) return projection;
      return prev;
    });
  }, [resultFromGraphql]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<MutationResultObject>>(HookEvents.BBB_CORE_UPDATED_STATE, {
        detail: {
          hook: DataCreationHookEnums.MUTATION_RESULT_SENT,
          hookArguments: {
            mutation,
            options,
          },
          data: projectionResult,
        },
      }),
    );
  }, [projectionResult]);
};

export default useUpdateMutationResultForPlugin;
