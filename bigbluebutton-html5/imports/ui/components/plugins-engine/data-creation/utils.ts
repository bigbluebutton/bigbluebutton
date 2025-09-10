import { GraphqlResponseWrapper, HookEventWrapper, SubscribedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { DataCreationHookEnums } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-creation/enums';
import { UseCustomMutationArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-creation/types';
import { makeCustomHookIdentifier } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/utils';
import { MutationSubscriptionObject } from './types';

const updateCountState = (
  mutationObject: MutationSubscriptionObject, delta: number,
  mutation: string, options?: object,
) => {
  const mutationIdentifier = makeCustomHookIdentifier(mutation, options);
  const newMutationCountObject = { ...mutationObject };
  newMutationCountObject[mutationIdentifier] = {
    count: (mutationObject[mutationIdentifier]?.count || 0) + delta,
    options: options ? { ...options } : options,
    mutation,
  };
  return newMutationCountObject;
};

const mutationSubscriptionHelper = (
  event: HookEventWrapper<GraphqlResponseWrapper<void>>,
  setMutationSubscriptionCountObject: React.Dispatch<React.SetStateAction<MutationSubscriptionObject>>,
  delta: number,
) => {
  const {
    hook,
    hookArguments,
  } = event.detail as SubscribedEventDetails;
  const {
    mutation,
    options,
  } = (hookArguments || { mutation: null, options: null }) as UseCustomMutationArguments;
  if (hook === DataCreationHookEnums.CREATE_NEW_CUSTOM_MUTATION) {
    setMutationSubscriptionCountObject((currentState) => updateCountState(
      currentState, delta, mutation, options,
    ));
  }
};

export { mutationSubscriptionHelper, updateCountState };
