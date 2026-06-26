import { useEffect } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { GeneralHookManagerProps } from '../../types';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import useTimer from '/imports/ui/core/hooks/useTimer';
import formatTimerResponseFromGraphql from './utils';

const TimerHookContainer = (prop: GeneralHookManagerProps) => {
  const timerData = useTimer({ enableNotifications: true, isIndicator: false });

  const { version } = prop;
  const previousVersion = usePreviousValue(version);

  const updateTimerForPlugin = () => {
    window.dispatchEvent(new CustomEvent<
      UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.TimerData>>
    >(HookEvents.BBB_CORE_SENT_NEW_DATA, {
      detail: {
        data: formatTimerResponseFromGraphql(timerData),
        hook: DataConsumptionHooks.TIMER,
      },
    }));
  };

  useEffect(() => {
    const previousVersionValue = previousVersion ?? 0;
    if (version > previousVersionValue) {
      updateTimerForPlugin();
    }
  }, [version]);

  useEffect(() => {
    updateTimerForPlugin();
  }, [timerData]);

  return null;
};

export default TimerHookContainer;
