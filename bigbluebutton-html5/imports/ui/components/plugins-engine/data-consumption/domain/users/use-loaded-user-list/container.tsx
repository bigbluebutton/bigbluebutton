import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { User } from '/imports/ui/Types/user';
import { Hooks } from 'bigbluebutton-html-plugin-sdk';
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
      PluginSdk.UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<PluginSdk.LoadedUserListData>>
    >(PluginSdk.HookEvents.UPDATED, {
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
      PluginSdk.HookEvents.SUBSCRIBED, updateHookUseLoadedUserList,
    );
    return () => {
      window.removeEventListener(
        PluginSdk.HookEvents.SUBSCRIBED, updateHookUseLoadedUserList,
      );
    };
  }, []);

  return null;
};

export default LoadedUserListHookContainer;
