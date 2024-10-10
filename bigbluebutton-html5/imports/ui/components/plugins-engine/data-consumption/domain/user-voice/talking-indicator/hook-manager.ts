import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { SubscribedEventDetails, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import formatTalkingIndicatorDataFromGraphql from './utils';
import { UserVoice } from '/imports/ui/Types/userVoice';
import { useTalkingIndicatorList } from '/imports/ui/core/hooks/useTalkingIndicator';

const TalkingIndicatorHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);
  const [userVoice] = useTalkingIndicatorList(
    (uv: Partial<UserVoice>) => ({
      talking: uv.talking,
      startTime: uv.startTime,
      muted: uv.muted,
      userId: uv.userId,
    }) as Partial<UserVoice>,
  );

  const updateTalkingIndicatorForPlugin = () => {
    window.dispatchEvent(new CustomEvent<
      UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.UserVoice[]>>
    >(HookEvents.BBB_CORE_SENT_NEW_DATA, {
      detail: {
        data: formatTalkingIndicatorDataFromGraphql(userVoice),
        hook: DataConsumptionHooks.TALKING_INDICATOR,
      },
    }));
  };

  useEffect(() => {
    updateTalkingIndicatorForPlugin();
  }, [userVoice, sendSignal]);

  useEffect(() => {
    const updateHookUseTalkingIndicator = ((event: CustomEvent<SubscribedEventDetails>) => {
      if (event.detail.hook === DataConsumptionHooks.TALKING_INDICATOR) setSendSignal((signal) => !signal);
    }) as EventListener;
    window.addEventListener(
      HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseTalkingIndicator,
    );
    return () => {
      window.removeEventListener(
        HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseTalkingIndicator,
      );
    };
  }, []);

  return null;
};

export default TalkingIndicatorHookContainer;
