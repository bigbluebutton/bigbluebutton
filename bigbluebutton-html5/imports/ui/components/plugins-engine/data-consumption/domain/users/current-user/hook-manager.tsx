import { useEffect, useRef, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { SubscribedEventDetails, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { equals } from 'ramda';
import formatCurrentUserResponseFromGraphql from './utils';
import { User } from '/imports/ui/Types/user';
import { GeneralHookManagerProps } from '../../../types';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

const CurrentUserHookContainer: React.FunctionComponent<
  GeneralHookManagerProps<GraphqlDataHookSubscriptionResponse<Partial<User>>>
> = (
  props: GeneralHookManagerProps<GraphqlDataHookSubscriptionResponse<Partial<User>>>,
) => {
  const [sendSignal, setSendSignal] = useState(false);
  const previousCurrentUser = useRef<GraphqlDataHookSubscriptionResponse<Partial<User>> | null>(null);

  const { data: currentUser } = props;

  const updateUserForPlugin = () => {
    const currentUserProjection: PluginSdk.GraphqlResponseWrapper<
    PluginSdk.CurrentUserData> = formatCurrentUserResponseFromGraphql(
      currentUser,
    );
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.CurrentUserData>>>(
        HookEvents.BBB_CORE_SENT_NEW_DATA,
        {
          detail: {
            data: currentUserProjection,
            hook: DataConsumptionHooks.CURRENT_USER,
          },
        },
      ),
    );
  };
  useEffect(() => {
    if (!equals(previousCurrentUser.current, currentUser)) {
      previousCurrentUser.current = currentUser;
      updateUserForPlugin();
    }
  }, [currentUser]);
  useEffect(() => {
    updateUserForPlugin();
  }, [sendSignal]);
  useEffect(() => {
    const updateHookUseCurrentUser = ((event: CustomEvent<SubscribedEventDetails>) => {
      if (event.detail.hook === DataConsumptionHooks.CURRENT_USER) setSendSignal((signal) => !signal);
    }) as EventListener;
    window.addEventListener(
      HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseCurrentUser,
    );
    return () => {
      window.removeEventListener(
        HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseCurrentUser,
      );
    };
  }, []);

  return null;
};

export default CurrentUserHookContainer;
