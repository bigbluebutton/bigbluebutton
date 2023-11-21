import { useEffect, useState } from 'react';
import useCurrentPresentation from '/imports/ui/core/hooks/useCurrentPresentation';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { CurrentPresentation } from '/imports/ui/Types/presentation';
import formatCurrentPresentation from './utils';

const CurrentPresentationHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);

  const currentPresentation = useCurrentPresentation(
    (currentPresentationData: Partial<CurrentPresentation>) => currentPresentationData,
  );

  const updatePresentationForPlugin = () => {
    const formattedCurrentPresentation:
      PluginSdk.GraphqlResponseWrapper<PluginSdk.CurrentPresentation> = formatCurrentPresentation(
        currentPresentation,
      );

    window.dispatchEvent(
      new CustomEvent(
        PluginSdk.HookEvents.UPDATED,
        {
          detail: {
            data: formattedCurrentPresentation,
            hook: PluginSdk.Hooks.CURRENT_PRESENTATION,
          },
        },
      ),
    );
  };

  useEffect(() => {
    updatePresentationForPlugin();
  }, [currentPresentation, sendSignal]);

  useEffect(() => {
    const updateHookUseCurrentPresentation = () => {
      setSendSignal(!sendSignal);
    };
    window.addEventListener(
      PluginSdk.HookEvents.SUBSCRIBED, updateHookUseCurrentPresentation,
    );
    return () => {
      window.removeEventListener(
        PluginSdk.HookEvents.SUBSCRIBED, updateHookUseCurrentPresentation,
      );
    };
  }, []);

  return null;
};

export default CurrentPresentationHookContainer;
