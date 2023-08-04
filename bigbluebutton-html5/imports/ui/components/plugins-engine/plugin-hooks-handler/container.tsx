import React, { useEffect, useState } from 'react';
import CurrentPresentationHookContainer from './use-current-presentation/container'
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

const PluginHooksHandlerContainer = () => {

  const [countCurrentPresentationHookActive, setCountCurrentPresentationHookActive ] = useState(0)

  useEffect(() => {
    const handleNewSubscriber: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        switch(event.detail.hook){
          case PluginSdk.Internal.BbbHooks.UseCurrentPresentation:
            setCountCurrentPresentationHookActive((c) => c + 1)
            break;
        }
      }) as EventListener;
    const handleUnsubscribe: EventListener = (
      (event: PluginSdk.CustomEventHookWrapper<void>) => {
        switch(event.detail.hook){
          case PluginSdk.Internal.BbbHooks.UseCurrentPresentation:
            setCountCurrentPresentationHookActive((c) => c - 1)
            break;
        }
      }) as EventListener;

    window.addEventListener(PluginSdk.Internal.BbbHookEvents.NewSubscriber, handleNewSubscriber as EventListener);
    window.addEventListener(PluginSdk.Internal.BbbHookEvents.Unsubscribe, handleUnsubscribe as EventListener);
    return () => {
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.NewSubscriber, handleNewSubscriber as EventListener);
      window.removeEventListener(PluginSdk.Internal.BbbHookEvents.Unsubscribe, handleUnsubscribe as EventListener);
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
