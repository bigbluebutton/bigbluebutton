/* eslint-disable no-undef */
// Rule applied because EventListener is not undefined at all times.
import React, { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import LoadedUserListHookContainer from '../domain/users/use-loaded-user-list/container';
import CurrentUserHookContainer from '../domain/users/use-current-user/container';
import CustomSubscriptionHookContainer from '../domain/shared/custom-subscription/container';

import { ObjectToCustomHookContainerMap, HookWithArgumentsContainerProps, HookWithArgumentContainerToRender } from '../domain/shared/custom-subscription/types';
import CurrentPresentationHookContainer from '../domain/presentations/use-current-presentation/container';

const hooksMap:{
  [key: string]: React.FunctionComponent
} = {
  [PluginSdk.Hooks.LOADED_USER_LIST]: LoadedUserListHookContainer,
  [PluginSdk.Hooks.CURRENT_USER]: CurrentUserHookContainer,
  [PluginSdk.Hooks.CURRENT_PRESENTATION]: CurrentPresentationHookContainer,
};

const HooksMapWithArguments:{
  [key: string]: React.FunctionComponent<HookWithArgumentsContainerProps>
} = {
  [PluginSdk.Hooks.CUSTOM_SUBSCRIPTION]: CustomSubscriptionHookContainer,
};

const PluginHooksHandlerContainer: React.FC = () => {
  const [
    hookUtilizationCount,
    setHookUtilizationCount,
  ] = useState(new Map<string, number>());

  const [
    hookWithArgumentUtilizationCount,
    setHookWithArgumentUtilizationCount,
  ] = useState(new Map<string, Map<string, ObjectToCustomHookContainerMap>>());

  useEffect(() => {
    const updateHookUsage = (
      hookName: string, delta: number, hookArguments?: PluginSdk.CustomSubscriptionArguments,
    ): void => {
      if (hookName !== PluginSdk.Hooks.CUSTOM_SUBSCRIPTION) {
        setHookUtilizationCount((mapObj) => {
          const newMap = new Map<string, number>(mapObj.entries());
          newMap.set(hookName, (mapObj.get(hookName) || 0) + delta);
          return newMap;
        });
      } else {
        setHookWithArgumentUtilizationCount((mapObj) => {
          if (hookArguments) {
            const hookArgumentsAsKey = PluginSdk.makeCustomHookIdentifierFromArgs(hookArguments);
            // Create object from the hook with argument
            const mapToBeSet = new Map<string, ObjectToCustomHookContainerMap>(mapObj.get(hookName)?.entries());
            mapToBeSet.set(hookArgumentsAsKey, {
              count: (mapObj.get(hookName)?.get(hookArgumentsAsKey)?.count || 0) + delta,
              hookArguments,
            } as ObjectToCustomHookContainerMap);

            // Create new map with argument
            const newMap = new Map<string, Map<string, ObjectToCustomHookContainerMap>>(mapObj.entries());
            newMap.set(hookName, mapToBeSet);
            return newMap;
          } return mapObj;
        });
      }
    };

    const subscribeHandler: EventListener = (
      (event: PluginSdk.HookEventWrapper<void>) => {
        let hookArguments: PluginSdk.CustomSubscriptionArguments | undefined;
        if (event.detail.hook === PluginSdk.Hooks.CUSTOM_SUBSCRIPTION) {
          const detail = event.detail as PluginSdk.SubscribedEventDetails;
          hookArguments = detail.hookArguments as PluginSdk.CustomSubscriptionArguments;
        }
        updateHookUsage(event.detail.hook, 1, hookArguments);
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: PluginSdk.HookEventWrapper<void>) => {
        let hookArguments: PluginSdk.CustomSubscriptionArguments | undefined;
        if (event.detail.hook === PluginSdk.Hooks.CUSTOM_SUBSCRIPTION) {
          const detail = event.detail as PluginSdk.SubscribedEventDetails;
          hookArguments = detail.hookArguments as PluginSdk.CustomSubscriptionArguments;
        }
        updateHookUsage(event.detail.hook, -1, hookArguments);
      }) as EventListener;

    window.addEventListener(PluginSdk.HookEvents.SUBSCRIBED, subscribeHandler);
    window.addEventListener(PluginSdk.HookEvents.UNSUBSCRIBED, unsubscribeHandler);
    return () => {
      window.removeEventListener(PluginSdk.HookEvents.SUBSCRIBED, subscribeHandler);
      window.removeEventListener(PluginSdk.HookEvents.UNSUBSCRIBED, unsubscribeHandler);
    };
  }, []);

  const HooksWithArgumentContainerToRun: HookWithArgumentContainerToRender[] = [];
  Object.keys(HooksMapWithArguments).forEach((hookName) => {
    if (hookWithArgumentUtilizationCount.get(hookName)) {
      hookWithArgumentUtilizationCount.get(hookName)?.forEach((object) => {
        if (object.count > 0) {
          HooksWithArgumentContainerToRun.push({
            componentToRender: HooksMapWithArguments[hookName],
            hookArguments: object.hookArguments,
          });
        }
      });
    }
  });

  return (
    <>
      {
        Object.keys(hooksMap)
          .filter((hookName: string) => hookUtilizationCount.get(hookName)
            && hookUtilizationCount.get(hookName)! > 0)
          .map((hookName: string) => {
            const HookComponent = hooksMap[hookName];
            return <HookComponent key={hookName} />;
          })
      }
      {
        HooksWithArgumentContainerToRun.map((hookWithArguments) => {
          const HookComponent = hookWithArguments.componentToRender;
          return (
            <HookComponent
              key={PluginSdk.makeCustomHookIdentifierFromArgs(hookWithArguments.hookArguments)}
              hookArguments={hookWithArguments.hookArguments}
            />
          );
        })
      }
    </>
  );
};

export default PluginHooksHandlerContainer;
