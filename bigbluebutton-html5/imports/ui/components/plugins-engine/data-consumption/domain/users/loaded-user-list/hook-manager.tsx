import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import {
  Hooks, HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import formatLoadedUserListDataFromGraphql from './utils';
import useLoadedUserList from '/imports/ui/core/hooks/useLoadedUserList';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

const LoadedUserListHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);
  const usersData: GraphqlDataHookSubscriptionResponse<Partial<User>[]> = useLoadedUserList((user: Partial<User>) => ({
    userId: user.userId,
    name: user.name,
    role: user.role,
  }));

  const updateLoadedUserListForPlugin = () => {
    window.dispatchEvent(new CustomEvent<
      UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.LoadedUserListData>>
    >(HookEvents.UPDATED, {
      detail: {
        data: formatLoadedUserListDataFromGraphql(usersData),
        hook: Hooks.LOADED_USER_LIST,
      },
    }));
  };

  useEffect(() => {
    updateLoadedUserListForPlugin();
  }, [usersData, sendSignal]);

  useEffect(() => {
    const updateHookUseLoadedUserList = () => {
      setSendSignal(!sendSignal);
    };
    window.addEventListener(
      HookEvents.SUBSCRIBED, updateHookUseLoadedUserList,
    );
    return () => {
      window.removeEventListener(
        HookEvents.SUBSCRIBED, updateHookUseLoadedUserList,
      );
    };
  }, []);

  return null;
};

export default LoadedUserListHookContainer;
