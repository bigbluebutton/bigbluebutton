import React, { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import CurrentPresentationHookContainer from './use-current-presentation/container'
import LoadedUserListHookContainer from './use-loaded-user-list/container'

const hooksMap:{
  [key: string]: React.FunctionComponent
} = {
  [PluginSdk.Internal.BbbHooks.UseCurrentPresentation]: CurrentPresentationHookContainer,
  [PluginSdk.Internal.BbbHooks.UseLoadedUserList]: LoadedUserListHookContainer,
};

const PluginHooksHandlerContainer: React.FC = () => {
  const [
    hookUtilizationCount,
    setHookUtilizationCount,
  ] = useState(new Map<string, number>());

  useEffect(() => {
    const updateHookUsage = (hookName: string, delta: number):void => {
      setHookUtilizationCount((mapObj) => {
        const newMap = new Map<string, number>(mapObj.entries());
        newMap.set(hookName, (mapObj.get(hookName) || 0) + delta);
        return newMap;
      });
    };

    const subscribeHandler: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        updateHookUsage(event.detail.hook, 1);
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        updateHookUsage(event.detail.hook, -1);
      }) as EventListener;

    window.addEventListener(PluginSdk.Internal.BbbHookEvents.Subscribe, subscribeHandler);
    window.addEventListener(PluginSdk.Internal.BbbHookEvents.Unsubscribe, unsubscribeHandler);
    return () => {
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.Subscribe, subscribeHandler);
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.Unsubscribe, unsubscribeHandler);
    };
  }, []);

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
    </>
  );
};

export default PluginHooksHandlerContainer;
