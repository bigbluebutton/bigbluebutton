import React, { useEffect, useState } from 'react';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { HookEventWrapper } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { DomElementManipulationHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/enums';

import ChatMessageDomElementManipulationHookManager from './chat/message/hook-manager';

const hooksMap:{
  [key: string]: React.FunctionComponent
} = {
  [DomElementManipulationHooks.CHAT_MESSAGE]: ChatMessageDomElementManipulationHookManager,
};

const PluginDomElementManipulationManager: React.FC = () => {
  const [
    hookUtilizationCount,
    setHookUtilizationCount,
  ] = useState(new Map<string, number>());

  useEffect(() => {
    const updateHookUsage = (
      hookName: string, delta: number,
    ): void => {
      setHookUtilizationCount((mapObj) => {
        const newMap = new Map<string, number>(mapObj.entries());
        newMap.set(hookName, (mapObj.get(hookName) || 0) + delta);
        return newMap;
      });
    };

    const subscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        updateHookUsage(event.detail.hook, 1);
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: HookEventWrapper<void>) => {
        updateHookUsage(event.detail.hook, -1);
      }) as EventListener;

    window.addEventListener(HookEvents.SUBSCRIBED, subscribeHandler);
    window.addEventListener(HookEvents.UNSUBSCRIBED, unsubscribeHandler);
    return () => {
      window.removeEventListener(HookEvents.SUBSCRIBED, subscribeHandler);
      window.removeEventListener(HookEvents.UNSUBSCRIBED, unsubscribeHandler);
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

export default PluginDomElementManipulationManager;
