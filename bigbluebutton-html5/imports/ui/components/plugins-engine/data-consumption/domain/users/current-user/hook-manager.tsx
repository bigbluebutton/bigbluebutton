import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

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

  const { data: currentUser } = props;

  const updateUserForPlugin = () => {
    const currentUserProjection: PluginSdk.GraphqlResponseWrapper<
    PluginSdk.CurrentUserData> = formatCurrentUserResponseFromGraphql(
      currentUser,
    );
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.CurrentUserData>>>(
        HookEvents.UPDATED,
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
    updateUserForPlugin();
  }, [currentUser, sendSignal]);

  useEffect(() => {
    const updateHookUseCurrentUser = () => {
      setSendSignal(!sendSignal);
    };
    window.addEventListener(
      HookEvents.SUBSCRIBED, updateHookUseCurrentUser,
    );
    return () => {
      window.removeEventListener(
        HookEvents.SUBSCRIBED, updateHookUseCurrentUser,
      );
    };
  }, []);

  return null;
};

export default CurrentUserHookContainer;
