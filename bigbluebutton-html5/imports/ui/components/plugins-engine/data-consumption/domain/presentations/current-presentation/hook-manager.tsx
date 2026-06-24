import { useEffect } from 'react';
import useCurrentPresentation from '/imports/ui/core/hooks/useCurrentPresentation';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { CurrentPresentation } from '/imports/ui/Types/presentation';
import formatCurrentPresentation from './utils';
import { GeneralHookManagerProps } from '../../../types';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';

const CurrentPresentationHookContainer = (props: GeneralHookManagerProps) => {
  const currentPresentation = useCurrentPresentation(
    (currentPresentationData: Partial<CurrentPresentation>) => currentPresentationData,
  );

  const { version } = props;
  const previousVersion = usePreviousValue(version);

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
    const previousVersionValue = previousVersion ?? 0;
    if (version > previousVersionValue) {
      updatePresentationForPlugin();
    }
  }, [version]);

  useEffect(() => {
    updatePresentationForPlugin();
  }, [currentPresentation]);

  return null;
};

export default CurrentPresentationHookContainer;
