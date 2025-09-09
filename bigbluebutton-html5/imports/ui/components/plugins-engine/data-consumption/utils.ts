/* eslint-disable no-undef */
// Rule applied because EventListener is not undefined at all times.
import { DataConsumptionArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/shared/types';
import { makeCustomHookIdentifierFromArgs } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/utils';
import {
  DataConsumptionHooks,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { ObjectToCustomSubscriptionHookContainerMap } from './domain/shared/custom-subscription/types';
import { ObjectToCustomQueryHookContainerMap } from './domain/shared/custom-query/types';
import { ObjectToCustomHookContainerMap } from './types';
import { EssentialHookInformation } from './domain/shared/types';

const hookUsageSetStateCallback = (
  removeEntry: boolean, mapObj: Map<string, Map<string, ObjectToCustomHookContainerMap>>,
  hookName: string, delta: number, hookArguments?: DataConsumptionArguments,
) => {
  if (hookArguments) {
    const hookArgumentsAsKey = makeCustomHookIdentifierFromArgs(hookArguments);
    // Create object from the hook with argument
    const mapToBeSet = new Map<string, ObjectToCustomHookContainerMap>(mapObj.get(hookName)?.entries());
    if (removeEntry) {
      mapToBeSet.delete(hookArgumentsAsKey);
    } else {
      mapToBeSet.set(hookArgumentsAsKey, {
        count: (mapObj.get(hookName)?.get(hookArgumentsAsKey)?.count || 0) + delta,
        version: (mapObj.get(hookName)?.get(hookArgumentsAsKey)?.version || 0) + 1,
        hookArguments,
      });
    }

    // Create new map with argument
    const newMap = new Map<string, Map<string, ObjectToCustomHookContainerMap>>(mapObj.entries());
    newMap.set(hookName, mapToBeSet);
    return newMap;
  } return mapObj;
};

const updateHookUsage = (
  setHookUtilizationCount: React.Dispatch<React.SetStateAction<Map<string, EssentialHookInformation>>>,
  setSubscriptionHookWithArgumentUtilizationCount: React.Dispatch<
    React.SetStateAction<Map<string, Map<string, ObjectToCustomSubscriptionHookContainerMap>>>>,
  setQueryHookWithArgumentUtilizationCount: React.Dispatch<
  React.SetStateAction<Map<string, Map<string, ObjectToCustomQueryHookContainerMap>>>>,
  hookName: string, delta: number, hookArguments?: DataConsumptionArguments,
): void => {
  if (hookName !== DataConsumptionHooks.CUSTOM_SUBSCRIPTION
    && hookName !== DataConsumptionHooks.CUSTOM_QUERY) {
    setHookUtilizationCount((mapObj) => {
      const newMap = new Map<string, EssentialHookInformation>(mapObj.entries());
      newMap.set(hookName, {
        count: (mapObj.get(hookName)?.count || 0) + delta,
        version: (mapObj.get(hookName)?.version || 0) + 1,
      });
      return newMap;
    });
  } else if (hookName === DataConsumptionHooks.CUSTOM_QUERY) {
    setQueryHookWithArgumentUtilizationCount((mapObj) => hookUsageSetStateCallback(
      false, mapObj, hookName, delta, hookArguments,
    ));
  } else {
    setSubscriptionHookWithArgumentUtilizationCount((mapObj) => hookUsageSetStateCallback(
      false, mapObj, hookName, delta, hookArguments,
    ));
  }
};

const deleteDataConsumptionHookEntry = (
  setDataConsumptionHookWithArgumentUtilizationCount: React.Dispatch<
    React.SetStateAction<Map<string, Map<string, ObjectToCustomSubscriptionHookContainerMap>>>>,
  hookName: string, hookArguments?: DataConsumptionArguments,
) => {
  setDataConsumptionHookWithArgumentUtilizationCount((mapObj) => hookUsageSetStateCallback(
    true, mapObj, hookName, 0, hookArguments,
  ));
};

export { updateHookUsage, deleteDataConsumptionHookEntry };
