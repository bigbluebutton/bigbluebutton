import { useEffect, useState } from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import {
  Hooks, HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';

import formatCurrentUserResponseFromGraphql from './utils';

const CurrentUserHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);

  const currentUser = useCurrentUser(
    (currentUser: Partial<User>) => ({
      userId: currentUser.userId,
      name: currentUser.name,
      role: currentUser.role,
      presenter: currentUser.presenter,
    }),
  );

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
            hook: Hooks.CURRENT_USER,
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
