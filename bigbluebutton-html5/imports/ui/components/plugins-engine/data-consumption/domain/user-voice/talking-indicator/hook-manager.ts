import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import formatTalkingIndicatorDataFromGraphql from './utils';
import { UserVoice } from '/imports/ui/Types/userVoice';
import useTalkingIndicator from '/imports/ui/core/hooks/useTalkingIndicator';

const TalkingIndicatorHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);
  const userVoice: GraphqlDataHookSubscriptionResponse<Partial<UserVoice>[]> = useTalkingIndicator(
    (uv: Partial<UserVoice>) => ({
      talking: uv.talking,
      startTime: uv.startTime,
      muted: uv.muted,
      userId: uv.userId,
    }) as Partial<UserVoice>,
  );

  const updateTalkingIndicatorForPlugin = () => {
    window.dispatchEvent(new CustomEvent<
      UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.UserVoice>>
    >(HookEvents.UPDATED, {
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
    const updateHookUseTalkingIndicator = () => {
      setSendSignal(!sendSignal);
    };
    window.addEventListener(
      HookEvents.SUBSCRIBED, updateHookUseTalkingIndicator,
    );
    return () => {
      window.removeEventListener(
        HookEvents.SUBSCRIBED, updateHookUseTalkingIndicator,
      );
    };
  }, []);

  return null;
};

export default TalkingIndicatorHookContainer;
