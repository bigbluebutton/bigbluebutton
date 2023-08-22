import React, { useEffect, useState } from 'react';
import CurrentPresentationHookContainer from './use-current-presentation/container'
import LoadedUserListContainer from './use-loaded-user-list/container'
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const PluginHooksHandlerContainer = () => {
  const [numberOfActiveCurrentPresentationHookSubscriptions,
    setNumberOfActiveCurrentPresentationHookSubscriptions] = useState(0);

  const [numberOfActiveLoadedUserListHookSubscriptions,
    setNumberOfActiveLoadedUserListHookSubscriptions] = useState(0);

  useEffect(() => {
    const subscribeHandler: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        switch (event.detail.hook) {
          case PluginSdk.Internal.BbbHooks.UseCurrentPresentation:
            setNumberOfActiveCurrentPresentationHookSubscriptions((c) => c + 1);
            break;
          case PluginSdk.Internal.BbbHooks.UseLoadedUserList:
            setNumberOfActiveLoadedUserListHookSubscriptions((c) => c + 1);
            break;
          default:
            break;
        }
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        switch (event.detail.hook) {
          case PluginSdk.Internal.BbbHooks.UseCurrentPresentation:
            setNumberOfActiveCurrentPresentationHookSubscriptions((c) => c - 1);
            break;
          case PluginSdk.Internal.BbbHooks.UseLoadedUserList:
            setNumberOfActiveLoadedUserListHookSubscriptions((c) => c - 1);
            break;
          default:
            break;
        }
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
      { numberOfActiveCurrentPresentationHookSubscriptions > 0 ?
        <CurrentPresentationHookContainer /> : null }
      { numberOfActiveLoadedUserListHookSubscriptions > 0 ?
        <LoadedUserListContainer /> : null }
    </>
  );
};

export default PluginHooksHandlerContainer
