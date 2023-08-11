import React, { useEffect, useState } from 'react';
import CurrentPresentationHookContainer from './use-current-presentation/container'
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const PluginHooksHandlerContainer = () => {

  const [countCurrentPresentationHookActive, setCountCurrentPresentationHookActive ] = useState(0)

  useEffect(() => {
    const newSubscriberHandler: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        switch(event.detail.hook){
          case PluginSdk.Internal.BbbHooks.UseCurrentPresentation:
            setCountCurrentPresentationHookActive((c) => c + 1)
            break;
        }
      }) as EventListener;
    const unsubscribeHandler: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        switch(event.detail.hook){
          case PluginSdk.Internal.BbbHooks.UseCurrentPresentation:
            setCountCurrentPresentationHookActive((c) => c - 1)
            break;
        }
      }) as EventListener;

    window.addEventListener(PluginSdk.Internal.BbbHookEvents.NewSubscriber, newSubscriberHandler);
    window.addEventListener(PluginSdk.Internal.BbbHookEvents.Unsubscribe, unsubscribeHandler );
    return () => {
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.NewSubscriber, newSubscriberHandler);
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.Unsubscribe, unsubscribeHandler);
    }
  }, [])
  
  return (
    <>
      { countCurrentPresentationHookActive > 0 ?
        <CurrentPresentationHookContainer /> : null }
    </>
  );
};

export default PluginHooksHandlerContainer
