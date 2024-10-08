import { useEffect, useState } from 'react';
import useCurrentPresentation from '/imports/ui/core/hooks/useCurrentPresentation';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { SubscribedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

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
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: formattedCurrentPresentation,
            hook: DataConsumptionHooks.CURRENT_PRESENTATION,
          },
        },
      ),
    );
  };

  useEffect(() => {
    updatePresentationForPlugin();
  }, [currentPresentation, sendSignal]);

  useEffect(() => {
    const updateHookUseCurrentPresentation = ((event: CustomEvent<SubscribedEventDetails>) => {
      if (event.detail.hook === DataConsumptionHooks.CURRENT_PRESENTATION) setSendSignal((signal) => !signal);
    }) as EventListener;
    window.addEventListener(
      HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseCurrentPresentation,
    );
    return () => {
      window.removeEventListener(
        HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseCurrentPresentation,
      );
    };
  }, []);

  return null;
};

export default CurrentPresentationHookContainer;
