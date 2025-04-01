import { useEffect } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import formatTalkingIndicatorDataFromGraphql from './utils';
import { UserVoice } from '/imports/ui/Types/userVoice';
import { useTalkingIndicatorList } from '/imports/ui/core/hooks/useTalkingIndicator';
import { GeneralHookManagerProps } from '../../../types';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';

const TalkingIndicatorHookContainer = (props: GeneralHookManagerProps) => {
  const [userVoice] = useTalkingIndicatorList(
    (uv: Partial<UserVoice>) => ({
      talking: uv.talking,
      startTime: uv.startTime,
      muted: uv.muted,
      userId: uv.userId,
    }) as Partial<UserVoice>,
  );

  const { numberOfUses } = props;
  const previousNumberOfUses = usePreviousValue(numberOfUses);

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
    const previousNumberOfUsesValue = previousNumberOfUses || 0;
    if (numberOfUses > previousNumberOfUsesValue) {
      updateTalkingIndicatorForPlugin();
    }
  }, [numberOfUses]);
  useEffect(() => {
    updateTalkingIndicatorForPlugin();
  }, [userVoice]);

  return null;
};

export default TalkingIndicatorHookContainer;
