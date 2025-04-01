import { useEffect, useRef } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';

import { equals } from 'ramda';
import formatCurrentUserResponseFromGraphql from './utils';
import { User } from '/imports/ui/Types/user';
import { GeneralHookManagerProps } from '../../../types';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';

const CurrentUserHookContainer: React.FunctionComponent<
  GeneralHookManagerProps<GraphqlDataHookSubscriptionResponse<Partial<User>>>
> = (
  props: GeneralHookManagerProps<GraphqlDataHookSubscriptionResponse<Partial<User>>>,
) => {
  const previousCurrentUser = useRef<GraphqlDataHookSubscriptionResponse<Partial<User>> | null>(null);

  const { data: currentUser, numberOfUses } = props;
  const previousNumberOfUses = usePreviousValue(numberOfUses);
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
    const previousNumberOfUsesValue = previousNumberOfUses || 0;
    if (numberOfUses > previousNumberOfUsesValue) {
      updateUserForPlugin();
    }
  }, [numberOfUses]);

  return null;
};

export default CurrentUserHookContainer;
