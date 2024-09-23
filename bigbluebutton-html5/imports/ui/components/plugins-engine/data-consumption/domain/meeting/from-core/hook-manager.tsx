import { useEffect, useRef, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { SubscribedEventDetails, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { equals } from 'ramda';
import formatMeetingResponseFromGraphql from './utils';
import { GeneralHookManagerProps } from '../../../types';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { Meeting } from '/imports/ui/Types/meeting';

const MeetingHookContainer: React.FunctionComponent<
  GeneralHookManagerProps<GraphqlDataHookSubscriptionResponse<Partial<Meeting>>>
> = (
  props: GeneralHookManagerProps<GraphqlDataHookSubscriptionResponse<Partial<Meeting>>>,
) => {
  const [sendSignal, setSendSignal] = useState(false);
  const previousMeeting = useRef<GraphqlDataHookSubscriptionResponse<Partial<Meeting>> | null>(null);

  const { data: meeting } = props;

  const updateMeetingForPlugin = () => {
    const meetingProjection: PluginSdk.GraphqlResponseWrapper<
    PluginSdk.Meeting> = formatMeetingResponseFromGraphql(
      meeting,
    );
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.Meeting>>>(
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: meetingProjection,
            hook: DataConsumptionHooks.MEETING,
          },
        },
      ),
    );
  };
  useEffect(() => {
    if (!equals(previousMeeting.current, meeting)) {
      previousMeeting.current = meeting;
      updateMeetingForPlugin();
    }
  }, [meeting]);
  useEffect(() => {
    updateMeetingForPlugin();
  }, [sendSignal]);
  useEffect(() => {
    const updateHookUseCurrentMeeting = ((event: CustomEvent<SubscribedEventDetails>) => {
      if (event.detail.hook === DataConsumptionHooks.MEETING) setSendSignal((signal) => !signal);
    }) as EventListener;
    window.addEventListener(
      HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseCurrentMeeting,
    );
    return () => {
      window.removeEventListener(
        HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseCurrentMeeting,
      );
    };
  }, []);

  return null;
};

export default MeetingHookContainer;
